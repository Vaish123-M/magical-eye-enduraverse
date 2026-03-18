import random
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.simulate import SimulateInspectionResponse
from app.schemas.inspection import InspectionCreate
from app import crud

def random_defect():
    defects = [
        ("porosity", 1),
        ("surface_void", 2),
        ("crack", 3),
    ]
    return random.choice(defects)

router = APIRouter(prefix="/simulate-inspection", tags=["Simulation"])

@router.post("/", response_model=SimulateInspectionResponse, status_code=status.HTTP_201_CREATED)
def simulate_inspection(db: Session = Depends(get_db)):
    inspection_id = str(uuid.uuid4())
    status_val = random.choice(["OK", "NOT_OK"])
    confidence = round(random.uniform(0.7, 1.0), 2)
    if status_val == "OK":
        label = "OK"
        defect_class = 0
        defect_type = None
    else:
        label, defect_class = random_defect()
        defect_type = label
    payload = InspectionCreate(
        id=inspection_id,
        part_id=None,
        device_id=None,
        product_id=None,
        image_path="simulated.jpg",
        status=status_val,
        prediction=label,
        defect_class=defect_class,
        defect_type=defect_type,
        confidence=confidence,
    )
    record = crud.inspection.create(db, obj_in=payload)
    return SimulateInspectionResponse(
        id=record.id,
        status=record.status,
        label=record.defect_type or record.prediction,
        confidence=record.confidence,
        created_at=record.created_at.isoformat() if hasattr(record, "created_at") and record.created_at else str(datetime.utcnow()),
    )
