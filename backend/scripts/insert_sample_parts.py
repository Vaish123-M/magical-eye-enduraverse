import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../app')
from core.database import engine, Base, SessionLocal
from models.part import Part

def insert_sample_parts():
    session = SessionLocal()
    parts = [
        Part(
            id="PART123",
            dimensions={"width": 10.0, "height": 5.0},
            tolerances={"width": 0.2, "height": 0.1}
        ),
        Part(
            id="PART456",
            dimensions={"width": 20.0, "height": 8.0},
            tolerances={"width": 0.3, "height": 0.2}
        ),
    ]
    for part in parts:
        session.merge(part)
    session.commit()
    session.close()
    print("Sample parts inserted.")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    insert_sample_parts()
