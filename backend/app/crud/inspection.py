"""CRUD helpers for Inspection model."""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.inspection import Inspection
from app.schemas.inspection import InspectionCreate, OverrideIn


def create(db: Session, *, obj_in: InspectionCreate) -> Inspection:
    record = Inspection(**obj_in.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get(db: Session, *, id: str) -> Inspection | None:
    return db.query(Inspection).filter(Inspection.id == id).first()


def get_multi(db: Session, *, skip: int = 0, limit: int = 50) -> list[Inspection]:
    return (
        db.query(Inspection)
        .order_by(Inspection.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def apply_override(db: Session, *, db_obj: Inspection, override: OverrideIn) -> Inspection:
    db_obj.override_status = override.override_status
    db_obj.reviewed_by     = override.reviewed_by
    db_obj.override_note   = override.note
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_stats(db: Session) -> dict:
    total  = db.query(func.count(Inspection.id)).scalar()
    ok     = db.query(func.count(Inspection.id)).filter(Inspection.status == "OK").scalar()
    not_ok = total - ok
    defect_breakdown = (
        db.query(Inspection.defect_type, func.count(Inspection.id))
        .filter(Inspection.status == "NOT_OK")
        .group_by(Inspection.defect_type)
        .all()
    )
    return {
        "total":     total,
        "ok":        ok,
        "not_ok":    not_ok,
        "pass_rate": round(ok / total * 100, 2) if total else 0,
        "defect_breakdown": {row[0]: row[1] for row in defect_breakdown},
    }
