"""Shared validation for uploaded and camera-captured images."""
from __future__ import annotations

import base64
import binascii
import io
from pathlib import Path

from fastapi import HTTPException
from PIL import Image, UnidentifiedImageError

MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_FORMATS = {"JPEG", "PNG", "JPG"}
MIN_IMAGE_DIMENSION = 64
MAX_IMAGE_DIMENSION = 4096


def validate_image(raw: bytes, filename: str) -> Image.Image:
    if not filename or Path(filename).suffix.lstrip(".").upper() not in ALLOWED_FORMATS:
        raise HTTPException(status_code=400, detail="Allowed image formats: JPEG, PNG")
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB")

    try:
        image = Image.open(io.BytesIO(raw))
        image_format = (image.format or "").upper()
        extension = Path(filename).suffix.lstrip(".").upper()
        normalized_extension = "JPEG" if extension in {"JPG", "JPEG"} else extension
        if image_format not in ALLOWED_FORMATS or image_format != normalized_extension:
            raise HTTPException(status_code=400, detail="Image content does not match filename")
        width, height = image.size
        if min(width, height) < MIN_IMAGE_DIMENSION:
            raise HTTPException(status_code=400, detail="Image too small. Minimum dimension is 64px")
        if max(width, height) > MAX_IMAGE_DIMENSION:
            raise HTTPException(status_code=400, detail="Image too large. Maximum dimension is 4096px")
        return image.convert("RGB")
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="Invalid image file or corrupted data")


def decode_base64_image(encoded: str, filename: str) -> tuple[bytes, Image.Image]:
    value = encoded.split(",", 1)[1] if "," in encoded else encoded
    try:
        raw = base64.b64decode(value, validate=True)
    except (ValueError, binascii.Error):
        raise HTTPException(status_code=400, detail="Invalid base64 image payload")
    return raw, validate_image(raw, filename)
