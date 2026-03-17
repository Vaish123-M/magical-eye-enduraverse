"""
Image storage service.

Writes images to either local disk or AWS S3 depending on STORAGE_BACKEND.
Returns the canonical path/URL that gets stored in the DB.
"""
from __future__ import annotations
import os
import aiofiles
from pathlib import Path
from app.core.config import settings


async def save_image(raw_bytes: bytes, inspection_id: str, filename: str) -> str:
    ext = Path(filename).suffix or ".jpg"
    dest_name = f"{inspection_id}{ext}"

    if settings.STORAGE_BACKEND == "s3":
        return await _upload_s3(raw_bytes, dest_name)
    return await _save_local(raw_bytes, dest_name)


async def _save_local(raw_bytes: bytes, dest_name: str) -> str:
    base = Path(settings.LOCAL_STORAGE_PATH)
    base.mkdir(parents=True, exist_ok=True)
    dest = base / dest_name
    async with aiofiles.open(dest, "wb") as f:
        await f.write(raw_bytes)
    return str(dest)


async def _upload_s3(raw_bytes: bytes, dest_name: str) -> str:
    import boto3
    s3 = boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY,
        aws_secret_access_key=settings.AWS_SECRET_KEY,
    )
    key = f"inspections/{dest_name}"
    s3.put_object(Bucket=settings.AWS_BUCKET, Key=key, Body=raw_bytes, ContentType="image/jpeg")
    return f"https://{settings.AWS_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
