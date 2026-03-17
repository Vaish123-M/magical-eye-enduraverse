"""
Database migration helper — thin wrapper around Alembic for common operations.

Usage:
    python scripts/migrate_db.py upgrade   # run pending migrations
    python scripts/migrate_db.py revision  # auto-generate new migration
    python scripts/migrate_db.py history   # show migration history
"""
import subprocess
import sys
from pathlib import Path

BACKEND = Path(__file__).parent.parent / "backend"


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "upgrade"
    if cmd == "upgrade":
        subprocess.run(["alembic", "upgrade", "head"], cwd=BACKEND, check=True)
    elif cmd == "revision":
        msg = sys.argv[2] if len(sys.argv) > 2 else "auto"
        subprocess.run(["alembic", "revision", "--autogenerate", "-m", msg], cwd=BACKEND, check=True)
    elif cmd == "history":
        subprocess.run(["alembic", "history", "--verbose"], cwd=BACKEND, check=True)
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)


if __name__ == "__main__":
    main()
