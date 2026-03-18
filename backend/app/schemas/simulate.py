from pydantic import BaseModel
from typing import Optional

class SimulateInspectionResponse(BaseModel):
    id: str
    status: str
    label: str
    confidence: float
    created_at: str
