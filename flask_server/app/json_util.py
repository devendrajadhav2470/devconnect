from bson import ObjectId
from datetime import datetime


def oid_str(value):
    if value is None:
        return None
    return str(value)


def serialize_value(v):
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, datetime):
        return v.isoformat()
    if isinstance(v, dict):
        return {k: serialize_value(x) for k, x in v.items()}
    if isinstance(v, list):
        return [serialize_value(x) for x in v]
    return v


def user_public(doc, include_id_field=True):
    if not doc:
        return None
    out = serialize_value({k: v for k, v in doc.items() if k != "password"})
    if include_id_field and "_id" in out:
        out["id"] = out["_id"]
    return out


def post_json(doc, author_by_id):
    if not doc:
        return None
    author_id = doc.get("author")
    author = author_by_id.get(str(author_id)) if author_id else None
    out = serialize_value(dict(doc))
    out["author"] = user_public(author, include_id_field=True) if author else {"_id": oid_str(author_id)}
    return out
