"""Shared pytest fixtures for backend API and service tests."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from app.core.database import Base, get_db
from app.models.user import User

TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create and tear down an isolated database for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create a test client using the isolated database session."""
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client, db):
    """Create a test user and return an OAuth2 bearer header."""
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "Test123!"},
    )
    token = response.json()["access_token"]
    db.query(User).filter(User.username == "testuser").update({"role": "inspector"})
    db.commit()
    return {"Authorization": f"Bearer {token}"}
