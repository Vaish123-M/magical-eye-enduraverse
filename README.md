
# MagicalEye — Smart-Factory Glass Porosity Detection

A production-ready hackathon project using low-cost hardware and computer vision to detect porosity defects in aluminum and other factory parts.

---

# Core Features

- ✅ **Hardware Capture** — ESP32-CAM or Raspberry Pi stream with LED/laser-assisted illumination
- ✅ **AI-Based Defect Detection** — ONNX inference focused on porosity and surface defects
- ✅ **QR-Based Part Validation** — Extracts part ID from QR code, validates dimensions against spec
- ✅ **Classification** — OK | NOT_OK + specific defect type + part traceability
- ✅ **Human Override** — Review and validate AI decisions
- ✅ **Real-time Alerts** — Email notifications on defects
- ✅ **Cloud Sync** — Offline mode + eventual consistency
- ✅ **Dashboard** — Inspect results, history, statistics
- ✅ **Database** — Persistent storage + audit trail
- ✅ **Voice Feedback** — Browser-based audio for inspection results (OK/NOT_OK)

---

To store inspection images in AWS S3 instead of local disk:

1. Set `STORAGE_BACKEND=s3` in `backend/.env`.
2. Fill in `AWS_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY`, and `AWS_SECRET_KEY` with your S3 bucket and IAM credentials.
3. Restart the backend server.

Images will be uploaded to S3 and URLs stored in the database. Never commit your `.env` file with real credentials.


# Testing & Validation

## Simulate Device Ingestion
- Run: `python scripts/simulate_device_send.py` (backend)
- This sends a test image as if from a real device. Check the dashboard for new inspection records.

## End-to-End Test Steps
1. Start backend and frontend servers.
2. Use the dashboard or Inspect page to upload an image or run a simulation.
3. Confirm new inspection appears in dashboard and history.
4. For device traceability, check that device_id and part_id are recorded.
5. If using S3, verify images appear in your S3 bucket.


## Troubleshooting

- **Live-captured images not appearing in history:**
	- If images captured via camera do not show up in the inspection history, check backend logs for errors after capture. Ensure the backend is running and reachable from the frontend. See `docs/TROUBLESHOOTING.md` for more.

- **Voice feedback not playing:**
	- Ensure your browser supports audio playback and is not blocking autoplay. Audio feedback is handled in the browser, not the backend.

- **QR/Part validation fails:**
	- If QR code is not detected, ensure the code is clear and well-lit. If part spec is missing, add the part to the database with correct dimensions and tolerances.

- See `docs/TROUBLESHOOTING.md` for more issues and solutions.


# FAQ / Known Issues


**Q: How do I switch between local and S3 storage?**
A: Change `STORAGE_BACKEND` in `backend/.env` and restart the backend.

**Q: How do I test without hardware?**
A: Use the simulation endpoints or `simulate_device_send.py` script.

**Q: How do I reset the database?**
A: Delete `magical_eye.db` and run `python scripts/migrate_db.py`.

**Q: Where are the defect labels defined?**
A: In `backend/app/services/ai_service.py` (LABELS list) and used throughout backend/frontend.

**Q: How do I add a new defect type?**
A: Update the model, retrain, and update the LABELS list in the backend.

**Q: Why do live-captured images sometimes not appear in history?**
A: This may be due to backend errors during the /inspections/capture endpoint. Check backend logs for details. If the backend is restarted or unavailable, the capture may fail silently on the frontend.

**Q: Why is there no sound after inspection?**
A: Voice feedback is played in the browser. Make sure your browser tab is not muted and supports audio playback. Some browsers block autoplay until user interaction.

**Q: How does QR-based part validation work?**
A: The backend extracts the part ID from the QR code in the image, looks up the part spec in the database, measures the part using OpenCV, and validates dimensions against the spec. The result is included in the inspection response as `part_validation`.

**Q: How do I troubleshoot QR/part validation?**
A: Ensure the QR code is clear and the part exists in the database with correct specs. See logs for errors if validation fails.

# Developer Quick Reference

## Common Commands

### Backend
- Install dependencies:
	```bash
	cd backend
	pip install -r requirements.txt
	```
- Run migrations:
	```bash
	python scripts/migrate_db.py
	```
- Start backend server:
	```bash
	uvicorn main:app --reload
	```
- Run device simulation:
	```bash
	python scripts/simulate_device_send.py
	```

### Frontend
- Install dependencies:
	```bash
	cd frontend
	npm install
	```
- Start frontend dev server:
	```bash
	npm run dev
	```

### Model
- Train model:
	```bash
	cd model
	python src/train.py --data_dir ../dataset/splits
	```
- Export ONNX model:
	```bash
	python src/export_onnx.py
	```

## File Structure Overview
- `backend/app/` — FastAPI app (API, models, services)
- `frontend/src/` — React app (pages, components, services)
- `model/` — Training, evaluation, ONNX export
- `dataset/` — Images, annotations, splits
- `docs/` — Architecture, deployment, API, troubleshooting

## Environment Variables
- Backend: see `backend/.env` (sample in README)
- Frontend: see `frontend/.env` (if needed for API URL)

## Useful URLs
- API docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Tips
- Use `python scripts/simulate_device_send.py` to test device ingestion without hardware.
- For S3 storage, set `STORAGE_BACKEND=s3` and fill AWS keys in `backend/.env`.
- For troubleshooting, see `docs/TROUBLESHOOTING.md`.

---

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
| `POST` | `/api/v1/device/ingest` | Ingest frame from ESP32/RPi device |
| `GET` | `/api/v1/inspections` | List all inspections |
| `GET` | `/api/v1/inspections/by-part/{part_id}` | Inspection history for one part |
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
1: porosity
2: crack
3: surface_void
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
