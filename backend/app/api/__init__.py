from fastapi import APIRouter

from app.api.routes import (
    inspection_router,
    alerts_router,
    dashboard_router,
    auth_router,
    device_router,
    analytics_router,
    simulate_router,
    graphql_router,
    ai_router,
)

# The application mounts this router at /api/v1. Keeping the version prefix
# here as well would accidentally publish endpoints at /api/v1/v1/*.
api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(inspection_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(device_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(simulate_router)
api_v1_router.include_router(ai_router)

# Version 2 API (future version - currently aliases to v1)
api_v2_router = APIRouter(prefix="/v2")
api_v2_router.include_router(auth_router)
api_v2_router.include_router(inspection_router)
api_v2_router.include_router(alerts_router)
api_v2_router.include_router(dashboard_router)
api_v2_router.include_router(device_router)
api_v2_router.include_router(analytics_router)
api_v2_router.include_router(simulate_router)
api_v2_router.include_router(ai_router)

# Main router includes both versions and GraphQL
api_router = APIRouter()
api_router.include_router(api_v1_router)
api_router.include_router(api_v2_router)
api_router.include_router(graphql_router)
