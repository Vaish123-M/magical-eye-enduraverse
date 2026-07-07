"""Tests for CRUD operations and business logic."""
# pyright: reportMissingImports=false
import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.inspection import Inspection
from app.crud import inspection as inspection_crud
from app.schemas.inspection import InspectionCreate, OverrideIn


@pytest.fixture
def db_session():
    """Create a test database session."""
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_create_inspection(db_session):
    """Test creating an inspection record."""
    inspection_data = InspectionCreate(
        id="test-123",
        part_id="part-001",
        image_path="storage/images/test.jpg",
        status="OK",
        prediction="OK",
        defect_class=0,
        defect_type=None,
        confidence=0.95,
    )
    
    result = inspection_crud.create(db_session, obj_in=inspection_data)
    
    assert result.id == "test-123"
    assert result.part_id == "part-001"
    assert result.status == "OK"
    assert result.confidence == 0.95


def test_get_inspection(db_session):
    """Test retrieving an inspection by ID."""
    inspection_data = InspectionCreate(
        id="test-456",
        part_id="part-002",
        image_path="storage/images/test2.jpg",
        status="NOT_OK",
        prediction="defective",
        defect_class=1,
        defect_type="defective",
        confidence=0.85,
    )
    inspection_crud.create(db_session, obj_in=inspection_data)
    
    result = inspection_crud.get(db_session, id="test-456")
    
    assert result is not None
    assert result.id == "test-456"
    assert result.status == "NOT_OK"


def test_get_inspection_not_found(db_session):
    """Test retrieving a non-existent inspection."""
    result = inspection_crud.get(db_session, id="non-existent")
    assert result is None


def test_get_multi_inspections(db_session):
    """Test retrieving multiple inspections with pagination."""
    for i in range(5):
        inspection_data = InspectionCreate(
            id=f"test-{i}",
            part_id=f"part-{i}",
            image_path=f"storage/images/test{i}.jpg",
            status="OK" if i % 2 == 0 else "NOT_OK",
            prediction="OK" if i % 2 == 0 else "defective",
            defect_class=0 if i % 2 == 0 else 1,
            defect_type=None if i % 2 == 0 else "defective",
            confidence=0.9,
        )
        inspection_crud.create(db_session, obj_in=inspection_data)
    
    results = inspection_crud.get_multi(db_session, skip=0, limit=3)
    
    assert len(results) == 3
    results_limited = inspection_crud.get_multi(db_session, skip=0, limit=2)
    assert len(results_limited) == 2


def test_get_multi_by_part_id(db_session):
    """Test filtering inspections by part ID."""
    inspection_crud.create(db_session, obj_in=InspectionCreate(
        id="test-1", part_id="part-A", image_path="img1.jpg",
        status="OK", prediction="OK", defect_class=0, confidence=0.9
    ))
    inspection_crud.create(db_session, obj_in=InspectionCreate(
        id="test-2", part_id="part-A", image_path="img2.jpg",
        status="NOT_OK", prediction="defective", defect_class=1, defect_type="defective", confidence=0.8
    ))
    inspection_crud.create(db_session, obj_in=InspectionCreate(
        id="test-3", part_id="part-B", image_path="img3.jpg",
        status="OK", prediction="OK", defect_class=0, confidence=0.9
    ))
    
    results = inspection_crud.get_multi(db_session, part_id="part-A")
    
    assert len(results) == 2
    assert all(r.part_id == "part-A" for r in results)


def test_apply_override(db_session):
    """Test applying a human override to an inspection."""
    inspection_data = InspectionCreate(
        id="test-override",
        part_id="part-001",
        image_path="storage/images/test.jpg",
        status="NOT_OK",
        prediction="defective",
        defect_class=1,
        defect_type="defective",
        confidence=0.75,
    )
    inspection = inspection_crud.create(db_session, obj_in=inspection_data)
    
    override_data = OverrideIn(
        override_status="OK",
        reviewed_by="inspector-john",
        note="False positive - lighting issue"
    )
    
    updated = inspection_crud.apply_override(db_session, db_obj=inspection, override=override_data)
    
    assert updated.override_status == "OK"
    assert updated.reviewed_by == "inspector-john"
    assert updated.override_note == "False positive - lighting issue"


def test_get_stats(db_session):
    """Test calculating inspection statistics."""
    # Create test data: 3 OK, 2 NOT_OK
    for i in range(3):
        inspection_crud.create(db_session, obj_in=InspectionCreate(
            id=f"ok-{i}", image_path=f"ok{i}.jpg",
            status="OK", prediction="OK", defect_class=0, confidence=0.9
        ))
    for i in range(2):
        inspection_crud.create(db_session, obj_in=InspectionCreate(
            id=f"not-ok-{i}", image_path=f"notok{i}.jpg",
            status="NOT_OK", prediction="defective", defect_class=1, defect_type="defective", confidence=0.8
        ))
    
    stats = inspection_crud.get_stats(db_session)
    
    assert stats["total"] == 5
    assert stats["ok"] == 3
    assert stats["not_ok"] == 2
    assert stats["pass_rate"] == 60.0
    assert stats["failure_rate"] == 40.0
    assert stats["most_frequent_defect"] == "defective"


def test_get_stats_empty(db_session):
    """Test statistics with no inspections."""
    stats = inspection_crud.get_stats(db_session)
    
    assert stats["total"] == 0
    assert stats["ok"] == 0
    assert stats["not_ok"] == 0
    assert stats["pass_rate"] == 0
    assert stats["failure_rate"] == 0
    assert stats["most_frequent_defect"] is None


def test_get_trends(db_session):
    """Test calculating inspection trends over time."""
    from datetime import timedelta
    
    base_date = datetime.utcnow()
    
    # Create inspections over 3 days
    for day_offset in range(3):
        date = base_date - timedelta(days=day_offset)
        for i in range(3):
            inspection_data = InspectionCreate(
                id=f"trend-{day_offset}-{i}",
                image_path=f"trend{day_offset}{i}.jpg",
                status="OK" if i < 2 else "NOT_OK",
                prediction="OK" if i < 2 else "defective",
                defect_class=0 if i < 2 else 1,
                defect_type="defective" if i >= 2 else None,
                confidence=0.9,
            )
            inspection = inspection_crud.create(db_session, obj_in=inspection_data)
            # Manually set created_at for testing
            inspection.created_at = date
            db_session.commit()
    
    trends = inspection_crud.get_trends(db_session, days=3)
    
    assert len(trends) == 3
    assert all("date" in t for t in trends)
    assert all("total" in t for t in trends)
    assert all("failure_rate" in t for t in trends)
