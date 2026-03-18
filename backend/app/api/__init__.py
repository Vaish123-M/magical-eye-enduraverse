from fastapi import APIRouter

from app.api.routes import (
    inspection_router,
    alerts_router,
    dashboard_router,
    auth_router,
    device_router,
    analytics_router,
    simulate_router,
)

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(inspection_router)
api_router.include_router(alerts_router)
api_router.include_router(dashboard_router)
api_router.include_router(device_router)
api_router.include_router(analytics_router)
api_router.include_router(simulate_router)
