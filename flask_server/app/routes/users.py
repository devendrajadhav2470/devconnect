import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request, jsonify, current_app
from pymongo import ReturnDocument

from app.db import users as users_col
from app.auth_jwt import require_auth
from app.json_util import user_public

bp = Blueprint("users", __name__, url_prefix="/api/users")


def _jwt_for_user(user_doc):
    exp = datetime.now(timezone.utc) + timedelta(hours=current_app.config["JWT_EXPIRES_HOURS"])
    return jwt.encode(
        {
            "userId": str(user_doc["_id"]),
            "username": user_doc["username"],
            "exp": exp,
        },
        current_app.config["JWT_SECRET"],
        algorithm=current_app.config["JWT_ALGORITHM"],
    )


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    if not username or not email or not password:
        return jsonify({"message": "All fields are required."}), 400
    coll = users_col()
    if coll.find_one({"$or": [{"username": username}, {"email": email}]}):
        return jsonify({"message": "Username or email already exists."}), 409
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")
    doc = {
        "username": username,
        "email": email,
        "password": hashed,
        "bio": "",
        "image": "https://via.placeholder.com/150?text=User",
        "skills": [],
        "followers": [],
        "following": [],
        "status": "active",
        "roles": ["user"],
        "emailVerified": False,
        "profileVisibility": "public",
    }
    result = coll.insert_one(doc)
    uid = result.inserted_id
    return (
        jsonify(
            {
                "user": {
                    "id": str(uid),
                    "username": username,
                    "email": email,
                },
                "message": "User registered successfully.",
            }
        ),
        201,
    )


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400
    user = users_col().find_one({"email": email})
    if not user:
        return jsonify({"message": "Invalid credentials."}), 401
    if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"message": "Invalid credentials."}), 401
    token = _jwt_for_user(user)
    return jsonify(
        {
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
            },
            "message": "Login successful.",
        }
    )


@bp.get("/profile")
@require_auth
def get_profile():
    from flask import g

    user = users_col().find_one({"_id": ObjectId(g.current_user_id)})
    if not user:
        return jsonify({"message": "User not found."}), 404
    return jsonify(user_public(user))


@bp.put("/profile")
@require_auth
def update_profile():
    from flask import g

    data = request.get_json(silent=True) or {}
    bio = data.get("bio")
    image = data.get("image")
    skills = data.get("skills")
    update = {}
    if bio is not None:
        update["bio"] = bio
    if image is not None:
        update["image"] = image
    if skills is not None:
        update["skills"] = skills
    if not update:
        update = {}
    user = users_col().find_one_and_update(
        {"_id": ObjectId(g.current_user_id)},
        {"$set": update},
        return_document=ReturnDocument.AFTER,
    )
    if not user:
        return jsonify({"message": "User not found."}), 404
    return jsonify({"user": user_public(user), "message": "Profile updated successfully."})


@bp.post("/<user_id>/follow")
@require_auth
def follow_user(user_id):
    from flask import g

    current_id = g.current_user_id
    if user_id == current_id:
        return jsonify({"message": "You cannot follow yourself."}), 400
    try:
        tid = ObjectId(user_id)
        cid = ObjectId(current_id)
    except InvalidId:
        return jsonify({"message": "User not found."}), 404
    coll = users_col()
    target = coll.find_one({"_id": tid})
    current = coll.find_one({"_id": cid})
    if not target or not current:
        return jsonify({"message": "User not found."}), 404
    following = current.get("following") or []
    if tid in following:
        return jsonify({"message": "Already following this user."}), 400
    coll.update_one({"_id": cid}, {"$addToSet": {"following": tid}})
    coll.update_one({"_id": tid}, {"$addToSet": {"followers": cid}})
    return jsonify({"message": "User followed successfully."})


@bp.post("/<user_id>/unfollow")
@require_auth
def unfollow_user(user_id):
    from flask import g

    current_id = g.current_user_id
    if user_id == current_id:
        return jsonify({"message": "You cannot unfollow yourself."}), 400
    try:
        tid = ObjectId(user_id)
        cid = ObjectId(current_id)
    except InvalidId:
        return jsonify({"message": "User not found."}), 404
    coll = users_col()
    target = coll.find_one({"_id": tid})
    current = coll.find_one({"_id": cid})
    if not target or not current:
        return jsonify({"message": "User not found."}), 404
    following = current.get("following") or []
    if tid not in following:
        return jsonify({"message": "You are not following this user."}), 400
    coll.update_one({"_id": cid}, {"$pull": {"following": tid}})
    coll.update_one({"_id": tid}, {"$pull": {"followers": cid}})
    return jsonify({"message": "User unfollowed successfully."})


@bp.get("/<user_id>/followers")
def get_followers(user_id):
    try:
        uid = ObjectId(user_id)
    except InvalidId:
        return jsonify({"message": "User not found."}), 404
    user = users_col().find_one({"_id": uid})
    if not user:
        return jsonify({"message": "User not found."}), 404
    ids = user.get("followers") or []
    if not ids:
        return jsonify([])
    cur = users_col().find(
        {"_id": {"$in": ids}},
        {"password": 0},
    )
    return jsonify([user_public(u, include_id_field=True) for u in cur])


@bp.get("/<user_id>/following")
def get_following(user_id):
    try:
        uid = ObjectId(user_id)
    except InvalidId:
        return jsonify({"message": "User not found."}), 404
    user = users_col().find_one({"_id": uid})
    if not user:
        return jsonify({"message": "User not found."}), 404
    ids = user.get("following") or []
    if not ids:
        return jsonify([])
    cur = users_col().find(
        {"_id": {"$in": ids}},
        {"password": 0},
    )
    return jsonify([user_public(u, include_id_field=True) for u in cur])
