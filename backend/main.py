"""FastAPI application entry point."""
import logging
import sys
from pythonjsonlogger import jsonlogger

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.config import settings
from app.core.database import init_db, SessionLocal
from app.core.security import hash_password
from app.api import api_router
from app import crud
from app.schemas.user import UserCreate

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# Structured JSON logging
log_handler = logging.StreamHandler(sys.stdout)
log_handler.setFormatter(jsonlogger.JsonFormatter(
    '%(asctime)s %(levelname)s %(name)s %(message)s'
))
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    handlers=[log_handler]
)
logger = logging.getLogger("magical-eye")

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ───────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix=settings.API_PREFIX)

# ── Static files (stored inspection images) ──────────────────────────────────
storage_path = Path(settings.LOCAL_STORAGE_PATH)
storage_path.mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory=str(storage_path)), name="storage")


@app.on_event("startup")
def on_startup():
    init_db()
    # _seed_default_admin()  # Temporarily disabled due to bcrypt compatibility issues


def _seed_default_admin() -> None:
    db: Session = SessionLocal()
    try:
        existing = crud.user.get_by_username(db, username=settings.DEFAULT_ADMIN_USERNAME)
        if existing:
            return
        crud.user.create(
            db,
            obj_in=UserCreate(
                username=settings.DEFAULT_ADMIN_USERNAME,
                password=settings.DEFAULT_ADMIN_PASSWORD,
            ),
            password_hash=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
        )
        logger.warning(
            "Seeded default admin user '%s'. Change DEFAULT_ADMIN_PASSWORD in production.",
            settings.DEFAULT_ADMIN_USERNAME,
        )
    finally:
        db.close()


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    logger.exception("Unhandled server error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
@limiter.limit("100/minute")
def health_check(request: Request):
    """Health check with dependency status."""
    health_status = {
        "status": "ok",
        "dependencies": {}
    }
    
    # Check database
    try:
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        health_status["dependencies"]["database"] = "healthy"
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["dependencies"]["database"] = f"unhealthy: {str(e)}"
    
    # Check model file
    from pathlib import Path
    model_path = Path(settings.MODEL_PATH)
    if model_path.exists():
        health_status["dependencies"]["model"] = "healthy"
    else:
        health_status["status"] = "degraded"
        health_status["dependencies"]["model"] = "unhealthy: model file not found"
    
    # Check storage directory
    storage_path = Path(settings.LOCAL_STORAGE_PATH)
    if storage_path.exists() and storage_path.is_dir():
        health_status["dependencies"]["storage"] = "healthy"
    else:
        health_status["status"] = "degraded"
        health_status["dependencies"]["storage"] = "unhealthy: storage directory not accessible"
    
    return health_status
