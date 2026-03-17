# Troubleshooting

## Common Issues & Solutions

### Backend Won't Start

**Problem:** `ModuleNotFoundError: No module named 'app'`

**Solution:**
```bash
cd backend
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
uvicorn main:app --reload
```

---

### Model File Not Found

**Problem:** `FileNotFoundError: model/exports/defect_model.onnx`

**Solution:**
```bash
# Export the model first
cd model
python src/export_onnx.py --weights weights/best_model.pth --out exports/defect_model.onnx
```

---

### Database Lock Error (SQLite)

**Problem:** `database is locked`

**Solution:**
- SQLite doesn't handle concurrent writes well. For production, **switch to PostgreSQL**:
  ```env
  DATABASE_URL=postgresql://user:pass@localhost:5432/magical_eye
  ```

- For dev, restart the backend:
  ```bash
  rm magical_eye.db
  python scripts/migrate_db.py
  ```

---

### CORS Errors (Frontend → Backend)

**Problem:** `XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Check backend CORS config in `main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       # ...
   )
   ```

2. Verify the frontend runs on the correct port (default `5173`)

3. For production, update the allowed origin:
   ```python
   allow_origins=["https://your-domain.com"]
   ```

---

### Inference Returns "Unknown" Label

**Problem:** Model predicts index outside the label range

**Solution:**
- Ensure `LABELS` in `ai_service.py` matches `configs/model.yaml`:
  ```python
  LABELS = ["OK", "crack", "scratch", "misalignment", "missing_component", "corrosion"]
  ```

- Check model was trained on 6 classes:
  ```bash
  cd model
  python src/evaluate.py --weights weights/best_model.pth
  ```

---

### GPU Not Detected

**Problem:** `onnxruntime` only uses CPU

**Solution:**
1. Install GPU provider:
   ```bash
   pip install onnxruntime-gpu
   ```

2. Verify CUDA availability:
   ```bash
   python -c "import onnxruntime; print(onnxruntime.get_available_providers())"
   ```

3. Should output: `['CUDAExecutionProvider', 'CPUExecutionProvider']`

---

### Email Alerts Not Sending

**Problem:** Alerts created but no emails received

**Solution:**
1. Check `ALERT_EMAIL_ENABLED=True` in `.env`

2. Verify SMTP credentials:
   ```bash
   python -c "
   import smtplib
   with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
       smtp.starttls()
       smtp.login('your-email@gmail.com', 'app-password')
       print('✓ SMTP OK')
   "
   ```

3. Check backend logs for exceptions:
   ```bash
   tail -f backend/logs.txt
   ```

4. For Gmail, use **App Password**, not regular password:
   - Go to `myaccount.google.com/apppasswords`
   - Generate app password for "Mail" + "Windows"

---

### Cloud Sync Gets Stuck

**Problem:** Records stay `synced=False`

**Solution:**
1. Check cloud endpoint:
   ```bash
   curl -X POST https://your-cloud-api.com/sync \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

2. Verify `CLOUD_SYNC_ENDPOINT` is correct in `.env`

3. Run sync retry daemon manually:
   ```bash
   python scripts/sync_cloud.py
   ```

4. Check logs for network errors:
   ```bash
   tail -f backend/logs.txt | grep CloudSync
   ```

---

### Slow Inference Time

**Problem:** Inference takes >2 seconds per image

**Optimization:**
1. **Use GPU** (see *GPU Not Detected*)

2. **Reduce input size** (trade accuracy for speed):
   ```env
   MODEL_INPUT_SIZE=160  # instead of 224
   ```

3. **Switch to smaller model** in `model/architectures/defect_cnn.py`:
   ```python
   # Change from MobileNetV3-Small to SqueezeNet
   backbone = models.squeezenet1_0(pretrained=True)
   ```

4. **Batch processing** — upload multiple images at once (future enhancement)

---

### High Memory Usage

**Problem:** Backend process uses >1GB RAM

**Solution:**
1. **Reduce model size** — use MobileNetV3 instead of ResNet-50

2. **Limit inference concurrency**:
   ```python
   from asyncio import Semaphore
   inference_sem = Semaphore(1)  # Only 1 inference at a time
   ```

3. **Enable memory monitoring**:
   ```bash
   pip install memory-profiler
   python -m memory_profiler main.py
   ```

---

### Frontend Keeps Reloading Images

**Problem:** Browser caches old inspection images

**Solution:**
```javascript
// frontend/src/services/api.js
const http = axios.create({
  baseURL: '/api/v1',
  headers: { 'Cache-Control': 'no-cache' }
})
```

---

### Tests Failing

**Problem:** `pytest` can't import modules

**Solution:**
```bash
cd backend
pip install pytest pytest-asyncio
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
pytest tests/
```

---

### Docker Build Fails

**Problem:** `hash sum mismatch` or `pip install hangs`

**Solution:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

---

## Logs & Debugging

### Enable Debug Mode
```env
DEBUG=True
```

### Log Inference Details
```python
# In backend/app/services/ai_service.py
import logging
logger = logging.getLogger(__name__)

logger.info(f"Inference: status={status}, confidence={confidence:.2%}")
```

### View Real-Time Logs
```bash
# Docker
docker logs -f magical-eye-backend

# Direct
tail -f backend/logs.txt

# With timestamps
tail -f backend/logs.txt | while IFS= read -r line; do echo "$(date '+%Y-%m-%d %H:%M:%S') $line"; done
```

---

## Performance Tuning

### Database Indexing
```sql
CREATE INDEX idx_status_created ON inspections(status, created_at DESC);
CREATE INDEX idx_synced_created ON inspections(synced, created_at DESC);
```

### Pagination Best Practices
```python
# Instead of fetching all 10,000 records:
# ❌ inspections = db.query(Inspection).all()

# ✅ Use limit + offset:
inspections = db.query(Inspection).offset(skip).limit(limit).all()
```

### Caching Dashboard Stats
```python
from functools import lru_cache
@lru_cache(maxsize=1)
def get_statistics():
    # Cache for 5 minutes
    return {...}
```

---

## Getting Help

1. **Check the docs:**
   - [ARCHITECTURE.md](ARCHITECTURE.md) — System design
   - [API.md](API.md) — Endpoint reference
   - [DEPLOYMENT.md](DEPLOYMENT.md) — Setup & deploy

2. **Inspect logs:**
   ```bash
   docker logs magical-eye-backend | grep ERROR
   ```

3. **Test individual components:**
   ```bash
   # API
   curl http://localhost:8000/health

   # Database
   python -c "from app.core.database import get_db; list(get_db())"

   # Model
   python model/src/export_onnx.py
   ```

4. **Ask in issues** or **Slack**: Document the error, steps to reproduce, and your environment.
