"""Authentication routes for local JWT sessions."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app import crud
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    try_decode_access_token,
    verify_password,
    verify_token_type,
)
from app.models.user import User
from app.schemas.auth import LoginIn, RefreshTokenRequest, Token
from app.schemas.user import UserCreate

router = APIRouter(prefix="/auth", tags=["Auth"])


def _ensure_auth_ready(db: Session) -> None:
    """Create the configured development admin account on first use."""
    existing = crud.user.get_by_username(db, username=settings.DEFAULT_ADMIN_USERNAME)
    if existing:
        return

    crud.user.create(
        db,
        obj_in=UserCreate(
            username=settings.DEFAULT_ADMIN_USERNAME,
            password=settings.DEFAULT_ADMIN_PASSWORD,
        ),
        password_hash=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
    )


def _login_core(*, username: str, password: str, db: Session) -> Token:
    try:
        _ensure_auth_ready(db)
        user = crud.user.get_by_username(db, username=username)
    except OperationalError:
        _ensure_auth_ready(db)
        user = crud.user.get_by_username(db, username=username)

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({"sub": user.username})
    refresh_token = create_refresh_token({"sub": user.username})
    user.refresh_token = refresh_token
    db.commit()
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(body: UserCreate, db: Session = Depends(get_db)) -> Token:
    """Create a local account and return tokens for the new session."""
    if crud.user.get_by_username(db, username=body.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already registered",
        )
    user = crud.user.create(
        db,
        obj_in=body,
        password_hash=hash_password(body.password),
    )
    return _login_core(username=user.username, password=body.password, db=db)


@router.post("/token", response_model=Token)
def token_login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    return _login_core(username=form.username, password=form.password, db=db)


@router.post("/login", response_model=Token)
def login(body: LoginIn, db: Session = Depends(get_db)) -> Token:
    return _login_core(username=body.username, password=body.password, db=db)


@router.post("/refresh", response_model=Token)
def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)) -> Token:
    """Refresh access token using a valid, currently stored refresh token."""
    if not verify_token_type(body.refresh_token, "refresh"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token type",
        )

    payload = try_decode_access_token(body.refresh_token)
    username = payload.get("sub") if payload else None
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user = crud.user.get_by_username(db, username=username)
    if not user or user.refresh_token != body.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or revoked",
        )

    new_access_token = create_access_token({"sub": user.username})
    new_refresh_token = create_refresh_token({"sub": user.username})
    user.refresh_token = new_refresh_token
    db.commit()
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
    )


@router.post("/logout")
def logout(body: RefreshTokenRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    """Revoke the supplied refresh token when it belongs to the current session."""
    payload = try_decode_access_token(body.refresh_token)
    username = payload.get("sub") if payload else None
    if username:
        user = crud.user.get_by_username(db, username=username)
        if user and user.refresh_token == body.refresh_token:
            user.refresh_token = None
            db.commit()
    return {"message": "Successfully logged out"}
