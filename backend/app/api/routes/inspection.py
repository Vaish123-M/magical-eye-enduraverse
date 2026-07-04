"""
Inspection routes — handles image upload, camera capture trigger,
AI inference, result persistence, and human override (re-check).
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid, io
import base64
from PIL import Image

from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.inspection import InspectionOut, InspectionCreate, OverrideIn, CameraCaptureIn
from app.services.ai_service import run_inference
from app.services.storage_service import save_image
from app.services.cloud_sync import enqueue_sync, flush_pending_sync
from app.services.alert_service import trigger_alert
# from app.services.audio_feedback import play_audio  # DISABLED: audio feedback temporarily removed due to missing pyaudioop
from app import crud

router = APIRouter(prefix="/inspections", tags=["Inspection"])

# Validation constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_FORMATS = {"JPEG", "PNG", "JPG"}
MIN_IMAGE_DIMENSION = 64
MAX_IMAGE_DIMENSION = 4096


@router.post("/upload", response_model=InspectionOut, status_code=status.HTTP_201_CREATED)
async def upload_and_inspect(
    file: UploadFile = File(...),
    part_id: Optional[str] = None,
    product_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Accept an image file, run AI inference, store result, and return verdict."""
    # File size validation
    raw = await file.read()
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # File format validation
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")
    
    file_ext = file.filename.split(".")[-1].upper()
    if file_ext not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format. Allowed: {', '.join(ALLOWED_FORMATS)}"
        )
    
    # Image content validation
    try:
        image = Image.open(io.BytesIO(raw))
        image_format = image.format.upper() if image.format else ""
        
        # Verify actual image format matches extension
        if image_format not in ALLOWED_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Image content format '{image_format}' doesn't match extension '{file_ext}'"
            )
        
        # Dimension validation
        width, height = image.size
        if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
            raise HTTPException(
                status_code=400,
                detail=f"Image too small. Minimum dimension: {MIN_IMAGE_DIMENSION}px"
            )
        if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
            raise HTTPException(
                status_code=400,
                detail=f"Image too large. Maximum dimension: {MAX_IMAGE_DIMENSION}px"
            )
        
        image = image.convert("RGB")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file or corrupted data")

    # --- Additional QR/part validation layer ---
    # part_validation_result = validate_part(raw)  # DISABLED: QR/part validation removed
    part_validation_result = None  # No part validation

    inspection_id = str(uuid.uuid4())
    image_path = await save_image(raw, inspection_id, file.filename or "upload.jpg")
    prediction = await run_inference(image)

    payload = InspectionCreate(
        id=inspection_id,
        part_id=part_id,
        product_id=product_id,
        image_path=image_path,
        status=prediction["status"],          # "OK" | "NOT_OK"
        prediction=prediction["prediction"],
        defect_class=prediction["defect_class"],
        defect_type=prediction.get("defect_type"),
        confidence=prediction["confidence"],
    )
    record = crud.inspection.create(db, obj_in=payload)

    # --- Voice feedback ---
    # Default to Hindi; extend to support user/language param as needed
    # play_audio(str(record.status), language="hindi")
    # if str(record.status) == "NOT_OK":
    #     await trigger_alert(record)
    await enqueue_sync(record)

    # Convert record to dict to add part_validation, then return as InspectionOut
    record_dict = record.__dict__.copy()
    record_dict["part_validation"] = part_validation_result
    return InspectionOut(**record_dict)



@router.post("/capture", response_model=InspectionOut, status_code=status.HTTP_201_CREATED)
async def capture_and_inspect(
    body: CameraCaptureIn,
    db: Session = Depends(get_db),
):
    """Accept a base64 camera frame, run AI inference, and persist the inspection."""
    import traceback
    try:
        if "," in body.image_base64:
            _, encoded = body.image_base64.split(",", 1)
        else:
            encoded = body.image_base64
        raw = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(raw)).convert("RGB")
        # --- Additional QR/part validation layer ---
        # part_validation_result = validate_part(raw)  # DISABLED: QR/part validation removed
        part_validation_result = None  # No part validation
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
        # --- Voice feedback ---
        # play_audio(prediction["status"])  # DISABLED: audio feedback temporarily removed
        await enqueue_sync(record)
        # Convert record to dict to add part_validation, then return as InspectionOut
        record_dict = record.__dict__.copy()
        record_dict["part_validation"] = part_validation_result
        return InspectionOut(**record_dict)
    except Exception as e:
        print("[ERROR] /inspections/capture failed:", e)
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("/", response_model=list[InspectionOut])
def list_inspections(skip: int = 0, limit: int = 50, part_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Return paginated inspection history."""
    return crud.inspection.get_multi(db, skip=skip, limit=limit, part_id=part_id)


@router.get("/by-part/{part_id}", response_model=list[InspectionOut])
def list_inspections_by_part(part_id: str, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return crud.inspection.get_multi(db, skip=skip, limit=limit, part_id=part_id)


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


@router.post("/sync/flush")
async def sync_pending_to_cloud(limit: int = 100):
    """Manual sync trigger for records captured while offline."""
    return await flush_pending_sync(limit=limit)
