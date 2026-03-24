import uuid


def parse_uuid(s):
    if s is None:
        return None
    try:
        return uuid.UUID(str(s))
    except (ValueError, TypeError, AttributeError):
        return None
