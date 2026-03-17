"""
Setup script — creates Python virtual environments and installs dependencies
for both backend and model packages.

Usage:
    python scripts/setup.py
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent


def run(cmd: str, cwd: Path) -> None:
    print(f"\n▶ {cmd}  (cwd={cwd})")
    subprocess.run(cmd, shell=True, cwd=cwd, check=True)


def main():
    # Backend
    run(f"{sys.executable} -m venv .venv", cwd=ROOT / "backend")
    venv_pip = str(ROOT / "backend" / ".venv" / "Scripts" / "pip")
    run(f"{venv_pip} install -r requirements.txt", cwd=ROOT / "backend")

    # Model
    run(f"{sys.executable} -m venv .venv", cwd=ROOT / "model")
    venv_pip_model = str(ROOT / "model" / ".venv" / "Scripts" / "pip")
    run(f"{venv_pip_model} install -r requirements.txt", cwd=ROOT / "model")

    # Frontend
    run("npm install", cwd=ROOT / "frontend")

    print("\n✅ Setup complete.")
    print("   Backend: cd backend && .venv\\Scripts\\activate && uvicorn main:app --reload")
    print("   Frontend: cd frontend && npm run dev")


if __name__ == "__main__":
    main()
