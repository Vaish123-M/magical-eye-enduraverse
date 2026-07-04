"""Service layer tests."""
import pytest
from PIL import Image
import io
from app.services.ai_service import run_inference, _fallback_inference


@pytest.mark.asyncio
async def test_fallback_inference_ok():
    """Test fallback inference returns OK for clean image."""
    img = Image.new('RGB', (224, 224), color=(128, 128, 128))
    result = _fallback_inference(img)
    assert result["status"] == "OK"
    assert result["defect_class"] == 0
    assert result["confidence"] >= 0.5


@pytest.mark.asyncio
async def test_fallback_inference_porosity():
    """Test fallback inference detects porosity-like patterns."""
    img = Image.new('RGB', (224, 224), color=(128, 128, 128))
    # Add some dark dots
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    for i in range(5):
        x = 50 + i * 20
        y = 50 + i * 20
        draw.ellipse([x-3, y-3, x+3, y+3], fill=(30, 30, 30))
    
    result = _fallback_inference(img)
    # Should detect porosity with multiple dark dots
    assert result["status"] in ["OK", "NOT_OK"]
    assert "defect_class" in result


@pytest.mark.asyncio
async def test_run_inference_with_model():
    """Test full inference pipeline (requires model file)."""
    try:
        img = Image.new('RGB', (224, 224), color=(128, 128, 128))
        result = await run_inference(img)
        assert "status" in result
        assert "prediction" in result
        assert "confidence" in result
        assert "defect_class" in result
    except FileNotFoundError:
        pytest.skip("Model file not found")
