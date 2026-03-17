"""
AI inference service.

Loads an ONNX model and runs classification on a PIL image.
Defect classes follow the label map in configs/model.yaml.
"""
from __future__ import annotations
import numpy as np
import onnxruntime as ort
from PIL import Image
from app.core.config import settings

# Label map: index → defect type (index 0 = OK)
LABELS = ["OK", "crack", "scratch", "misalignment", "missing_component", "corrosion"]

_session: ort.InferenceSession | None = None


def _get_session() -> ort.InferenceSession:
    global _session
    if _session is None:
        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
        _session = ort.InferenceSession(settings.MODEL_PATH, providers=providers)
    return _session


def _preprocess(image: Image.Image) -> np.ndarray:
    size = settings.MODEL_INPUT_SIZE
    image = image.resize((size, size))
    arr = np.array(image, dtype=np.float32) / 255.0
    # ImageNet normalisation
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    arr = (arr - mean) / std
    return arr.transpose(2, 0, 1)[np.newaxis]   # NCHW


async def run_inference(image: Image.Image) -> dict:
    session = _get_session()
    input_name = session.get_inputs()[0].name
    logits = session.run(None, {input_name: _preprocess(image)})[0][0]
    probs = _softmax(logits)
    class_idx = int(np.argmax(probs))
    confidence = float(probs[class_idx])
    label = LABELS[class_idx] if class_idx < len(LABELS) else "unknown"

    return {
        "status":      "OK" if class_idx == 0 else "NOT_OK",
        "defect_type": None if class_idx == 0 else label,
        "confidence":  confidence,
    }


def _softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - np.max(x))
    return e / e.sum()
