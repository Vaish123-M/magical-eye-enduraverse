"""
Image storage service.

Writes images to either local disk or AWS S3 depending on STORAGE_BACKEND.
Returns the canonical path/URL that gets stored in the DB.
"""
from __future__ import annotations
import aiofiles
from pathlib import Path
from app.core.config import settings


async def save_image(raw_bytes: bytes, inspection_id: str, filename: str) -> str:
    ext = Path(filename).suffix or ".jpg"
    dest_name = f"{inspection_id}{ext}"
    # Always use local storage
    return await _save_local(raw_bytes, dest_name)


async def _save_local(raw_bytes: bytes, dest_name: str) -> str:
    base = Path(settings.LOCAL_STORAGE_PATH)
    base.mkdir(parents=True, exist_ok=True)
    dest = base / dest_name
    async with aiofiles.open(dest, "wb") as f:
        await f.write(raw_bytes)
    return f"/storage/{dest_name}"


# S3 upload code removed. Only local storage is supported now.
