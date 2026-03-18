"""Device ingestion routes for low-cost IoT smart-glass prototype integrations."""
from __future__ import annotations

import base64
import io
import uuid

from fastapi import APIRouter, Header, HTTPException, status, Depends
from sqlalchemy.orm import Session
from PIL import Image

from app.core.config import settings
from app.core.database import get_db
from app.schemas.inspection import DeviceIngestionIn, InspectionCreate, InspectionOut, DeviceIngestResponse
from app.services.ai_service import run_inference
from app.services.storage_service import save_image
from app.services.cloud_sync import enqueue_sync
from app.services.alert_service import trigger_alert
from app import crud

router = APIRouter(prefix="/device", tags=["Device"])


def _verify_device_key(x_device_key: str | None = Header(default=None)) -> None:
    if x_device_key != settings.DEVICE_API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid device key")


@router.post("/ingest", response_model=DeviceIngestResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(_verify_device_key)])
async def ingest_from_device(
    body: DeviceIngestionIn,
    db: Session = Depends(get_db),
):
    """Accept image frames from low-cost devices like ESP32-CAM/Raspberry Pi."""
    try:
        encoded = body.image_base64.split(",", 1)[1] if "," in body.image_base64 else body.image_base64
        raw = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid device image payload")

    inspection_id = str(uuid.uuid4())
    part_id = body.part_id or f"PART-{inspection_id[:8].upper()}"
    device_id = body.device_id
    image_path = await save_image(raw, inspection_id, body.filename or "device-frame.jpg")
    prediction = await run_inference(image)

    payload = InspectionCreate(
        id=inspection_id,
        part_id=part_id,
        device_id=device_id,
        product_id=body.product_id,
        image_path=image_path,
        status=prediction["status"],
        prediction=prediction["prediction"],
        defect_class=prediction["defect_class"],
        defect_type=prediction.get("defect_type"),
        confidence=prediction["confidence"],
    )
    record = crud.inspection.create(db, obj_in=payload)

    if str(record.status) == "NOT_OK":
        await trigger_alert(record)
    await enqueue_sync(record)

    return DeviceIngestResponse(
        status=record.status,
        label=record.defect_type or record.prediction,
        confidence=record.confidence,
    )
