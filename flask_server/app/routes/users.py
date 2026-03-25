import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, current_app

from app.auth_jwt import require_auth
from app.db import db
from app.json_util import user_public, user_model_to_dict
from app.models import User, UserFollow
from app.utils import parse_uuid

bp = Blueprint("users", __name__, url_prefix="/api/users")


def _jwt_for_user(user: User):
    exp = datetime.now(timezone.utc) + timedelta(hours=current_app.config["JWT_EXPIRES_HOURS"])
    return jwt.encode(
        {
            "userId": str(user.id),
            "username": user.username,
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
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"message": "Username or email already exists."}), 409
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")
    user = User(
        username=username,
        email=email,
        password=hashed,
    )
    db.session.add(user)
    db.session.commit()
    return (
        jsonify(
            {
                "user": {
                    "id": str(user.id),
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
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Invalid credentials."}), 401
    if not bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8")):
        return jsonify({"message": "Invalid credentials."}), 401
    token = _jwt_for_user(user)
    return jsonify(
        {
            "token": token,
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
            },
            "message": "Login successful.",
        }
    )


@bp.get("/profile")
@require_auth
def get_profile():
    from flask import g

    uid = parse_uuid(g.current_user_id)
    user = User.query.get(uid)
    if not user:
        return jsonify({"message": "User not found."}), 404
    followers_ids = [str(r.follower_id) for r in UserFollow.query.filter_by(following_id=user.id).all()]
    following_ids = [str(r.following_id) for r in UserFollow.query.filter_by(follower_id=user.id).all()]
    return jsonify(user_public(user_model_to_dict(user, followers_ids, following_ids)))


@bp.put("/profile")
@require_auth
def update_profile():
    from flask import g

    data = request.get_json(silent=True) or {}
    bio = data.get("bio")
    image = data.get("image")
    skills = data.get("skills")
    uid = parse_uuid(g.current_user_id)
    user = User.query.get(uid)
    if not user:
        return jsonify({"message": "User not found."}), 404
    if bio is not None:
        user.bio = bio
    if image is not None:
        user.image = image
    if skills is not None:
        user.skills = skills
    db.session.commit()
    return jsonify({"user": user_public(user_model_to_dict(user)), "message": "Profile updated successfully."})


@bp.get("/<user_id>")
def get_user(user_id):
    uid = parse_uuid(user_id)
    if not uid:
        return jsonify({"message": "User not found."}), 404
    user = User.query.get(uid)
    if not user:
        return jsonify({"message": "User not found."}), 404
    followers_ids = [str(r.follower_id) for r in UserFollow.query.filter_by(following_id=user.id).all()]
    following_ids = [str(r.following_id) for r in UserFollow.query.filter_by(follower_id=user.id).all()]
    return jsonify(user_public(user_model_to_dict(user, followers_ids, following_ids)))


@bp.post("/<user_id>/follow")
@require_auth
def follow_user(user_id):
    from flask import g

    current_id = g.current_user_id
    if user_id == current_id:
        return jsonify({"message": "You cannot follow yourself."}), 400
    tid = parse_uuid(user_id)
    cid = parse_uuid(current_id)
    if not tid or not cid:
        return jsonify({"message": "User not found."}), 404
    target = User.query.get(tid)
    current = User.query.get(cid)
    if not target or not current:
        return jsonify({"message": "User not found."}), 404
    if UserFollow.query.filter_by(follower_id=cid, following_id=tid).first():
        return jsonify({"message": "Already following this user."}), 400
    db.session.add(UserFollow(follower_id=cid, following_id=tid))
    db.session.commit()
    return jsonify({"message": "User followed successfully."})


@bp.post("/<user_id>/unfollow")
@require_auth
def unfollow_user(user_id):
    from flask import g

    current_id = g.current_user_id
    if user_id == current_id:
        return jsonify({"message": "You cannot unfollow yourself."}), 400
    tid = parse_uuid(user_id)
    cid = parse_uuid(current_id)
    if not tid or not cid:
        return jsonify({"message": "User not found."}), 404
    target = User.query.get(tid)
    current = User.query.get(cid)
    if not target or not current:
        return jsonify({"message": "User not found."}), 404
    row = UserFollow.query.filter_by(follower_id=cid, following_id=tid).first()
    if not row:
        return jsonify({"message": "You are not following this user."}), 400
    db.session.delete(row)
    db.session.commit()
    return jsonify({"message": "User unfollowed successfully."})


@bp.get("/<user_id>/followers")
def get_followers(user_id):
    uid = parse_uuid(user_id)
    if not uid:
        return jsonify({"message": "User not found."}), 404
    user = User.query.get(uid)
    if not user:
        return jsonify({"message": "User not found."}), 404
    ids = [r.follower_id for r in UserFollow.query.filter_by(following_id=user.id).all()]
    if not ids:
        return jsonify([])
    users = User.query.filter(User.id.in_(ids)).all()
    return jsonify([user_public(user_model_to_dict(u), include_id_field=True) for u in users])


@bp.get("/<user_id>/following")
def get_following(user_id):
    uid = parse_uuid(user_id)
    if not uid:
        return jsonify({"message": "User not found."}), 404
    user = User.query.get(uid)
    if not user:
        return jsonify({"message": "User not found."}), 404
    ids = [r.following_id for r in UserFollow.query.filter_by(follower_id=user.id).all()]
    if not ids:
        return jsonify([])
    users = User.query.filter(User.id.in_(ids)).all()
    return jsonify([user_public(user_model_to_dict(u), include_id_field=True) for u in users])
