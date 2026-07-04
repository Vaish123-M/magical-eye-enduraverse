"""Auth routes — JWT login/logout (swap out for OAuth2 in production)."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from app.core.database import get_db
from app.core.config import settings
from app.core.database import engine
from app.core.security import (
    create_access_token, 
    create_refresh_token, 
    verify_password, 
    hash_password,
    verify_token_type,
    try_decode_access_token
)
from app.models.user import User
from app.schemas.auth import Token, LoginIn, RefreshTokenRequest
from app.schemas.user import UserCreate
from app import crud

router = APIRouter(prefix="/auth", tags=["Auth"])


def _ensure_auth_ready(db: Session) -> None:
    # Guards against stale dev DBs where server was not restarted after auth model changes.
    User.__table__.create(bind=engine, checkfirst=True)

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
    
    # Store refresh token in database
    user.refresh_token = refresh_token
    db.commit()
    
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@router.post("/token", response_model=Token)
def token_login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return _login_core(username=form.username, password=form.password, db=db)


@router.post("/login", response_model=Token)
def login(body: LoginIn, db: Session = Depends(get_db)):
    return _login_core(username=body.username, password=body.password, db=db)


@router.post("/refresh", response_model=Token)
def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    # Verify refresh token type
    if not verify_token_type(body.refresh_token, "refresh"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token type"
        )
    
    # Decode and get username
    payload = try_decode_access_token(body.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Verify refresh token exists in database
    user = crud.user.get_by_username(db, username=username)
    if not user or user.refresh_token != body.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or revoked"
        )
    
    # Generate new tokens
    new_access_token = create_access_token({"sub": user.username})
    new_refresh_token = create_refresh_token({"sub": user.username})
    
    # Update refresh token in database (rotation)
    user.refresh_token = new_refresh_token
    db.commit()
    
    return Token(access_token=new_access_token, refresh_token=new_refresh_token, token_type="bearer")


@router.post("/logout")
def logout(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Revoke refresh token."""
    payload = try_decode_access_token(body.refresh_token)
    if payload:
        username = payload.get("sub")
        if username:
            user = crud.user.get_by_username(db, username=username)
            if user and user.refresh_token == body.refresh_token:
                user.refresh_token = None
                db.commit()
    
    return {"message": "Successfully logged out"}
