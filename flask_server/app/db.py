from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def close_db(e=None):
    db.session.remove()
