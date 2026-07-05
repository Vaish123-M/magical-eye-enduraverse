from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta
from app.core.database import get_db
from app.schemas.analytics import AnalyticsResponse, DefectTrend
from app import crud
from app.models.inspection import Inspection

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


@router.get("/performance-metrics")
def get_performance_metrics(db: Session = Depends(get_db)):
    """Get detailed performance metrics including defect rates by time period."""
    now = datetime.utcnow()
    
    # Last 24 hours
    day_ago = now - timedelta(days=1)
    day_stats = db.query(
        func.count(Inspection.id).label('total'),
        func.sum(case((Inspection.status == 'OK', 1), else_=0)).label('ok'),
        func.sum(case((Inspection.status == 'NOT_OK', 1), else_=0)).label('not_ok')
    ).filter(Inspection.created_at >= day_ago).first()
    
    # Last 7 days
    week_ago = now - timedelta(days=7)
    week_stats = db.query(
        func.count(Inspection.id).label('total'),
        func.sum(case((Inspection.status == 'OK', 1), else_=0)).label('ok'),
        func.sum(case((Inspection.status == 'NOT_OK', 1), else_=0)).label('not_ok')
    ).filter(Inspection.created_at >= week_ago).first()
    
    # Last 30 days
    month_ago = now - timedelta(days=30)
    month_stats = db.query(
        func.count(Inspection.id).label('total'),
        func.sum(case((Inspection.status == 'OK', 1), else_=0)).label('ok'),
        func.sum(case((Inspection.status == 'NOT_OK', 1), else_=0)).label('not_ok')
    ).filter(Inspection.created_at >= month_ago).first()
    
    return {
        "last_24h": {
            "total": day_stats.total or 0,
            "ok": day_stats.ok or 0,
            "not_ok": day_stats.not_ok or 0,
            "defect_rate": (day_stats.not_ok / day_stats.total * 100) if day_stats.total else 0
        },
        "last_7d": {
            "total": week_stats.total or 0,
            "ok": week_stats.ok or 0,
            "not_ok": week_stats.not_ok or 0,
            "defect_rate": (week_stats.not_ok / week_stats.total * 100) if week_stats.total else 0
        },
        "last_30d": {
            "total": month_stats.total or 0,
            "ok": month_stats.ok or 0,
            "not_ok": month_stats.not_ok or 0,
            "defect_rate": (month_stats.not_ok / month_stats.total * 100) if month_stats.total else 0
        }
    }


@router.get("/defect-distribution")
def get_defect_distribution(db: Session = Depends(get_db), days: int = 30):
    """Get defect type distribution over time."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    defects = db.query(
        Inspection.defect_type,
        func.count(Inspection.id).label('count')
    ).filter(
        and_(
            Inspection.created_at >= cutoff,
            Inspection.status == 'NOT_OK',
            Inspection.defect_type.isnot(None)
        )
    ).group_by(Inspection.defect_type).order_by(desc('count')).all()
    
    return {
        "period_days": days,
        "defects": [{"type": d[0], "count": d[1]} for d in defects]
    }


@router.get("/hourly-throughput")
def get_hourly_throughput(db: Session = Depends(get_db), days: int = 7):
    """Get inspection throughput by hour."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    throughput = db.query(
        func.date_trunc('hour', Inspection.created_at).label('hour'),
        func.count(Inspection.id).label('count')
    ).filter(Inspection.created_at >= cutoff).group_by('hour').order_by('hour').all()
    
    return {
        "period_days": days,
        "hourly_data": [{"hour": t[0].isoformat(), "count": t[1]} for t in throughput]
    }


# Helper for SQL case statement
from sqlalchemy import case
