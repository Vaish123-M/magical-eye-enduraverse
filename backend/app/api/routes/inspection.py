"""
Inspection routes — handles image upload, camera capture trigger,
AI inference, result persistence, and human override (re-check).
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid, io
from PIL import Image

from app.core.database import get_db
from app.schemas.inspection import InspectionOut, InspectionCreate, OverrideIn
from app.services.ai_service import run_inference
from app.services.storage_service import save_image
from app.services.cloud_sync import enqueue_sync
from app.services.alert_service import trigger_alert
from app import crud

router = APIRouter(prefix="/inspections", tags=["Inspection"])


@router.post("/upload", response_model=InspectionOut, status_code=status.HTTP_201_CREATED)
async def upload_and_inspect(
    file: UploadFile = File(...),
    product_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Accept an image file, run AI inference, store result, and return verdict."""
    raw = await file.read()
    try:
        image = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    inspection_id = str(uuid.uuid4())
    image_path = await save_image(raw, inspection_id, file.filename)
    prediction = await run_inference(image)

    payload = InspectionCreate(
        id=inspection_id,
        product_id=product_id,
        image_path=image_path,
        status=prediction["status"],          # "OK" | "NOT_OK"
        defect_type=prediction.get("defect_type"),
        confidence=prediction["confidence"],
    )
    record = crud.inspection.create(db, obj_in=payload)

    if record.status == "NOT_OK":
        await trigger_alert(record)
        await enqueue_sync(record)

    return record


@router.get("/", response_model=list[InspectionOut])
def list_inspections(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Return paginated inspection history."""
    return crud.inspection.get_multi(db, skip=skip, limit=limit)


@router.get("/{inspection_id}", response_model=InspectionOut)
def get_inspection(inspection_id: str, db: Session = Depends(get_db)):
    record = crud.inspection.get(db, id=inspection_id)
    if not record:
        raise HTTPException(status_code=404, detail="Inspection not found.")
    return record


@router.patch("/{inspection_id}/override", response_model=InspectionOut)
def human_override(
    inspection_id: str,
    body: OverrideIn,
    db: Session = Depends(get_db),
):
    """Human reviewer validates or overrides the AI decision (re-check flow)."""
    record = crud.inspection.get(db, id=inspection_id)
    if not record:
        raise HTTPException(status_code=404, detail="Inspection not found.")
    updated = crud.inspection.apply_override(db, db_obj=record, override=body)
    return updated
