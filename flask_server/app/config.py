import os


class Config:
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/devconnect")
    MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "devconnect")
    JWT_SECRET = os.environ.get("JWT_SECRET", "change-me-in-production")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRES_HOURS = 1
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB uploads
