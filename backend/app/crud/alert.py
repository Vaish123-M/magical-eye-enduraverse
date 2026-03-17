"""CRUD helpers for Alert model."""
from sqlalchemy.orm import Session
from app.models.alert import Alert


def get(db: Session, *, id: str) -> Alert | None:
    return db.query(Alert).filter(Alert.id == id).first()


def get_multi(db: Session, *, unread_only: bool = False) -> list[Alert]:
    q = db.query(Alert).order_by(Alert.created_at.desc())
    if unread_only:
        q = q.filter(Alert.acknowledged == False)  # noqa: E712
    return q.all()


def acknowledge(db: Session, *, db_obj: Alert, note: str | None) -> Alert:
    db_obj.acknowledged = True
    db_obj.note = note
    db.commit()
    db.refresh(db_obj)
    return db_obj
