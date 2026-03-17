"""Simulate an IoT device sending an inspection frame to MagicalEye.

Usage:
  python scripts/simulate_device_send.py --api http://127.0.0.1:8000/api/v1 --part-id PART-1001
"""
from __future__ import annotations

import argparse
import base64
import io

import requests
from PIL import Image, ImageDraw


def build_demo_image() -> str:
    img = Image.new("RGB", (320, 240), (18, 26, 40))
    draw = ImageDraw.Draw(img)
    draw.rectangle((20, 20, 300, 220), outline=(56, 189, 248), width=3)
    draw.ellipse((130, 85, 200, 155), fill=(244, 63, 94))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--api", default="http://127.0.0.1:8000/api/v1")
    parser.add_argument("--device-key", default="demo-device-key")
    parser.add_argument("--part-id", default="PART-DEMO-001")
    args = parser.parse_args()

    payload = {
        "image_base64": build_demo_image(),
        "part_id": args.part_id,
        "device_id": "raspberry-pi-cam",
        "filename": "iot-frame.jpg",
    }
    headers = {"x-device-key": args.device_key}

    resp = requests.post(f"{args.api}/device/ingest", json=payload, headers=headers, timeout=20)
    print(f"status={resp.status_code}")
    print(resp.text)


if __name__ == "__main__":
    main()
