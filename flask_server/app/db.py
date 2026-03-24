from urllib.parse import urlparse

from pymongo import MongoClient
from flask import g, current_app


def get_client():
    if "mongo_client" not in g:
        g.mongo_client = MongoClient(current_app.config["MONGO_URI"])
    return g.mongo_client


def _db_name_from_uri(uri):
    parsed = urlparse(uri)
    path = (parsed.path or "").strip("/")
    if path:
        return path.split("/")[0]
    return None


def get_db():
    if "mongo_db" not in g:
        client = get_client()
        uri = current_app.config["MONGO_URI"]
        name = _db_name_from_uri(uri) or current_app.config.get("MONGO_DB_NAME", "devconnect")
        g.mongo_db = client[name]
    return g.mongo_db


def users():
    return get_db()["users"]


def posts():
    return get_db()["posts"]


def reports():
    return get_db()["reports"]


def close_db(e=None):
    client = g.pop("mongo_client", None)
    if client is not None:
        client.close()
