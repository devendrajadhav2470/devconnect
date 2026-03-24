import os

from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_cors import CORS

from app.config import Config
from app.db import close_db


def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(Config)

    basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    upload_folder = os.environ.get("UPLOAD_FOLDER", os.path.join(basedir, "uploads"))
    app.config["UPLOAD_FOLDER"] = upload_folder
    os.makedirs(upload_folder, exist_ok=True)

    CORS(app)
    app.teardown_appcontext(close_db)

    from app.routes.home import bp as home_bp
    from app.routes.protected import bp as protected_bp
    from app.routes.users import bp as users_bp
    from app.routes.posts import bp as posts_bp
    from app.routes.moderation import bp as moderation_bp

    app.register_blueprint(home_bp)
    app.register_blueprint(protected_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(moderation_bp)

    @app.get("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    return app
