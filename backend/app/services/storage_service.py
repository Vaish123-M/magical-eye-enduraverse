"""
Image storage service.

Writes images to either local disk or AWS S3 depending on STORAGE_BACKEND.
Returns the canonical path/URL that gets stored in the DB.
"""
from __future__ import annotations
import aiofiles
import boto3
from botocore.exceptions import ClientError
from pathlib import Path
from app.core.config import settings


async def save_image(raw_bytes: bytes, inspection_id: str, filename: str) -> str:
    ext = Path(filename).suffix or ".jpg"
    dest_name = f"{inspection_id}{ext}"
    
    if settings.STORAGE_BACKEND == "s3":
        return await _save_s3(raw_bytes, dest_name)
    else:
        return await _save_local(raw_bytes, dest_name)


async def _save_local(raw_bytes: bytes, dest_name: str) -> str:
    base = Path(settings.LOCAL_STORAGE_PATH)
    base.mkdir(parents=True, exist_ok=True)
    dest = base / dest_name
    async with aiofiles.open(dest, "wb") as f:
        await f.write(raw_bytes)
    return f"/storage/{dest_name}"


async def _save_s3(raw_bytes: bytes, dest_name: str) -> str:
    """Save image to AWS S3."""
    if not all([settings.AWS_BUCKET, settings.AWS_REGION, settings.AWS_ACCESS_KEY, settings.AWS_SECRET_KEY]):
        raise ValueError("S3 credentials not configured. Set AWS_BUCKET, AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY.")
    
    s3_client = boto3.client(
        's3',
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY,
        aws_secret_access_key=settings.AWS_SECRET_KEY
    )
    
    key = f"inspections/{dest_name}"
    
    try:
        s3_client.put_object(
            Bucket=settings.AWS_BUCKET,
            Key=key,
            Body=raw_bytes,
            ContentType='image/jpeg',
            ACL='private'
        )
        # Return S3 URL (presigned URL can be generated when needed)
        return f"s3://{settings.AWS_BUCKET}/{key}"
    except ClientError as e:
        raise RuntimeError(f"Failed to upload to S3: {e}")


def get_presigned_url(s3_path: str, expiration: int = 3600) -> str:
    """Generate a presigned URL for S3 object access."""
    if not s3_path.startswith("s3://"):
        return s3_path  # Return local path as-is
    
    if not all([settings.AWS_BUCKET, settings.AWS_REGION, settings.AWS_ACCESS_KEY, settings.AWS_SECRET_KEY]):
        raise ValueError("S3 credentials not configured")
    
    s3_client = boto3.client(
        's3',
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY,
        aws_secret_access_key=settings.AWS_SECRET_KEY
    )
    
    # Extract key from s3://bucket/key format
    path_parts = s3_path.replace("s3://", "").split("/", 1)
    bucket = path_parts[0]
    key = path_parts[1] if len(path_parts) > 1 else ""
    
    try:
        return s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': key},
            ExpiresIn=expiration
        )
    except ClientError as e:
        raise RuntimeError(f"Failed to generate presigned URL: {e}")
