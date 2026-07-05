
# MagicalEye — Smart-Factory Glass Porosity Detection

A production-ready AI-powered defect detection system using computer vision to detect porosity, cracks, and surface voids in aluminum and other factory parts. Built for interview-grade demonstration with comprehensive ML infrastructure.

---

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ESP32-CAM     │    │   Raspberry Pi  │    │   Web Browser   │
│   / RPi Camera  │    │   Camera Module │    │   (Frontend)    │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │ HTTP/REST           │ HTTP/REST            │ WebSocket
         ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │   Auth      │  │  Inference  │  │   Storage   │  │  Cache  ││
│  │   (JWT)     │  │   (ONNX)    │  │  (S3/Local) │  │ (Redis) ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘│
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │   RBAC      │  │   Celery    │  │  WebSocket  │  │ Tracing ││
│  │ (Roles)     │  │  (Tasks)    │  │  (Realtime) │  │(OTel)   ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘│
└─────────────────────────────────────────────────────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  PostgreSQL     │    │     Redis       │    │    MLflow       │
│  (Database)     │    │   (Cache/Queue) │    │  (Experiments)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Core Features

### ML/AI Capabilities
- ✅ **4-Class Classification** — OK, porosity, crack, surface_void
- ✅ **ONNX Inference** — Production-ready model deployment
- ✅ **Grad-CAM Visualization** — Model explainability with heatmaps
- ✅ **MLflow Tracking** — Experiment logging and hyperparameter tracking
- ✅ **Class Imbalance Handling** — Weighted loss and augmentation support
- ✅ **Drift Monitoring** — Confidence tracking and low-confidence flagging
- ✅ **Comprehensive Evaluation** — Precision, recall, F1, confusion matrix

### System Features
- ✅ **Hardware Capture** — ESP32-CAM or Raspberry Pi stream with LED/laser-assisted illumination
- ✅ **QR-Based Part Validation** — Extracts part ID from QR code, validates dimensions against spec
- ✅ **Classification** — OK | NOT_OK + specific defect type + part traceability
- ✅ **Human Override** — Review and validate AI decisions
- ✅ **Real-time Alerts** — Email notifications on defects
- ✅ **Cloud Sync** — Offline mode + eventual consistency
- ✅ **Dashboard** — Inspect results, history, statistics
- ✅ **WebSocket Updates** — Real-time inspection status
- ✅ **RBAC** — Role-based access control (admin, inspector, viewer)
- ✅ **CSRF Protection** — Secure state-changing requests
- ✅ **Redis Caching** — Performance optimization
- ✅ **Celery Tasks** — Background job processing
- ✅ **API Versioning** — /api/v1/ and /api/v2/ support
- ✅ **GraphQL API** — Alternative query interface
- ✅ **Docker Compose** — Full containerization with 8 services
- ✅ **Distributed Tracing** — OpenTelemetry with Jaeger/OTLP
- ✅ **Prometheus/Grafana** — Metrics and visualization

---

## ML Infrastructure

### Model Training & Evaluation

**Training with MLflow:**
```bash
cd model
pip install -r requirements.txt
python src/train.py --data_dir ../dataset/splits --epochs 30
```

**Evaluation with Metrics:**
```bash
python src/evaluate.py --weights model/weights/best_model.pth --data_dir dataset/splits
```
Generates:
- `model/weights/results.md` — Classification report with precision/recall/F1
- `model/weights/confusion_matrix.png` — Visual confusion matrix
- `model/weights/eval_results.json` — Detailed metrics

**Class Imbalance Analysis:**
```bash
python src/check_imbalance.py --data_dir dataset/raw
```
Generates:
- `model/weights/class_distribution.json` — Class counts and recommended weights

**Grad-CAM Visualization:**
```bash
python src/gradcam.py --weights model/weights/best_model.pth --image_path path/to/image.jpg
```
Generates:
- `model/weights/gradcam_*.png` — Heatmap visualization showing model focus

### Experiment Tracking

Start MLflow UI:
```bash
mlflow ui
```
Access at `http://localhost:5000` to view:
- Training runs comparison
- Hyperparameter tracking
- Metric trends over epochs
- Model artifacts

---

## How to Reproduce Results

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker (optional, for full stack)

### Step 1: Dataset Preparation
```bash
# Organize dataset as:
dataset/
├── raw/
│   ├── OK/
│   ├── porosity/
│   ├── crack/
│   └── surface_void/
```

### Step 2: Check Class Distribution
```bash
cd model
python src/check_imbalance.py --data_dir ../dataset/raw
```
Review `model/weights/class_distribution.json` for imbalance recommendations.

