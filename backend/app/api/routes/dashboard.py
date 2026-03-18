"""Dashboard routes — aggregated statistics and KPIs for the frontend."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app import crud

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_statistics(db: Session = Depends(get_db)):
    """Return high-level counts: total inspections, pass rate, defect breakdown."""
    return crud.inspection.get_stats(db)


@router.get("/recent")
def get_recent(limit: int = 10, db: Session = Depends(get_db)):
    return crud.inspection.get_multi(db, skip=0, limit=limit)


@router.get("/trends")
def get_trends(days: int = 7, db: Session = Depends(get_db)):
    safe_days = max(1, min(days, 90))
    return crud.inspection.get_trends(db, days=safe_days)
