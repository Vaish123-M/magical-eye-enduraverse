from .inspection import router as inspection_router
from .alerts import router as alerts_router
from .dashboard import router as dashboard_router
from .auth import router as auth_router
from .device import router as device_router
from .analytics import router as analytics_router
from .simulate import router as simulate_router

__all__ = ["inspection_router", "alerts_router", "dashboard_router", "auth_router", "device_router", "analytics_router", "simulate_router"]
