from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type:   str


class LoginIn(BaseModel):
    username: str
    password: str


class TokenPayload(BaseModel):
    sub: str
