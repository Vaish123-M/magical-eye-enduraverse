from pydantic import BaseModel
from typing import Optional, Dict, List

class DefectTrend(BaseModel):
    date: str
    total: int
    failures: int
    failure_rate: float

class AnalyticsResponse(BaseModel):
    total: int
    ok: int
    not_ok: int
    most_frequent_defect: Optional[str]
    defect_breakdown: Dict[str, int]
    trends: List[DefectTrend]
