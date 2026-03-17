# MagicalEye — Automated Defect Detection System

A production-ready hackathon project using **computer vision** to automatically detect manufacturing defects. 

## Core Features

- ✅ **Image Capture** — Upload or stream images for inspection
- ✅ **AI-Based Defect Detection** — MobileNetV3 CNN classifier
- ✅ **Classification** — OK | NOT_OK + specific defect type
- ✅ **Human Override** — Review and validate AI decisions
- ✅ **Real-time Alerts** — Email notifications on defects
- ✅ **Cloud Sync** — Offline mode + eventual consistency
- ✅ **Dashboard** — Inspect results, history, statistics
- ✅ **Database** — Persistent storage + audit trail

## Architecture

### Backend (FastAPI)
```
backend/
├── app/
│   ├── api/routes/        # Inspection, alerts, dashboard, auth
│   ├── core/              # Config, DB, security
│   ├── models/            # SQLAlchemy ORM
│   ├── schemas/           # Pydantic models
│   ├── services/          # AI, storage, cloud, alerts
│   └── crud/              # DB operations
├── main.py                # FastAPI app entry
└── requirements.txt
```

### Model (PyTorch → ONNX)
```
model/
├── architectures/         # DefectClassifier (MobileNetV3)
├── src/
│   ├── train.py          # Fine-tune on dataset
│   ├── evaluate.py       # Test split metrics
│   ├── export_onnx.py    # Convert to ONNX for inference
│   └── preprocess.py     # Prepare train/val/test splits
├── weights/              # Trained model checkpoints
└── exports/              # ONNX production model
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── pages/            # DashboardPage, InspectPage, etc.
│   ├── components/       # ResultCard, StatCard, DefectChart
│   ├── services/api.js   # API client
│   └── store/index.js    # Zustand state
└── vite.config.js
```

### Data & Config
```
dataset/          # Raw images, annotations, processed splits
configs/          # YAML: app.yaml, model.yaml, cloud.yaml
scripts/          # DB migration, export, cloud sync
docs/             # Architecture, deployment guides
```

## Quick Start

### **1. Backend Setup**
```bash
cd backend
pip install -r requirements.txt
python scripts/migrate_db.py
uvicorn main:app --reload
```
Backend runs at `http://localhost:8000`

### **2. Model Setup** (optional for dev)
```bash
cd model
pip install -r requirements.txt
python src/train.py --data_dir ../dataset/splits
python src/export_onnx.py
```

### **3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/v1/inspections/upload` | Upload image & run inference |
| `GET` | `/api/v1/inspections` | List all inspections |
| `PATCH` | `/api/v1/inspections/{id}/override` | Human review/override |
| `GET` | `/api/v1/dashboard/stats` | Aggregated KPIs |
| `GET` | `/api/v1/alerts` | List alerts |
| `PATCH` | `/api/v1/alerts/{id}/acknowledge` | Mark alert as reviewed |

## Environment Configuration

Create `.env` in `backend/`:
```env
DEBUG=True
DATABASE_URL=sqlite:///./magical_eye.db
SECRET_KEY=your-secret-key-change-in-prod
MODEL_PATH=../model/exports/defect_model.onnx
STORAGE_BACKEND=local                    # "local" or "s3"
LOCAL_STORAGE_PATH=../storage/images
CLOUD_SYNC_ENABLED=False
CLOUD_SYNC_ENDPOINT=https://api.example.com/sync
```

## Deployment

### Docker
```bash
docker-compose up -d
```
Spins up Backend (8000) + Frontend (3000) + SQLite

### Production Checklist
- [ ] Generate new `SECRET_KEY`
- [ ] Switch to **PostgreSQL** (`DATABASE_URL`)
- [ ] Configure **AWS S3** (`AWS_BUCKET`, `AWS_REGION`)
- [ ] Enable **HTTPS** + CORS on frontend domain
- [ ] Set up **email alerts** (SMTP config)
- [ ] Use **Alembic** for schema migrations
- [ ] Deploy model to **GPU-capable** hardware

## Defect Classes
```
0: OK
1: Crack
2: Scratch
3: Misalignment
4: Missing Component
5: Corrosion
```

## Technologies

| Layer | Tech | Why |
|-------|------|-----|
| **Backend** | FastAPI | High performance, auto-docs |
| **Model** | PyTorch → ONNX | Research-friendly → deployment-ready |
| **Frontend** | React + Vite | Fast HMR, modern tooling |
| **Database** | SQLite/PostgreSQL | Lightweight → enterprise |
| **Cloud** | AWS S3 + SQS (optional) | Scalable blob storage |
| **Auth** | JWT | Stateless, microservice-ready |

## Document Structure

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System design, data flow
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Docker, Kubernetes, cloud
- **[API.md](docs/API.md)** — Detailed endpoint reference
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** — Common issues

## License

MIT — Feel free to modify for production use.
