from app.core.database import Base
import sqlalchemy as sa
from sqlalchemy.orm import relationship
import uuid


def _uuid() -> str:
    return str(uuid.uuid4())


class Alert(Base):
    __tablename__ = "alerts"

    id             = sa.Column(sa.String, primary_key=True, default=_uuid)
    inspection_id  = sa.Column(sa.String, sa.ForeignKey("inspections.id"), nullable=False)
    severity       = sa.Column(sa.String(10), default="HIGH")    # LOW | MEDIUM | HIGH
    message        = sa.Column(sa.Text, nullable=False)
    acknowledged   = sa.Column(sa.Boolean, default=False)
    acknowledged_by = sa.Column(sa.String, nullable=True)
    note           = sa.Column(sa.Text, nullable=True)
    created_at     = sa.Column(sa.DateTime(timezone=True), server_default=sa.func.now())

    inspection = relationship("Inspection", back_populates="alerts")
