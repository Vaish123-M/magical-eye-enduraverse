from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class InspectionCreate(BaseModel):
    id:             str
    product_id:     Optional[str] = None
    image_path:     str
    status:         str           # OK | NOT_OK
    defect_type:    Optional[str] = None
    confidence:     float = Field(ge=0.0, le=1.0)


class OverrideIn(BaseModel):
    override_status: str          # OK | NOT_OK
    reviewed_by:     str
    note:            Optional[str] = None


class InspectionOut(BaseModel):
    id:              str
    product_id:      Optional[str]
    image_path:      str
    status:          str
    defect_type:     Optional[str]
    confidence:      float
    override_status: Optional[str]
    reviewed_by:     Optional[str]
    override_note:   Optional[str]
    synced:          bool
    created_at:      datetime

    class Config:
        from_attributes = True
