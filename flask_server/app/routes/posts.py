import os
import uuid
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

from app.auth_jwt import require_auth
from app.db import posts as posts_col, users as users_col
from app.json_util import post_json

bp = Blueprint("posts", __name__, url_prefix="/api/posts")


def _upload_dir():
    return current_app.config["UPLOAD_FOLDER"]


def _allowed_upload(file_storage):
    ct = file_storage.content_type or ""
    return ct.startswith("image/") or ct.startswith("video/")


@bp.post("/upload")
@require_auth
def upload_media():
    from flask import g

    if "media" not in request.files:
        return jsonify({"message": "No file uploaded."}), 400
    f = request.files["media"]
    if not f or not f.filename:
        return jsonify({"message": "No file uploaded."}), 400
    if not _allowed_upload(f):
        return jsonify({"message": "Only image and video files are allowed!"}), 400
    ext = os.path.splitext(secure_filename(f.filename))[1] or ""
    name = f"{int(datetime.now(timezone.utc).timestamp() * 1000)}-{uuid.uuid4().hex}{ext}"
    path = os.path.join(_upload_dir(), name)
    os.makedirs(_upload_dir(), exist_ok=True)
    f.save(path)
    return jsonify({"url": f"/uploads/{name}"}), 201


@bp.post("/")
@require_auth
def create_post():
    from flask import g

    data = request.get_json(silent=True) or {}
    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"message": "Post content is required."}), 400
    media = data.get("media") or []
    now = datetime.now(timezone.utc)
    doc = {
        "content": content,
        "media": media,
        "author": ObjectId(g.current_user_id),
        "postType": "text",
        "tags": [],
        "mentions": [],
        "status": "published",
        "likes": [],
        "comments": [],
        "commentsCount": 0,
        "likesCount": 0,
        "createdAt": now,
        "updatedAt": now,
    }
    coll = posts_col()
    result = coll.insert_one(doc)
    saved = coll.find_one({"_id": result.inserted_id})
    authors = {}
    aid = saved.get("author")
    if aid:
        u = users_col().find_one({"_id": aid})
        if u:
            authors[str(aid)] = u
    return jsonify(post_json(saved, authors)), 201


@bp.get("/")
def get_all_posts():
    coll = posts_col()
    post_list = list(coll.find().sort("createdAt", -1))
    author_ids = list({p["author"] for p in post_list if p.get("author")})
    authors = {}
    if author_ids:
        for u in users_col().find({"_id": {"$in": author_ids}}):
            authors[str(u["_id"])] = u
    return jsonify([post_json(p, authors) for p in post_list])


@bp.put("/<post_id>")
@require_auth
def update_post(post_id):
    from flask import g

    try:
        pid = ObjectId(post_id)
    except InvalidId:
        return jsonify({"message": "Post not found."}), 404
    data = request.get_json(silent=True) or {}
    coll = posts_col()
    post = coll.find_one({"_id": pid})
    if not post:
        return jsonify({"message": "Post not found."}), 404
    if str(post["author"]) != g.current_user_id:
        return jsonify({"message": "Unauthorized."}), 403
    update = {}
    if "content" in data:
        update["content"] = data["content"]
    if "media" in data:
        update["media"] = data["media"]
    update["updatedAt"] = datetime.now(timezone.utc)
    if update:
        coll.update_one({"_id": pid}, {"$set": update})
    updated = coll.find_one({"_id": pid})
    authors = {}
    aid = updated.get("author")
    if aid:
        u = users_col().find_one({"_id": aid})
        if u:
            authors[str(aid)] = u
    return jsonify(post_json(updated, authors))


@bp.delete("/<post_id>")
@require_auth
def delete_post(post_id):
    from flask import g

    try:
        pid = ObjectId(post_id)
    except InvalidId:
        return jsonify({"message": "Post not found."}), 404
    coll = posts_col()
    post = coll.find_one({"_id": pid})
    if not post:
        return jsonify({"message": "Post not found."}), 404
    if str(post["author"]) != g.current_user_id:
        return jsonify({"message": "Unauthorized."}), 403
    coll.delete_one({"_id": pid})
    return jsonify({"message": "Post deleted successfully."})


@bp.post("/<post_id>/like")
@require_auth
def like_post(post_id):
    from flask import g

    try:
        pid = ObjectId(post_id)
    except InvalidId:
        return jsonify({"message": "Post not found."}), 404
    uid = ObjectId(g.current_user_id)
    coll = posts_col()
    post = coll.find_one({"_id": pid})
    if not post:
        return jsonify({"message": "Post not found."}), 404
    likes = post.get("likes") or []
    if uid in likes:
        return jsonify({"message": "Post already liked."}), 400
    coll.update_one({"_id": pid}, {"$addToSet": {"likes": uid}})
    post = coll.find_one({"_id": pid})
    n = len(post.get("likes") or [])
    return jsonify({"message": "Post liked.", "likesCount": n})


@bp.post("/<post_id>/comment")
@require_auth
def add_comment(post_id):
    from flask import g

    try:
        pid = ObjectId(post_id)
    except InvalidId:
        return jsonify({"message": "Post not found."}), 404
    data = request.get_json(silent=True) or {}
    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"message": "Comment content is required."}), 400
    coll = posts_col()
    post = coll.find_one({"_id": pid})
    if not post:
        return jsonify({"message": "Post not found."}), 404
    now = datetime.now(timezone.utc)
    comment = {
        "_id": ObjectId(),
        "author": ObjectId(g.current_user_id),
        "content": content,
        "likes": [],
        "parentCommentId": None,
        "status": "active",
        "createdAt": now,
    }
    coll.update_one(
        {"_id": pid},
        {"$push": {"comments": comment}, "$inc": {"commentsCount": 1}},
    )
    updated = coll.find_one({"_id": pid})
    authors = {}
    aid = updated.get("author")
    if aid:
        u = users_col().find_one({"_id": aid})
        if u:
            authors[str(aid)] = u
    return jsonify(post_json(updated, authors)), 201
