"""Auth routes — JWT login/logout (swap out for OAuth2 in production)."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token, verify_password
from app.schemas.auth import Token

router = APIRouter(prefix="/auth", tags=["Auth"])

# Placeholder — replace with DB-backed user lookup
FAKE_USERS = {"admin": "changeme"}


@router.post("/token", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends()):
    hashed = FAKE_USERS.get(form.username)
    if not hashed or not verify_password(form.password, hashed):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": form.username})
    return {"access_token": token, "token_type": "bearer"}
