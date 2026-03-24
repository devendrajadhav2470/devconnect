from datetime import datetime, timezone

from flask import Blueprint, request, jsonify

from app.auth_jwt import require_auth
from app.db import db
from app.json_util import serialize_value, user_public
from app.models import Report, User
from app.utils import parse_uuid

bp = Blueprint("moderation", __name__, url_prefix="/api/moderation")


@bp.post("/post/<post_id>")
@require_auth
def report_post(post_id):
    from flask import g

    data = request.get_json(silent=True) or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        return jsonify({"message": "Reason is required."}), 400
    tid = parse_uuid(post_id)
    if not tid:
        return jsonify({"message": "Post not found."}), 404
    uid = parse_uuid(g.current_user_id)
    report = Report(
        reporter_id=uid,
        target_type="Post",
        target_id=tid,
        reason=reason,
        created_at=datetime.now(timezone.utc),
        resolved=False,
    )
    db.session.add(report)
    db.session.commit()
    return jsonify({"message": "Post reported successfully."}), 201


@bp.post("/post/<post_id>/comment/<comment_id>")
@require_auth
def report_comment(post_id, comment_id):
    from flask import g

    data = request.get_json(silent=True) or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        return jsonify({"message": "Reason is required."}), 400
    cid = parse_uuid(comment_id)
    if not cid:
        return jsonify({"message": "Server error."}), 500
    uid = parse_uuid(g.current_user_id)
    report = Report(
        reporter_id=uid,
        target_type="Comment",
        target_id=cid,
        reason=reason,
        created_at=datetime.now(timezone.utc),
        resolved=False,
    )
    db.session.add(report)
    db.session.commit()
    return jsonify({"message": "Comment reported successfully."}), 201


@bp.get("/")
@require_auth
def get_reports():
    rows = Report.query.order_by(Report.created_at.desc()).all()
    reporter_ids = [r.reporter_id for r in rows if r.reporter_id]
    reporters = {}
    if reporter_ids:
        for u in User.query.filter(User.id.in_(reporter_ids)).all():
            reporters[str(u.id)] = u
    out = []
    for r in rows:
        item = serialize_value(
            {
                "_id": r.id,
                "reporter": r.reporter_id,
                "targetType": r.target_type,
                "targetId": r.target_id,
                "reason": r.reason,
                "createdAt": r.created_at,
                "resolved": r.resolved,
            }
        )
        rid = r.reporter_id
        if rid and str(rid) in reporters:
            item["reporter"] = user_public(reporters[str(rid)], include_id_field=True)
        out.append(item)
    return jsonify(out)


@bp.put("/<report_id>/resolve")
@require_auth
def resolve_report(report_id):
    rid = parse_uuid(report_id)
    if not rid:
        return jsonify({"message": "Report not found."}), 404
    report = Report.query.get(rid)
    if not report:
        return jsonify({"message": "Report not found."}), 404
    report.resolved = True
    db.session.commit()
    return jsonify({"message": "Report resolved."})
