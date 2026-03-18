
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DeviceIngestResponse(BaseModel):
    status: str
    label: str
    confidence: float


class InspectionCreate(BaseModel):
    id:             str
    part_id:        Optional[str] = None
    device_id:      Optional[str] = None
    product_id:     Optional[str] = None
    image_path:     str
    status:         str           # OK | NOT_OK
    prediction:     str
    defect_class:   int
    defect_type:    Optional[str] = None
    confidence:     float = Field(ge=0.0, le=1.0)


class CameraCaptureIn(BaseModel):
    image_base64: str
    filename: Optional[str] = "camera.jpg"
    part_id: Optional[str] = None
    product_id: Optional[str] = None


class DeviceIngestionIn(BaseModel):
    image_base64: str
    part_id: Optional[str] = None
    device_id: Optional[str] = "iot-device"
    filename: Optional[str] = "device-frame.jpg"
    product_id: Optional[str] = None


class OverrideIn(BaseModel):
    override_status: str          # OK | NOT_OK
    reviewed_by:     str
    note:            Optional[str] = None


class InspectionOut(BaseModel):
    id:              str
    part_id:         Optional[str]
    device_id:       Optional[str]
    product_id:      Optional[str]
    image_path:      str
    status:          str
    prediction:      str
    defect_class:    int
    defect_type:     Optional[str]
    confidence:      float
    override_status: Optional[str]
    reviewed_by:     Optional[str]
    override_note:   Optional[str]
    synced:          bool
    created_at:      datetime
    part_validation: Optional[dict] = None  # QR/part validation result

    class Config:
        from_attributes = True
