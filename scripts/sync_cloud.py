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
from app.services.cloud_sync import flush_pending_sync


async def main():
    result = await flush_pending_sync(limit=1000)
    print(
        f"Sync attempted={result['attempted']}, remaining_unsynced={result['remaining_unsynced']}, "
        f"cloud_sync_enabled={result['cloud_sync_enabled']}"
    )


if __name__ == "__main__":
    asyncio.run(main())
