from sqlalchemy import Column, String, Float, JSON
from app.core.database import Base

class Part(Base):
    __tablename__ = "parts"
    id = Column(String, primary_key=True, index=True)  # part_id from QR
    dimensions = Column(JSON, nullable=False)  # e.g. {"width": 10.0, "height": 5.0}
    tolerances = Column(JSON, nullable=False)  # e.g. {"width": 0.2, "height": 0.1}
