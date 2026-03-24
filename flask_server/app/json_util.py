import uuid
from datetime import datetime

from app.models import Post, User


def oid_str(value):
    if value is None:
        return None
    return str(value)


def serialize_value(v):
    if isinstance(v, uuid.UUID):
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
    if isinstance(doc, User):
        doc = user_model_to_dict(doc)
    out = serialize_value({k: v for k, v in doc.items() if k != "password"})
    if include_id_field and "_id" in out:
        out["id"] = out["_id"]
    return out


def user_model_to_dict(user: User, followers_ids=None, following_ids=None):
    d = {
        "_id": str(user.id),
        "username": user.username,
        "email": user.email,
        "bio": user.bio or "",
        "image": user.image,
        "skills": user.skills or [],
        "status": user.status,
        "roles": user.roles or ["user"],
        "emailVerified": user.email_verified,
        "profileVisibility": user.profile_visibility,
    }
    if followers_ids is not None:
        d["followers"] = followers_ids
    if following_ids is not None:
        d["following"] = following_ids
    return d


def post_doc_from_models(post: Post, authors: dict, like_user_ids: list):
    """Build a Mongo-shaped dict for API compatibility."""
    comments = []
    for c in post.comments:
        comments.append(
            {
                "_id": c.id,
                "author": c.author_id,
                "content": c.content,
                "likes": c.likes or [],
                "parentCommentId": c.parent_comment_id,
                "status": c.status,
                "createdAt": c.created_at,
            }
        )
    doc = {
        "_id": post.id,
        "content": post.content,
        "media": post.media or [],
        "author": post.author_id,
        "postType": post.post_type,
        "tags": post.tags or [],
        "mentions": post.mentions or [],
        "status": post.status,
        "likes": like_user_ids,
        "comments": comments,
        "commentsCount": post.comments_count,
        "likesCount": post.likes_count,
        "createdAt": post.created_at,
        "updatedAt": post.updated_at,
    }
    return post_json(doc, authors)


def post_json(doc, author_by_id):
    if not doc:
        return None
    author_id = doc.get("author")
    author = author_by_id.get(str(author_id)) if author_id is not None else None
    out = serialize_value(dict(doc))
    out["author"] = user_public(author, include_id_field=True) if author else {"_id": oid_str(author_id)}
    return out
