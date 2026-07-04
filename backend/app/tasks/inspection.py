"""Celery tasks for inspection processing."""
from celery import shared_task
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.services.ai_service import run_inference
from PIL import Image
import io


@shared_task(bind=True, max_retries=3)
def process_inspection_async(self, inspection_id: str, image_data: bytes):
    """Process inspection in background with AI inference."""
    db = SessionLocal()
    try:
        from app import crud
        from app.schemas.inspection import InspectionUpdate
        
        # Get inspection
        inspection = crud.inspection.get(db, id=inspection_id)
        if not inspection:
            return {"status": "error", "message": "Inspection not found"}
        
        # Run inference
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        prediction = run_inference(image)
        
        # Update inspection
        update_data = InspectionUpdate(
            status=prediction["status"],
            prediction=prediction["prediction"],
            defect_class=prediction["defect_class"],
            defect_type=prediction.get("defect_type"),
            confidence=prediction["confidence"]
        )
        crud.inspection.update(db, db_obj=inspection, obj_in=update_data)
        
        return {"status": "success", "inspection_id": inspection_id}
    except Exception as exc:
        self.retry(exc=exc, countdown=60)
    finally:
        db.close()


@shared_task
def cleanup_old_inspections(days: int = 30):
    """Delete inspections older than specified days."""
    db = SessionLocal()
    try:
        from datetime import datetime, timedelta
        from sqlalchemy import and_
        from app.models.inspection import Inspection
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        old_inspections = db.query(Inspection).filter(
            Inspection.created_at < cutoff_date
        ).all()
        
        count = len(old_inspections)
        for inspection in old_inspections:
            db.delete(inspection)
        
        db.commit()
        return {"status": "success", "deleted_count": count}
    finally:
        db.close()
