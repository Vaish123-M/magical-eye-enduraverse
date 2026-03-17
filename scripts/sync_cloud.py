"""
Offline → Cloud sync script.

Finds all inspection records with synced=False and pushes them to the
configured cloud endpoint. Run as a scheduled task / cron job.

Usage:
    python scripts/sync_cloud.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

import asyncio
from app.core.database import SessionLocal
from app.models.inspection import Inspection
from app.services.cloud_sync import enqueue_sync


async def main():
    db = SessionLocal()
    try:
        pending = db.query(Inspection).filter(Inspection.synced == False).all()  # noqa: E712
        print(f"Found {len(pending)} un-synced records.")
        for record in pending:
            await enqueue_sync(record)
        print("Sync complete.")
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
