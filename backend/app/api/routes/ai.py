"""AI platform metadata endpoints."""
from fastapi import APIRouter

from app.services.ai_service import get_model_info

router = APIRouter(prefix="/ai", tags=["AI Platform"])


@router.get("/model-info")
def model_info() -> dict:
    """Return the active model contract for reproducible deployments."""
    return get_model_info()
