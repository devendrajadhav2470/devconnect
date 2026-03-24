from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request, jsonify

from app.auth_jwt import require_auth
from app.db import reports as reports_col
from app.json_util import serialize_value, user_public

bp = Blueprint("moderation", __name__, url_prefix="/api/moderation")


@bp.post("/post/<post_id>")
@require_auth
def report_post(post_id):
    from flask import g

    data = request.get_json(silent=True) or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        return jsonify({"message": "Reason is required."}), 400
    try:
        tid = ObjectId(post_id)
    except InvalidId:
        return jsonify({"message": "Post not found."}), 404
    doc = {
        "reporter": ObjectId(g.current_user_id),
        "targetType": "Post",
        "targetId": tid,
        "reason": reason,
        "createdAt": datetime.now(timezone.utc),
        "resolved": False,
    }
    reports_col().insert_one(doc)
    return jsonify({"message": "Post reported successfully."}), 201


@bp.post("/post/<post_id>/comment/<comment_id>")
@require_auth
def report_comment(post_id, comment_id):
    from flask import g

    data = request.get_json(silent=True) or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        return jsonify({"message": "Reason is required."}), 400
    try:
        cid = ObjectId(comment_id)
    except InvalidId:
        return jsonify({"message": "Server error."}), 500
    doc = {
        "reporter": ObjectId(g.current_user_id),
        "targetType": "Comment",
        "targetId": cid,
        "reason": reason,
        "createdAt": datetime.now(timezone.utc),
        "resolved": False,
    }
    reports_col().insert_one(doc)
    return jsonify({"message": "Comment reported successfully."}), 201


@bp.get("/")
@require_auth
def get_reports():
    cur = reports_col().find().sort("createdAt", -1)
    out = []
    reporter_ids = []
    rows = list(cur)
    for r in rows:
        rep = r.get("reporter")
        if rep:
            reporter_ids.append(rep)
    from app.db import users as users_col

    reporters = {}
    if reporter_ids:
        for u in users_col().find({"_id": {"$in": reporter_ids}}):
            reporters[str(u["_id"])] = u
    for r in rows:
        item = serialize_value(dict(r))
        rid = r.get("reporter")
        if rid and str(rid) in reporters:
            item["reporter"] = user_public(reporters[str(rid)], include_id_field=True)
        out.append(item)
    return jsonify(out)


@bp.put("/<report_id>/resolve")
@require_auth
def resolve_report(report_id):
    try:
        rid = ObjectId(report_id)
    except InvalidId:
        return jsonify({"message": "Report not found."}), 404
    coll = reports_col()
    report = coll.find_one({"_id": rid})
    if not report:
        return jsonify({"message": "Report not found."}), 404
    coll.update_one({"_id": rid}, {"$set": {"resolved": True}})
    return jsonify({"message": "Report resolved."})
