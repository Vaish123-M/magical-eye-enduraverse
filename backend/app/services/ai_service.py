"""AI inference service with ONNX + optional YOLOv8 support.

Model strategy:
- `.onnx`: classification (index 0 => OK)
- `.pt`: optional YOLOv8 detection model via ultralytics
- fallback: deterministic heuristic for local hackathon demos
"""
# pyright: reportMissingImports=false
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, cast
import importlib
import numpy as np
import time
from PIL import Image

from app.core.config import settings

try:
    import onnxruntime as ort
except Exception:  # pragma: no cover - optional dependency in hackathon mode
    ort = None

LABELS = ["OK", "defective"]

_onnx_session = None
_yolo_model = None
logger = logging.getLogger("magical-eye.ai")


def _preprocess(image: Image.Image) -> np.ndarray:
    start = time.time()
    size = settings.MODEL_INPUT_SIZE
    image = image.resize((size, size))
    arr = np.array(image, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    arr = (arr - mean) / std
    arr_out = arr.transpose(2, 0, 1)[np.newaxis]
    logger.info(f"Preprocess time: {time.time() - start:.3f}s")
    return arr_out


def _softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - np.max(x))
    return e / e.sum()


def _load_onnx() -> Any:
    global _onnx_session
    if ort is None:
        raise RuntimeError("onnxruntime is not installed in current environment")
    if _onnx_session is None:
        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
        _onnx_session = ort.InferenceSession(settings.MODEL_PATH, providers=providers)
    return _onnx_session


def _run_onnx(image: Image.Image) -> dict:
    session = _load_onnx()
    input_name = session.get_inputs()[0].name
    feed: dict[str, Any] = {input_name: _preprocess(image)}
    start = time.time()
    raw_output = cast(list, session.run(None, feed))
    logger.info(f"ONNX inference time: {time.time() - start:.3f}s")
    logits: np.ndarray = raw_output[0][0]
    probs = _softmax(logits)
    defective_idx = LABELS.index("defective")
    defective_conf = float(probs[defective_idx])
    if defective_conf > 0.5:
        return {
            "status": "NOT_OK",
            "prediction": "defective",
            "defect_class": defective_idx,
            "defect_type": "defective",
            "confidence": defective_conf,
        }
    else:
        return {
            "status": "OK",
            "prediction": "OK",
            "defect_class": 0,
            "defect_type": None,
            "confidence": 1.0 - defective_conf,
        }


def _load_yolo():
    global _yolo_model
    if _yolo_model is None:
        ultralytics_mod = importlib.import_module("ultralytics")
        YOLO = getattr(ultralytics_mod, "YOLO")
        _yolo_model = YOLO(settings.MODEL_PATH)
    return _yolo_model


def _run_yolo(image: Image.Image) -> dict:
    model = _load_yolo()
    result = model.predict(image, verbose=False)[0]
    if result.boxes is None or len(result.boxes) == 0:
        return {
            "status": "OK",
            "prediction": "OK",
            "defect_class": 0,
            "defect_type": None,
            "confidence": 1.0,
        }

    confidences = result.boxes.conf.cpu().numpy().tolist()
    classes = result.boxes.cls.cpu().numpy().astype(int).tolist()
    names = result.names
    defective_indices = [i for i, cls in enumerate(classes) if str(names.get(cls, "")).lower().replace(" ", "_") == "defective"]
    if defective_indices:
        best_idx = defective_indices[np.argmax([confidences[i] for i in defective_indices])]
        confidence = float(confidences[best_idx])
        if confidence > 0.5:
            return {
                "status": "NOT_OK",
                "prediction": "defective",
                "defect_class": LABELS.index("defective"),
                "defect_type": "defective",
                "confidence": confidence,
            }
    return {
        "status": "OK",
        "prediction": "OK",
        "defect_class": 0,
        "defect_type": None,
        "confidence": 1.0,
    }


def _fallback_inference(image: Image.Image) -> dict:
    # Defect-focused heuristic: detect small dark blobs (defects).
    # This is a demo fallback and must never crash the API if OpenCV
    # isn't installed in the environment.
    try:
        import cv2  # type: ignore
        img = np.array(image.convert("L"))
        img = cv2.medianBlur(img, 5)
        _, thresh = cv2.threshold(img, 60, 255, cv2.THRESH_BINARY_INV)
        
        # Use contour detection instead of SimpleBlobDetector for better compatibility
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours by size to detect small defect-like areas
        keypoints = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if 10 < area < 500:  # Filter for small defect-like areas
                keypoints.append({"size": area})
        
        num_defects = len(keypoints)
        avg_size = np.mean([kp["size"] for kp in keypoints]) if keypoints else 0
        
        if num_defects > 3 and avg_size < 100:
            return {
                "status": "NOT_OK",
                "prediction": "defective",
                "defect_class": 1,
                "defect_type": "defective",
                "confidence": min(0.99, 0.5 + 0.1 * (num_defects - 3)),
            }
        return {
            "status": "OK",
            "prediction": "OK",
            "defect_class": 0,
            "defect_type": None,
            "confidence": 1.0,
        }
    except Exception as exc:
        logger.warning("OpenCV not available or blob detection failed: %s", exc)
        return {
            "status": "OK",
            "prediction": "fallback_ok",
            "defect_class": 0,
            "defect_type": None,
            "confidence": 0.5,
        }


async def run_inference(image: Image.Image) -> dict:
    model_path = Path(settings.MODEL_PATH)
    if model_path.exists() and model_path.suffix.lower() == ".onnx":
        try:
            return _run_onnx(image)
        except Exception as exc:
            logger.warning("ONNX inference failed, fallback enabled: %s", exc)

    if model_path.exists() and model_path.suffix.lower() == ".pt":
        try:
            return _run_yolo(image)
        except Exception as exc:
            logger.warning("YOLO inference failed, fallback enabled: %s", exc)

    return _fallback_inference(image)
