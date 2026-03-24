import os
import uuid
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

from app.auth_jwt import require_auth
from app.db import db
from app.json_util import post_doc_from_models
from app.models import Comment, Post, PostLike, User
from app.utils import parse_uuid

bp = Blueprint("posts", __name__, url_prefix="/api/posts")


def _upload_dir():
    return current_app.config["UPLOAD_FOLDER"]


def _allowed_upload(file_storage):
    ct = file_storage.content_type or ""
    return ct.startswith("image/") or ct.startswith("video/")


def _authors_for_posts(post_list):
    author_ids = {p.author_id for p in post_list if p.author_id}
    if not author_ids:
        return {}
    users = User.query.filter(User.id.in_(author_ids)).all()
    return {str(u.id): u for u in users}


def _post_json_response(post: Post):
    authors = _authors_for_posts([post])
    like_ids = [pl.user_id for pl in PostLike.query.filter_by(post_id=post.id).all()]
    return post_doc_from_models(post, authors, like_ids)


@bp.post("/upload")
@require_auth
def upload_media():
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
    uid = parse_uuid(g.current_user_id)
    now = datetime.now(timezone.utc)
    post = Post(
        content=content,
        media=media,
        author_id=uid,
        created_at=now,
        updated_at=now,
    )
    db.session.add(post)
    db.session.commit()
    db.session.refresh(post)
    return jsonify(_post_json_response(post)), 201


@bp.get("/")
def get_all_posts():
    post_list = Post.query.order_by(Post.created_at.desc()).all()
    authors = _authors_for_posts(post_list)
    out = []
    for p in post_list:
        like_ids = [pl.user_id for pl in PostLike.query.filter_by(post_id=p.id).all()]
        out.append(post_doc_from_models(p, authors, like_ids))
    return jsonify(out)


@bp.put("/<post_id>")
@require_auth
def update_post(post_id):
    from flask import g

    pid = parse_uuid(post_id)
    if not pid:
        return jsonify({"message": "Post not found."}), 404
    data = request.get_json(silent=True) or {}
    post = Post.query.get(pid)
    if not post:
        return jsonify({"message": "Post not found."}), 404
    if str(post.author_id) != g.current_user_id:
        return jsonify({"message": "Unauthorized."}), 403
    if "content" in data:
        post.content = data["content"]
    if "media" in data:
        post.media = data["media"]
    post.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    db.session.refresh(post)
    return jsonify(_post_json_response(post))


@bp.delete("/<post_id>")
@require_auth
def delete_post(post_id):
    from flask import g

    pid = parse_uuid(post_id)
    if not pid:
        return jsonify({"message": "Post not found."}), 404
    post = Post.query.get(pid)
    if not post:
        return jsonify({"message": "Post not found."}), 404
    if str(post.author_id) != g.current_user_id:
        return jsonify({"message": "Unauthorized."}), 403
    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted successfully."})


@bp.post("/<post_id>/like")
@require_auth
def like_post(post_id):
    from flask import g

    pid = parse_uuid(post_id)
    if not pid:
        return jsonify({"message": "Post not found."}), 404
    uid = parse_uuid(g.current_user_id)
    post = Post.query.get(pid)
    if not post:
        return jsonify({"message": "Post not found."}), 404
    if PostLike.query.filter_by(post_id=pid, user_id=uid).first():
        return jsonify({"message": "Post already liked."}), 400
    db.session.add(PostLike(post_id=pid, user_id=uid))
    post.likes_count = PostLike.query.filter_by(post_id=pid).count()
    db.session.commit()
    db.session.refresh(post)
    return jsonify({"message": "Post liked.", "likesCount": post.likes_count})


@bp.post("/<post_id>/comment")
@require_auth
def add_comment(post_id):
    from flask import g

    pid = parse_uuid(post_id)
    if not pid:
        return jsonify({"message": "Post not found."}), 404
    data = request.get_json(silent=True) or {}
    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"message": "Comment content is required."}), 400
    post = Post.query.get(pid)
    if not post:
        return jsonify({"message": "Post not found."}), 404
    now = datetime.now(timezone.utc)
    uid = parse_uuid(g.current_user_id)
    comment = Comment(
        post_id=pid,
        author_id=uid,
        content=content,
        created_at=now,
    )
    db.session.add(comment)
    db.session.flush()
    post.comments_count = Comment.query.filter_by(post_id=pid).count()
    db.session.commit()
    db.session.refresh(post)
    return jsonify(_post_json_response(post)), 201
