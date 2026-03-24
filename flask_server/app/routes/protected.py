from flask import Blueprint, jsonify

from app.auth_jwt import require_auth

bp = Blueprint("protected", __name__, url_prefix="/api/protected")


@bp.get("/test")
@require_auth
def test():
    from flask import g

    return jsonify({"message": "Protected route accessed!", "user": g.jwt_payload})
