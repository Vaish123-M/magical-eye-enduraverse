"""CSRF protection utilities."""
from itsdangerous import URLSafeTimedSerializer
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.core.config import settings

security = HTTPBearer()
serializer = URLSafeTimedSerializer(settings.SECRET_KEY, salt="csrf-protection-salt")
CSRF_TOKEN_EXPIRE_SECONDS = 3600  # 1 hour


def generate_csrf_token() -> str:
    """Generate a CSRF token."""
    return serializer.dumps("csrf_token", salt="csrf-protection-salt")


def validate_csrf_token(token: str) -> bool:
    """Validate a CSRF token."""
    try:
        serializer.loads(
            token,
            salt="csrf-protection-salt",
            max_age=CSRF_TOKEN_EXPIRE_SECONDS
        )
        return True
    except Exception:
        return False


async def verify_csrf(request: Request) -> None:
    """Verify CSRF token from request headers."""
    # Skip CSRF for GET, HEAD, OPTIONS, TRACE (safe methods)
    if request.method in ["GET", "HEAD", "OPTIONS", "TRACE"]:
        return
    
    # Get CSRF token from header
    csrf_token = request.headers.get("X-CSRF-Token")
    if not csrf_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing"
        )
    
    if not validate_csrf_token(csrf_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired CSRF token"
        )
