"""
Cloud sync service — sends un-synced inspection records to a remote endpoint.

In offline mode this is a no-op; records are marked synced=False and
flushed when connectivity is restored (run scripts/sync_cloud.py as a cron job).
"""
from __future__ import annotations
import httpx
from app.core.config import settings


async def enqueue_sync(inspection) -> None:
    """Attempt immediate cloud push; silently fail when offline."""
    if not settings.CLOUD_SYNC_ENABLED or not settings.CLOUD_SYNC_ENDPOINT:
        return
    payload = {
        "id":           inspection.id,
        "part_id":      inspection.part_id,
        "product_id":   inspection.product_id,
        "status":       inspection.status,
        "prediction":   inspection.prediction,
        "defect_class": inspection.defect_class,
        "defect_type":  inspection.defect_type,
        "confidence":   inspection.confidence,
        "override_status": inspection.override_status,
        "reviewed_by": inspection.reviewed_by,
        "override_note": inspection.override_note,
        "image_path":   inspection.image_path,
        "created_at":   inspection.created_at.isoformat() if inspection.created_at else None,
    }
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.post(settings.CLOUD_SYNC_ENDPOINT, json=payload)
            resp.raise_for_status()
        _mark_synced(inspection.id)
    except Exception as exc:
        print(f"[CloudSync] Offline or error — will retry later. {exc}")


def _mark_synced(inspection_id: str) -> None:
    from app.core.database import SessionLocal
    from app.models.inspection import Inspection
    db = SessionLocal()
    try:
        record = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if record:
            record.synced = True  # pyright: ignore[reportAttributeAccessIssue]
            db.commit()
    finally:
        db.close()


async def flush_pending_sync(limit: int = 100) -> dict:
    """Push pending offline records to cloud endpoint and return a summary."""
    from app.core.database import SessionLocal
    from app.models.inspection import Inspection

    db = SessionLocal()
    tried = 0
    try:
        pending = (
            db.query(Inspection)
            .filter(Inspection.synced == False)  # noqa: E712
            .order_by(Inspection.created_at.asc())
            .limit(limit)
            .all()
        )
        for record in pending:
            tried += 1
            await enqueue_sync(record)

        remaining = db.query(Inspection).filter(Inspection.synced == False).count()  # noqa: E712
        return {
            "attempted": tried,
            "remaining_unsynced": remaining,
            "cloud_sync_enabled": settings.CLOUD_SYNC_ENABLED,
        }
    finally:
        db.close()
