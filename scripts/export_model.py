"""
One-shot model export script.

Usage:
    python scripts/export_model.py --weights model/weights/best_model.pth
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent


def main():
    subprocess.run(
        [sys.executable, "model/src/export_onnx.py"] + sys.argv[1:],
        cwd=ROOT,
        check=True,
    )


if __name__ == "__main__":
    main()
