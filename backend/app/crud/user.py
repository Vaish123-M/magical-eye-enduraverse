from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate


def get_by_username(db: Session, *, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def create(db: Session, *, obj_in: UserCreate, password_hash: str) -> User:
    user = User(
        username=obj_in.username,
        password_hash=password_hash,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
