# Architecture & System Design

## Overview

MagicalEye is a **production-grade** computer vision defect detection system. It processes images through a trained CNN model and provides human-in-the-loop verification.

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  - Inspection upload / camera capture                       │
│  - Results dashboard + history                              │
│  - Human review / override modal                            │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/JSON
┌──────────────────▼──────────────────────────────────────────┐
│                  Backend (FastAPI)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ API Routes                                             │ │
│  │ - /inspections/upload  → run inference                │ │
│  │ - /inspections/{id}/override → human decision         │ │
│  │ - /dashboard/stats     → aggregated KPIs              │ │
│  │ - /alerts              → defect notifications         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Services                                               │ │
│  │ - ai_service.py        → ONNX inference               │ │
│  │ - storage_service.py   → S3 / local disk              │ │
│  │ - alert_service.py     → email notifications          │ │
│  │ - cloud_sync.py        → offline-first sync           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Database (SQLAlchemy ORM)                              │ │
│  │ - Inspections (image path, status, defect type)        │ │
│  │ - Alerts (triggered on NOT_OK)                         │ │
│  │ - Audit trail (timestamps, overrides)                  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┬─────────────┐
        │                     │             │
    ┌───▼────┐  ┌────────┐  ┌─▼──────┐   ┌─▼───────┐
    │SQLite/ │  │ Storage│  │ Cloud  │   │ Email   │
    │PostGSQL│  │(S3)    │  │ Sync   │   │ (SMTP)  │
    └────────┘  └────────┘  └────────┘   └─────────┘
```

## Data Flow

### Inspection Upload
```
1. User uploads image (frontend)
   ↓
2. Backend receives multipart/form-data
   ↓
3. Image saved to storage (local / S3)
   ↓
4. Load pre-trained ONNX model
   ↓
5. Preprocess: resize (224×224), normalize
   ↓
6. Run inference → logits
   ↓
7. Softmax → class probabilities
   ↓
8. Store result in DB (status, defect_type, confidence, image_path)
   ↓
9. If NOT_OK: trigger alert + enqueue cloud sync
   ↓
10. Return InspectionOut to frontend
```

### Human Override
```
1. User views result card + clicks "Human Review"
   ↓
2. Modal opens: confirm AI verdict OR change to different verdict
   ↓
3. POST /inspections/{id}/override with reviewed_by, override_status
   ↓
4. Backend updates: override_status, reviewed_by, override_note
   ↓
5. Result card refreshed with override badge
```

### Cloud Sync (Offline-First)
```
In online mode:
  Image uploaded → inference → enqueue_sync() → async POST to cloud
  (If cloud unreachable, record marked synced=False for retry later)

In offline mode:
  Image uploaded → inference → DB stored locally with synced=False
  (Retry daemon: scripts/sync_cloud.py runs every 5min)
```

## Key Design Decisions

### **Why ONNX?**
- Trained in PyTorch (research-friendly, dynamic)
- Exported to ONNX (hardware-agnostic, optimized)
- Runtime: `onnxruntime` (CPU + GPU, mobile-ready)
- No torch dependency at inference time (smaller footprint)

### **Why EventBased Alerts?**
- Alert row created only on NOT_OK (reduces noise)
- Email sent asynchronously (doesn't block API)
- Acknowledged flag tracks human review

### **Why Zustand (not Redux)?**
- Minimal boilerplate for this proj scope
- No dispatch / action creators
- Direct state updates + selectors

### **Why FastAPI + Pydantic?**
- Auto OpenAPI docs (`/docs`, `/redoc`)
- Built-in validation, serialization
- Async handler support (non-blocking DB, I/O)
- Single dependency: `python-jose` for JWT

## Database Schema

### Inspections Table
```sql
CREATE TABLE inspections (
  id              VARCHAR PRIMARY KEY,
  product_id      VARCHAR NULLABLE,
  image_path      VARCHAR NOT NULL,
  status          VARCHAR(10) NOT NULL,          -- OK | NOT_OK
  defect_type     VARCHAR NULLABLE,              -- crack, scratch …
  confidence      FLOAT NOT NULL,
  reviewed_by     VARCHAR NULLABLE,              -- human name/ID
  override_status VARCHAR(10) NULLABLE,          -- human verdict
  override_note   TEXT NULLABLE,
  synced          BOOLEAN DEFAULT FALSE,
  created_at      DATETIME DEFAULT NOW(),
  updated_at      DATETIME ON UPDATE NOW()
);

CREATE INDEX idx_product_id ON inspections(product_id);
CREATE INDEX idx_status ON inspections(status);
```

### Alerts Table
```sql
CREATE TABLE alerts (
  id               VARCHAR PRIMARY KEY,
  inspection_id    VARCHAR NOT NULL,
  severity         VARCHAR(10) DEFAULT "HIGH",   -- LOW | MEDIUM | HIGH
  message          TEXT NOT NULL,
  acknowledged     BOOLEAN DEFAULT FALSE,
  acknowledged_by  VARCHAR NULLABLE,
  note             TEXT NULLABLE,
  created_at       DATETIME DEFAULT NOW(),
  FOREIGN KEY (inspection_id) REFERENCES inspections(id)
);

CREATE INDEX idx_acknowledged ON alerts(acknowledged);
```

## Potential Improvements

1. **Batch Processing** — Queue images, process in batches for throughput
2. **Model Versioning** — Support A/B testing of different models
3. **Explainability (XAI)** — Grad-CAM heatmaps showing defect regions
4. **Camera Stream** — Real-time feed processing (RTMP/MJPEG)
5. **Microservices** — Separate inference pod (can scale independently)
6. **Multi-GPU** — Distribute across GPUs for high load
7. **Confidence Calibration** — Post-hoc calibration for better thresholds
8. **Federated Learning** — Improve model on-site without data transfer

## Monitoring & Observability

- **Logs**: Structured JSON (ELK stack optional)
- **Metrics**: Prometheus `/metrics` endpoint (add `prometheus-client`)
- **Traces**: OpenTelemetry integration (optional, for large deployments)
- **Alerts**: Webhook to Slack on critical failures
