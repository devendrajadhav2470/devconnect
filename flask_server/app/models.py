import uuid
from datetime import datetime, timezone

from sqlalchemy import Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db import db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(255), nullable=False, unique=True, index=True)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password = db.Column(db.String(255), nullable=False)
    bio = db.Column(db.Text, default="")
    image = db.Column(db.String(2048), default="")
    skills = db.Column(JSONB, nullable=False, default=list)
    status = db.Column(db.String(32), nullable=False, default="active")
    roles = db.Column(JSONB, nullable=False, default=lambda: ["user"])
    email_verified = db.Column(db.Boolean, nullable=False, default=False)
    profile_visibility = db.Column(db.String(32), nullable=False, default="public")


class UserFollow(db.Model):
    __tablename__ = "user_follows"
    __table_args__ = (
        UniqueConstraint("follower_id", "following_id", name="uq_follow_pair"),
        Index("ix_follow_following", "following_id"),
    )

    follower_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    following_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)


class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    media = db.Column(JSONB, nullable=False, default=list)
    post_type = db.Column(db.String(32), nullable=False, default="text")
    tags = db.Column(JSONB, nullable=False, default=list)
    mentions = db.Column(JSONB, nullable=False, default=list)
    status = db.Column(db.String(32), nullable=False, default="published")
    comments_count = db.Column(db.Integer, nullable=False, default=0)
    likes_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    author = db.relationship("User", backref=db.backref("authored_posts", lazy="dynamic"))
    comments = db.relationship(
        "Comment",
        backref="post",
        lazy="select",
        order_by="Comment.created_at",
        cascade="all, delete-orphan",
    )


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = db.Column(UUID(as_uuid=True), db.ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    parent_comment_id = db.Column(UUID(as_uuid=True), db.ForeignKey("comments.id", ondelete="SET NULL"), nullable=True)
    status = db.Column(db.String(32), nullable=False, default="active")
    likes = db.Column(JSONB, nullable=False, default=list)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    author = db.relationship("User", backref=db.backref("comments", lazy="dynamic"))


class PostLike(db.Model):
    __tablename__ = "post_likes"
    __table_args__ = (UniqueConstraint("post_id", "user_id", name="uq_post_like_user"),)

    post_id = db.Column(UUID(as_uuid=True), db.ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_type = db.Column(db.String(32), nullable=False)
    target_id = db.Column(UUID(as_uuid=True), nullable=False, index=True)
    reason = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    resolved = db.Column(db.Boolean, nullable=False, default=False)

    reporter = db.relationship("User", backref=db.backref("reports_made", lazy="dynamic"))
