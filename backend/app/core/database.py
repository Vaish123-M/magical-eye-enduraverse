"""Database engine, session factory, and Base declarative class."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

# Check if using async PostgreSQL
if "postgresql+asyncpg" in settings.DATABASE_URL or "sqlite" in settings.DATABASE_URL:
    # Async engine for PostgreSQL or SQLite
    engine = create_async_engine(
        settings.DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://") if "sqlite" in settings.DATABASE_URL else settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=settings.DB_ECHO,
    )
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    ASYNC_MODE = True
else:
    # Sync engine for other databases
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=settings.DB_ECHO,
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    ASYNC_MODE = False

Base = declarative_base()


async def get_db():
    """FastAPI dependency — yields a DB session and guarantees cleanup (async)."""
    async for session in async_get_db():
        yield session


async def async_get_db():
    """Async generator for database sessions."""
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_db_sync():
    """FastAPI dependency — yields a DB session and guarantees cleanup (sync)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def init_db():
    """Create all tables on startup (use Alembic for production migrations)."""
    from app.models import inspection, alert, user  # noqa: F401 — registers models
    if ASYNC_MODE:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    else:
        Base.metadata.create_all(bind=engine)
    _apply_sqlite_compatibility_migrations()


def _apply_sqlite_compatibility_migrations():
    """Best-effort schema patching for local SQLite hackathon environments."""
    if "sqlite" not in settings.DATABASE_URL:
        return

    with engine.connect() as conn:
        cols = conn.exec_driver_sql("PRAGMA table_info(inspections)").fetchall()
        existing = {row[1] for row in cols}
        changed = False
        # Newer schema adds device_id for IoT ingestion; older DBs may miss it.
        if "device_id" not in existing:
            conn.exec_driver_sql("ALTER TABLE inspections ADD COLUMN device_id VARCHAR")
            changed = True
        if "prediction" not in existing:
            conn.exec_driver_sql("ALTER TABLE inspections ADD COLUMN prediction VARCHAR DEFAULT 'OK'")
            changed = True
        if "defect_class" not in existing:
            conn.exec_driver_sql("ALTER TABLE inspections ADD COLUMN defect_class INTEGER DEFAULT 0")
            changed = True
        if "part_id" not in existing:
            conn.exec_driver_sql("ALTER TABLE inspections ADD COLUMN part_id VARCHAR")
            changed = True
        if changed:
            conn.commit()
