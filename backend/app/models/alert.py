from typing import Optional
from datetime import datetime
from app.core.database import Base
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid


def _uuid() -> str:
    return str(uuid.uuid4())


class Alert(Base):
    __tablename__ = "alerts"

    id:              Mapped[str]           = mapped_column(sa.String, primary_key=True, default=_uuid)
    inspection_id:   Mapped[str]           = mapped_column(sa.String, sa.ForeignKey("inspections.id"), nullable=False)
    severity:        Mapped[str]           = mapped_column(sa.String(10), default="HIGH")
    message:         Mapped[str]           = mapped_column(sa.Text, nullable=False)
    acknowledged:    Mapped[bool]          = mapped_column(sa.Boolean, default=False)
    acknowledged_by: Mapped[Optional[str]] = mapped_column(sa.String, nullable=True)
    note:            Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    created_at:      Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), server_default=sa.func.now())

    inspection: Mapped["Inspection"] = relationship("Inspection", back_populates="alerts")
