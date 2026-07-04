"""Dashboard routes — aggregated statistics and KPIs for the frontend."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.cache import get_cache, set_cache
from app import crud

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_statistics(db: Session = Depends(get_db)):
    """Return high-level counts: total inspections, pass rate, defect breakdown."""
    cache_key = "dashboard:stats"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    stats = crud.inspection.get_stats(db)
    set_cache(cache_key, stats, ttl=60)  # Cache for 1 minute
    return stats


@router.get("/recent")
def get_recent(limit: int = 10, db: Session = Depends(get_db)):
    cache_key = f"dashboard:recent:{limit}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    recent = crud.inspection.get_multi(db, skip=0, limit=limit)
    set_cache(cache_key, recent, ttl=30)  # Cache for 30 seconds
    return recent


@router.get("/trends")
def get_trends(days: int = 7, db: Session = Depends(get_db)):
    safe_days = max(1, min(days, 90))
    cache_key = f"dashboard:trends:{safe_days}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    trends = crud.inspection.get_trends(db, days=safe_days)
    set_cache(cache_key, trends, ttl=300)  # Cache for 5 minutes
    return trends
