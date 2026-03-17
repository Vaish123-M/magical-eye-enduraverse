"""FastAPI application entry point."""
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import init_db, SessionLocal
from app.core.security import hash_password
from app.api import api_router
from app import crud
from app.schemas.user import UserCreate


logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("magical-eye")

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
)

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
    _seed_default_admin()


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
def health_check():
    return {"status": "ok"}
