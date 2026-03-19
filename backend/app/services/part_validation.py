import cv2
import numpy as np
from pyzbar.pyzbar import decode
from fastapi import UploadFile
from typing import Optional

from ..models import part  # Assuming part.py defines Part model
from ..core import database

# --- QR Decoding ---
def extract_part_id_from_qr(image_bytes: bytes) -> Optional[str]:
    npimg = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    decoded_objs = decode(img)
    for obj in decoded_objs:
        data = obj.data.decode('utf-8')
        # Assume QR contains part_id directly
        return data
    return None

# --- Fetch part specs ---
def get_part_spec(part_id: str):
    # Example: SQLAlchemy ORM usage
    db = database.SessionLocal()
    part_obj = db.query(part.Part).filter(part.Part.id == part_id).first()
    db.close()
    import json
    if part_obj:
        # Handle SQLAlchemy JSON columns or fallback to JSON string
        dims = part_obj.dimensions
        tols = part_obj.tolerances
        # Avoid json.loads on SQLAlchemy Column objects
        from sqlalchemy.sql.schema import Column as SAColumn
        if not isinstance(dims, dict) and not isinstance(dims, SAColumn):
            try:
                dims = json.loads(dims)
            except Exception:
                dims = {}
        if not isinstance(tols, dict) and not isinstance(tols, SAColumn):
            try:
                tols = json.loads(tols)
            except Exception:
                tols = {}
        return {
            'dimensions': dims,
            'tolerances': tols
        }
    return None

# --- OpenCV Measurement ---
def measure_object_dimensions(image_bytes: bytes):
    npimg = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    if img is None:
        return None
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 50, 200)
    contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    c = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(c)
    return {'width': w, 'height': h}

# --- Validation Logic ---
def validate_part(image_bytes: bytes) -> dict:
    result = {'part_id': None, 'validation': 'SKIPPED', 'measured': None, 'spec': None}
    part_id = extract_part_id_from_qr(image_bytes)
    result['part_id'] = part_id
    measured = measure_object_dimensions(image_bytes)
    result['measured'] = measured
    if part_id and measured:
        spec = get_part_spec(part_id)
        result['spec'] = spec
        if spec:
            ok = True
            for dim in ['width', 'height']:
                if dim in measured and dim in spec['dimensions']:
                    min_v = spec['dimensions'][dim] - spec['tolerances'][dim]
                    max_v = spec['dimensions'][dim] + spec['tolerances'][dim]
                    if not (min_v <= measured[dim] <= max_v):
                        ok = False
            result['validation'] = 'OK' if ok else 'NOT_OK'
        else:
            result['validation'] = 'NO_SPEC'
    return result
