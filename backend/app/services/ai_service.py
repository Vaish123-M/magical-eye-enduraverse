"""AI inference service with ONNX + optional YOLOv8 support.

Model strategy:
- `.onnx`: classification (index 0 => OK)
- `.pt`: optional YOLOv8 detection model via ultralytics
- fallback: deterministic heuristic for local hackathon demos
"""
# pyright: reportMissingImports=false
from __future__ import annotations

from pathlib import Path
from typing import Any, cast
import importlib
import numpy as np
from PIL import Image

from app.core.config import settings

try:
    import onnxruntime as ort
except Exception:  # pragma: no cover - optional dependency in hackathon mode
    ort = None

LABELS = ["OK", "crack", "scratch", "misalignment", "missing_part"]

_onnx_session = None
_yolo_model = None


def _preprocess(image: Image.Image) -> np.ndarray:
    size = settings.MODEL_INPUT_SIZE
    image = image.resize((size, size))
    arr = np.array(image, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    arr = (arr - mean) / std
    return arr.transpose(2, 0, 1)[np.newaxis]


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
    raw_output = cast(list, session.run(None, feed))
    logits: np.ndarray = raw_output[0][0]
    probs = _softmax(logits)
    class_idx = int(np.argmax(probs))
    confidence = float(probs[class_idx])
    label = LABELS[class_idx] if class_idx < len(LABELS) else "unknown"
    return {
        "status": "OK" if class_idx == 0 else "NOT_OK",
        "prediction": label,
        "defect_type": None if class_idx == 0 else label,
        "confidence": confidence,
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
            "defect_type": None,
            "confidence": 0.95,
        }

    confidences = result.boxes.conf.cpu().numpy().tolist()
    classes = result.boxes.cls.cpu().numpy().astype(int).tolist()
    best_idx = int(np.argmax(confidences))
    cls_id = classes[best_idx]
    confidence = float(confidences[best_idx])
    class_name = str(result.names.get(cls_id, "defect")).lower().replace(" ", "_")
    defect = class_name if class_name in {"crack", "scratch", "missing_part", "misalignment"} else "misalignment"
    return {
        "status": "NOT_OK",
        "prediction": defect,
        "defect_type": defect,
        "confidence": confidence,
    }


def _fallback_inference(image: Image.Image) -> dict:
    arr = np.asarray(image.resize((64, 64)), dtype=np.float32)
    edge_strength = float(np.abs(np.diff(arr, axis=0)).mean() + np.abs(np.diff(arr, axis=1)).mean())
    if edge_strength > 70:
        return {
            "status": "NOT_OK",
            "prediction": "scratch",
            "defect_type": "scratch",
            "confidence": 0.62,
        }
    return {
        "status": "OK",
        "prediction": "OK",
        "defect_type": None,
        "confidence": 0.74,
    }


async def run_inference(image: Image.Image) -> dict:
    model_path = Path(settings.MODEL_PATH)
    if model_path.exists() and model_path.suffix.lower() == ".onnx":
        try:
            return _run_onnx(image)
        except Exception as exc:
            print(f"[AI] ONNX inference failed, fallback enabled: {exc}")

    if model_path.exists() and model_path.suffix.lower() == ".pt":
        try:
            return _run_yolo(image)
        except Exception as exc:
            print(f"[AI] YOLO inference failed, fallback enabled: {exc}")

    return _fallback_inference(image)
