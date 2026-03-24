import functools
import jwt
from flask import request, jsonify, g, current_app

from app.utils import parse_uuid


def decode_token_valid():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, (jsonify({"message": "No token provided."}), 401)
    token = auth.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(
            token,
            current_app.config["JWT_SECRET"],
            algorithms=[current_app.config["JWT_ALGORITHM"]],
        )
        return payload, None
    except jwt.PyJWTError:
        return None, (jsonify({"message": "Invalid or expired token."}), 401)


def require_auth(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        payload, err = decode_token_valid()
        if err:
            return err[0], err[1]
        uid = payload.get("userId")
        if not uid:
            return jsonify({"message": "Invalid or expired token."}), 401
        parsed = parse_uuid(uid)
        if not parsed:
            return jsonify({"message": "Invalid or expired token."}), 401
        g.current_user_id = str(parsed)
        g.jwt_payload = payload
        return f(*args, **kwargs)

    return decorated