### Step 3: Train Model
```bash
python src/train.py --data_dir ../dataset/splits --epochs 30 --batch_size 32
```
Training logs to MLflow automatically.

### Step 4: Evaluate Model
```bash
python src/evaluate.py --weights model/weights/best_model.pth --data_dir dataset/splits
```
Review `model/weights/results.md` for metrics.

### Step 5: Export ONNX
```bash
python src/export_onnx.py
```

### Step 6: Run Tests
```bash
cd backend
pytest tests/test_inference.py -v
pytest tests/test_api.py -v
```

### Step 7: Start Full Stack
```bash
docker-compose up -d
```
Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090

---

## Model Metrics

**Note:** Actual metrics require a trained dataset. The infrastructure is ready to generate:
- Overall accuracy
- Per-class precision/recall/F1
- Confusion matrix
- Macro and weighted averages

Run evaluation after training to populate `model/weights/results.md`.

---

## Testing & CI/CD

### Local Testing
```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm test -- --coverage

# ML tests
cd model
python -c "from model.architectures.defect_cnn import DefectClassifier"
```

### CI/CD
GitHub Actions workflows:
- `.github/workflows/ci.yml` — Backend and frontend tests
- `.github/workflows/ml-ci.yml` — Model structure and inference tests

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/health` | System health check (database, redis, model) |
| `POST` | `/api/v1/inspections/upload` | Upload image & run inference |
| `POST` | `/api/v1/device/ingest` | Ingest frame from ESP32/RPi device |
| `GET` | `/api/v1/inspections` | List all inspections |
| `GET` | `/api/v1/analytics/performance-metrics` | Performance metrics by time period |
| `GET` | `/graphql` | GraphQL API endpoint |
| `GET` | `/metrics` | Prometheus metrics |

---

## Environment Configuration

Create `.env` in `backend/`:
```env
DEBUG=True
DATABASE_URL=postgresql+asyncpg://magical_eye:magical_eye@postgres:5432/magical_eye
SECRET_KEY=your-secret-key-change-in-prod
MODEL_PATH=../model/exports/defect_model.onnx
STORAGE_BACKEND=local                    # "local" or "s3"
LOCAL_STORAGE_PATH=../storage/images
REDIS_HOST=redis
REDIS_PORT=6379
CACHE_ENABLED=True
AWS_BUCKET=your-bucket-name              # For S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
```

---

## Deployment

### Docker Compose (Recommended)
```bash
docker-compose up -d
```
Services:
- Backend (8000)
- Frontend (5173)
- PostgreSQL (5432)
- Redis (6379)
- Celery Worker
- Celery Beat
- Prometheus (9090)
- Grafana (3001)

### Production Checklist
- [ ] Generate new `SECRET_KEY`
- [ ] Use **PostgreSQL** with async support
- [ ] Configure **AWS S3** for image storage
- [ ] Enable **HTTPS** + CORS on frontend domain
- [ ] Set up **email alerts** (SMTP config)
- [ ] Configure **MLflow** for production experiment tracking
- [ ] Set up **Prometheus/Grafana** for monitoring
- [ ] Enable **distributed tracing** with Jaeger
- [ ] Use **Alembic** for schema migrations
- [ ] Deploy model to **GPU-capable** hardware

---

## Defect Classes
```
0: OK
1: porosity
2: crack
3: surface_void
```

---

## Technologies

| Layer | Tech | Why |
|-------|------|-----|
| **Backend** | FastAPI | High performance, auto-docs |
| **Model** | PyTorch → ONNX | Research-friendly → deployment-ready |
| **Frontend** | React + Vite | Fast HMR, modern tooling |
| **Database** | PostgreSQL (async) | Enterprise-grade, concurrent |
| **Cache** | Redis | Performance, Celery broker |
| **Task Queue** | Celery | Background job processing |
| **Tracing** | OpenTelemetry | Distributed tracing |
| **Monitoring** | Prometheus + Grafana | Metrics and visualization |
| **Experiment Tracking** | MLflow | ML experiment management |
| **Containerization** | Docker Compose | Multi-service orchestration |
| **Auth** | JWT + RBAC | Stateless, role-based access |
| **API** | REST + GraphQL | Flexible query options |

---

## Document Structure

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System design, data flow
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Docker, Kubernetes, cloud
- **[API.md](docs/API.md)** — Detailed endpoint reference
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** — Common issues
- **[PHASE2_INTERVIEW_SUMMARY.md](PHASE2_INTERVIEW_SUMMARY.md)** — Phase 2 improvements
- **[PHASE3_INTERVIEW_SUMMARY.md](PHASE3_INTERVIEW_SUMMARY.md)** — Phase 3 improvements

---

## License

MIT — Feel free to modify for production use.
