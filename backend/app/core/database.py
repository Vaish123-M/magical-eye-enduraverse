"""Database engine, session factory, and Base declarative class."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session and guarantees cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables on startup (use Alembic for production migrations)."""
    from app.models import inspection, alert  # noqa: F401 — registers models
    Base.metadata.create_all(bind=engine)
    _apply_sqlite_compatibility_migrations()


def _apply_sqlite_compatibility_migrations():
    """Best-effort schema patching for local SQLite hackathon environments."""
    if "sqlite" not in settings.DATABASE_URL:
        return

    with engine.connect() as conn:
        cols = conn.exec_driver_sql("PRAGMA table_info(inspections)").fetchall()
        existing = {row[1] for row in cols}
        if "prediction" not in existing:
            conn.exec_driver_sql("ALTER TABLE inspections ADD COLUMN prediction VARCHAR DEFAULT 'OK'")
            conn.commit()
