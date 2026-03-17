"""CRUD helpers for Inspection model."""
from sqlalchemy.orm import Session
from sqlalchemy import func, case
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


def get_multi(db: Session, *, skip: int = 0, limit: int = 50, part_id: str | None = None) -> list[Inspection]:
    q = db.query(Inspection)
    if part_id:
        q = q.filter(Inspection.part_id == part_id)
    return q.order_by(Inspection.created_at.desc()).offset(skip).limit(limit).all()


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
    failure_rate = round((not_ok / total) * 100, 2) if total else 0
    most_frequent_defect = None
    if defect_breakdown:
        most_frequent_defect = max(defect_breakdown, key=lambda row: row[1])[0]

    return {
        "total":     total,
        "ok":        ok,
        "not_ok":    not_ok,
        "pass_rate": round(ok / total * 100, 2) if total else 0,
        "failure_rate": failure_rate,
        "most_frequent_defect": most_frequent_defect,
        "defect_breakdown": {row[0]: row[1] for row in defect_breakdown},
    }


def get_trends(db: Session, *, days: int = 7) -> list[dict]:
    date_col = func.date(Inspection.created_at)
    rows = (
        db.query(
            date_col.label("day"),
            func.count(Inspection.id).label("total"),
            func.sum(case((Inspection.status == "NOT_OK", 1), else_=0)).label("failures"),
        )
        .group_by(date_col)
        .order_by(date_col.desc())
        .limit(days)
        .all()
    )

    trends: list[dict] = []
    for row in reversed(rows):
        total = int(row.total or 0)
        failures = int(row.failures or 0)
        trends.append(
            {
                "date": str(row.day),
                "total": total,
                "failures": failures,
                "failure_rate": round((failures / total) * 100, 2) if total else 0,
            }
        )
    return trends
