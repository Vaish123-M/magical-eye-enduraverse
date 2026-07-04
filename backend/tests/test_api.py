"""API endpoint tests."""
import pytest
from PIL import Image
import io


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_user(client):
    """Test user registration."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "newuser",
            "password": "Password123!"
        }
    )
    assert response.status_code == 201
    assert "access_token" in response.json()


def test_login_user(client):
    """Test user login."""
    # First register
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "loginuser",
            "password": "Password123!"
        }
    )
    
    # Then login
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "loginuser",
            "password": "Password123!"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_upload_inspection_unauthorized(client):
    """Test that upload requires authentication."""
    # Create a dummy image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    response = client.post(
        "/api/v1/inspections/upload",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 401


def test_upload_inspection_authorized(client, auth_headers):
    """Test upload with authentication."""
    # Create a dummy image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    response = client.post(
        "/api/v1/inspections/upload",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert "id" in response.json()
    assert "status" in response.json()


def test_list_inspections(client, auth_headers):
    """Test listing inspections."""
    response = client.get(
        "/api/v1/inspections",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_dashboard_stats(client, auth_headers):
    """Test dashboard statistics."""
    response = client.get(
        "/api/v1/dashboard/stats",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert "total" in response.json()
    assert "ok" in response.json()
