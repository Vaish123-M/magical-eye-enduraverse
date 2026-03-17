from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertOut(BaseModel):
    id:              str
    inspection_id:   str
    severity:        str
    message:         str
    acknowledged:    bool
    acknowledged_by: Optional[str]
    note:            Optional[str]
    created_at:      datetime

    class Config:
        from_attributes = True


class AlertAcknowledge(BaseModel):
    acknowledged_by: str
    note:            Optional[str] = None
