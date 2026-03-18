from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analytics import AnalyticsResponse, DefectTrend
from app import crud

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    stats = crud.inspection.get_stats(db)
    trends = crud.inspection.get_trends(db, days=30)
    return AnalyticsResponse(
        total=stats["total"],
        ok=stats["ok"],
        not_ok=stats["not_ok"],
        most_frequent_defect=stats["most_frequent_defect"],
        defect_breakdown=stats["defect_breakdown"],
        trends=[DefectTrend(**t) for t in trends],
    )
