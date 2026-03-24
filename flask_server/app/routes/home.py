from flask import Blueprint

bp = Blueprint("home", __name__)


@bp.get("/")
def home():
    return "Hello World!", 200
