"""
Inspection routes — handles image upload, camera capture trigger,
AI inference, result persistence, and human override (re-check).
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin, get_current_inspector_or_admin
from app.schemas.inspection import InspectionOut, InspectionCreate, OverrideIn, CameraCaptureIn
from app.services.ai_service import run_inference
from app.services.storage_service import save_image
from app.services.cloud_sync import enqueue_sync, flush_pending_sync
from app import crud
from app.services.image_validation import decode_base64_image, validate_image

router = APIRouter(prefix="/inspections", tags=["Inspection"])

@router.post("/upload", response_model=InspectionOut, status_code=status.HTTP_201_CREATED)
async def upload_and_inspect(
    file: UploadFile = File(...),
    part_id: Optional[str] = None,
    product_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_inspector_or_admin),
):
    """Accept an image file, run AI inference, store result, and return verdict."""
    raw = await file.read()
    image = validate_image(raw, file.filename or "")

    inspection_id = str(uuid.uuid4())
    image_path = await save_image(raw, inspection_id, file.filename or "upload.jpg")
    prediction = await run_inference(image)

    payload = InspectionCreate(
        id=inspection_id,
        part_id=part_id,
        product_id=product_id,
        image_path=image_path,
        status=prediction["status"],
        prediction=prediction["prediction"],
        defect_class=prediction["defect_class"],
        defect_type=prediction.get("defect_type"),
        confidence=prediction["confidence"],
    )
    record = crud.inspection.create(db, obj_in=payload)
    await enqueue_sync(record)

    return InspectionOut(**record.__dict__)



@router.post("/capture", response_model=InspectionOut, status_code=status.HTTP_201_CREATED)
async def capture_and_inspect(
    body: CameraCaptureIn,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_inspector_or_admin),
):
    """Accept a base64 camera frame, run AI inference, and persist the inspection."""
    raw, image = decode_base64_image(body.image_base64, body.filename or "camera.jpg")
    try:
        inspection_id = str(uuid.uuid4())
        image_path = await save_image(raw, inspection_id, body.filename or "camera.jpg")
        prediction = await run_inference(image)
        
        payload = InspectionCreate(
            id=inspection_id,
            part_id=body.part_id,
            product_id=body.product_id,
            image_path=image_path,
            status=prediction["status"],
            prediction=prediction["prediction"],
            defect_class=prediction["defect_class"],
            defect_type=prediction.get("defect_type"),
            confidence=prediction["confidence"],
        )
        record = crud.inspection.create(db, obj_in=payload)
        await enqueue_sync(record)
        
        return InspectionOut(**record.__dict__)
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to process camera inspection")


@router.get("/", response_model=list[InspectionOut])
def list_inspections(skip: int = 0, limit: int = 50, part_id: Optional[str] = None, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Return paginated inspection history."""
    return crud.inspection.get_multi(db, skip=skip, limit=limit, part_id=part_id)


@router.get("/by-part/{part_id}", response_model=list[InspectionOut])
def list_inspections_by_part(part_id: str, skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return crud.inspection.get_multi(db, skip=skip, limit=limit, part_id=part_id)


@router.get("/{inspection_id}", response_model=InspectionOut)
def get_inspection(inspection_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    record = crud.inspection.get(db, id=inspection_id)
    if not record:
        raise HTTPException(status_code=404, detail="Inspection not found.")
    return record


@router.patch("/{inspection_id}/override", response_model=InspectionOut)
def human_override(
    inspection_id: str,
    body: OverrideIn,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_inspector_or_admin),
):
    """Human reviewer validates or overrides the AI decision (re-check flow)."""
    record = crud.inspection.get(db, id=inspection_id)
    if not record:
        raise HTTPException(status_code=404, detail="Inspection not found.")
    updated = crud.inspection.apply_override(db, db_obj=record, override=body, reviewer=current_user.username)
    return updated


@router.post("/sync/flush")
async def sync_pending_to_cloud(limit: int = 100, current_user = Depends(get_current_admin)):
    """Manual sync trigger for records captured while offline."""
    return await flush_pending_sync(limit=limit)
