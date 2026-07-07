"""Tests for inference pipeline."""
import pytest
from pathlib import Path
from PIL import Image
import numpy as np
import tempfile
import asyncio

# pyright: reportMissingImports=false
from app.services.ai_service import run_inference


@pytest.fixture
def sample_image():
    """Create a sample test image."""
    # Create a simple 224x224 RGB image
    img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    return Image.fromarray(img_array)


@pytest.mark.asyncio
async def test_inference_returns_valid_structure(sample_image):
    """Test that inference returns a valid prediction structure."""
    result = await run_inference(sample_image)
    
    assert isinstance(result, dict)
    assert "status" in result
    assert "prediction" in result
    assert "defect_class" in result
    assert "defect_type" in result
    assert "confidence" in result
    
    assert result["status"] in ["OK", "NOT_OK"]
    assert result["defect_class"] in [0, 1]  # Binary classification: OK (0) or defective (1)
    assert 0.0 <= result["confidence"] <= 1.0


@pytest.mark.asyncio
async def test_inference_with_corrupt_image():
    """Test that inference handles corrupt images gracefully."""
    # Test with invalid data - this should raise an exception
    with pytest.raises((AttributeError, TypeError)):
        await run_inference(None)  # type: ignore


@pytest.mark.asyncio
async def test_inference_with_different_sizes():
    """Test that inference handles different image sizes."""
    sizes = [(100, 100), (512, 512), (1920, 1080)]
    
    for width, height in sizes:
        img_array = np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)
        img = Image.fromarray(img_array)
        
        result = await run_inference(img)
        assert isinstance(result, dict)
        assert "confidence" in result


@pytest.mark.asyncio
async def test_inference_confidence_range(sample_image):
    """Test that confidence scores are always in valid range."""
    result = await run_inference(sample_image)
    
    assert 0.0 <= result["confidence"] <= 1.0
    assert isinstance(result["confidence"], (int, float))


@pytest.mark.asyncio
async def test_inference_defect_type_mapping():
    """Test that defect_type is correctly mapped to defect_class."""
    img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    img = Image.fromarray(img_array)
    
    result = await run_inference(img)
    
    # If defect_class is 0 (OK), defect_type should be None
    if result["defect_class"] == 0:
        assert result["defect_type"] is None
    else:
        # For defect class (1), defect_type should be "defective"
        assert result["defect_type"] == "defective"
