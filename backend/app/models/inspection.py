from app.core.database import Base
import sqlalchemy as sa
from sqlalchemy.orm import relationship
import uuid


def _uuid() -> str:
    return str(uuid.uuid4())


class Inspection(Base):
    __tablename__ = "inspections"

    id          = sa.Column(sa.String, primary_key=True, default=_uuid)
    product_id  = sa.Column(sa.String, nullable=True, index=True)
    image_path  = sa.Column(sa.String, nullable=False)
    status      = sa.Column(sa.String(10), nullable=False)          # OK | NOT_OK
    defect_type = sa.Column(sa.String, nullable=True)               # crack, scratch …
    confidence  = sa.Column(sa.Float, nullable=False)
    reviewed_by = sa.Column(sa.String, nullable=True)               # human override
    override_status = sa.Column(sa.String(10), nullable=True)       # human verdict
    override_note   = sa.Column(sa.Text, nullable=True)
    synced      = sa.Column(sa.Boolean, default=False, nullable=False)
    created_at  = sa.Column(sa.DateTime(timezone=True), server_default=sa.func.now())
    updated_at  = sa.Column(sa.DateTime(timezone=True), onupdate=sa.func.now())

    alerts = relationship("Alert", back_populates="inspection", cascade="all, delete-orphan")
