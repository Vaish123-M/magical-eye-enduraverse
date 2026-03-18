from typing import Optional, List
from datetime import datetime
from app.core.database import Base
from app.models.alert import Alert
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid


def _uuid() -> str:
    return str(uuid.uuid4())


class Inspection(Base):
    __tablename__ = "inspections"

    id:              Mapped[str]            = mapped_column(sa.String, primary_key=True, default=_uuid)
    part_id:         Mapped[Optional[str]]  = mapped_column(sa.String, nullable=True, index=True)
    device_id:       Mapped[Optional[str]]  = mapped_column(sa.String, nullable=True, index=True)
    product_id:      Mapped[Optional[str]]  = mapped_column(sa.String, nullable=True, index=True)
    image_path:      Mapped[str]            = mapped_column(sa.String, nullable=False)
    status:          Mapped[str]            = mapped_column(sa.String(10), nullable=False)
    prediction:      Mapped[str]            = mapped_column(sa.String, nullable=False)
    defect_class:    Mapped[int]            = mapped_column(sa.Integer, nullable=False, default=0)
    defect_type:     Mapped[Optional[str]]  = mapped_column(sa.String, nullable=True)
    confidence:      Mapped[float]          = mapped_column(sa.Float, nullable=False)
    reviewed_by:     Mapped[Optional[str]]  = mapped_column(sa.String, nullable=True)
    override_status: Mapped[Optional[str]]  = mapped_column(sa.String(10), nullable=True)
    override_note:   Mapped[Optional[str]]  = mapped_column(sa.Text, nullable=True)
    synced:          Mapped[bool]           = mapped_column(sa.Boolean, default=False, nullable=False)
    created_at:      Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), server_default=sa.func.now())
    updated_at:      Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), onupdate=sa.func.now())

    alerts: Mapped[List["Alert"]] = relationship("Alert", back_populates="inspection", cascade="all, delete-orphan")
