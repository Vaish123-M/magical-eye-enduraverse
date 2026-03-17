"""Auth routes — JWT login/logout (swap out for OAuth2 in production)."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.schemas.auth import Token, LoginIn
from app import crud

router = APIRouter(prefix="/auth", tags=["Auth"])


def _login_core(*, username: str, password: str, db: Session) -> Token:
    user = crud.user.get_by_username(db, username=username)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user.username})
    return Token(access_token=token, token_type="bearer")


@router.post("/token", response_model=Token)
def token_login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return _login_core(username=form.username, password=form.password, db=db)


@router.post("/login", response_model=Token)
def login(body: LoginIn, db: Session = Depends(get_db)):
    return _login_core(username=body.username, password=body.password, db=db)
