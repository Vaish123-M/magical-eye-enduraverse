# Deployment Guide

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Step 1: Backend

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env
# Edit .env as needed
python -m scripts.migrate_db
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Step 2: Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### Step 3: Test
1. Open `http://localhost:5173`
2. Upload an image → should see mock inference result
3. Check API docs at `http://localhost:8000/docs`

### Step 4: Hardware Demo Runbook (ESP32 / Raspberry Pi)

1. Configure backend device key in `.env`:

```env
DEVICE_API_KEY=demo-device-key
```

2. Restart backend so the new key is loaded:

```bash
cd backend
uvicorn main:app --reload
```

3. Send a test frame using the included simulator:

```bash
python scripts/simulate_device_send.py
```

4. Send a real frame from a device (same API for ESP32-CAM and Raspberry Pi):

```bash
curl -X POST http://localhost:8000/api/v1/device/ingest \
  -H "Content-Type: application/json" \
  -H "x-device-key: demo-device-key" \
  -d '{
    "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
    "part_id": "AL-CAST-00042",
    "device_id": "esp32-cam-laser"
  }'
```

5. Validate end-to-end in UI:
1. Open dashboard section and click `Simulate ESP32/RPi Scan`
2. Check `Device Health` for latency/FPS/last scan updates
3. Go to History and filter by `AL-CAST-00042` to confirm traceability

---

## Docker Deployment

### Single Command (dev stack)

```bash
docker-compose up -d
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- SQLite: `./magical_eye.db`

### Custom Build

```bash
# Production-optimized frontend build
cd frontend
npm run build

# Copy dist to backend static folder
cp -r dist ../backend/static/

# Build backend
docker build -t magical-eye:0.1.0 ./backend

# Run
docker run -p 8000:8000 \
  -e DATABASE_URL=sqlite:///./magical_eye.db \
  -e SECRET_KEY=$(python -c 'import secrets; print(secrets.token_urlsafe(32))') \
  magical-eye:0.1.0
```

---

## Cloud Deployment

### AWS EC2 (Ubuntu 22.04)

**1. Launch instance & SSH**
```bash
ssh -i key.pem ubuntu@your-instance-ip
```

**2. Install dependencies**
```bash
sudo apt update && sudo apt install -y python3.11 python3-pip nodejs npm git
```

**3. Clone & setup**
```bash
git clone https://github.com/your-org/magical-eye-enduraverse.git
cd magical-eye-enduraverse

# Backend
cd backend
pip install -r requirements.txt
python -m scripts.migrate_db

# Frontend
cd ../frontend
npm install
npm run build
```

**4. Run with Gunicorn + Nginx**
```bash
# Backend (systemd service)
sudo tee /etc/systemd/system/magical-eye.service > /dev/null <<EOF
[Unit]
Description=MagicalEye API
After=network.target

[Service]
Type=notify
User=ubuntu
WorkingDirectory=/home/ubuntu/magical-eye-enduraverse/backend
ExecStart=/usr/local/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable magical-eye
sudo systemctl start magical-eye
```

**5. Reverse proxy (Nginx)**
```bash
sudo tee /etc/nginx/sites-enabled/magical-eye > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 100M;

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        root /home/ubuntu/magical-eye-enduraverse/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo systemctl reload nginx
```

**6. SSL/HTTPS (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Kubernetes (GKE / EKS / AKS)

**3-Tier Deployment: Backend + Frontend + Database**

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: magical-eye-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: magical-eye-backend
  template:
    metadata:
      labels:
        app: magical-eye-backend
    spec:
      containers:
      - name: backend
        image: your-registry/magical-eye:0.1.0
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: magical-eye-secrets
              key: db-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: magical-eye-secrets
              key: secret-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: magical-eye-backend
spec:
  selector:
    app: magical-eye-backend
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
---
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: magical-eye-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: magical-eye-frontend
  template:
    metadata:
      labels:
        app: magical-eye-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/magical-eye-frontend:0.1.0
        ports:
        - containerPort: 3000
```

**Deploy:**
```bash
kubectl create secret generic magical-eye-secrets \
  --from-literal=db-url="postgresql://..." \
  --from-literal=secret-key="..."

kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Check status
kubectl get pods
kubectl get svc
```

---

## Production Checklist

- [ ] Change `SECRET_KEY` (generate with `secrets.token_urlsafe(32)`)
- [ ] Switch `DATABASE_URL` to PostgreSQL
- [ ] Enable **HTTPS** (Let's Encrypt or corporate CA)
- [ ] Configure **AWS S3** for image storage
- [ ] Set up **email alerts** (SMTP config)
- [ ] Use **Alembic** for DB migrations (not `init_db()`)
- [ ] Deploy model to **GPU instance** (if using CUDA)
- [ ] Set up **monitoring** (Prometheus, DataDog, New Relic)
- [ ] Configure **auto-scaling** (based on inference queue depth)
- [ ] Test **disaster recovery** (DB backups, image recovery)
- [ ] Set up **logging** (ELK, CloudWatch, Datadog)
- [ ] Run **security audit** (OWASP, penetration testing)
- [ ] Load test with `locust` or Apache Bench
- [ ] Configure **rate limiting** (via reverse proxy or `slowapi`)

---

## Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `DEBUG` | False | Enable debug mode (only in dev!) |
| `DATABASE_URL` | sqlite:///./magical_eye.db | DB connection string |
| `SECRET_KEY` | change-me | JWT signing key |
| `MODEL_PATH` | model/exports/defect_model.onnx | ONNX model file path |
| `STORAGE_BACKEND` | local | Image storage: local or s3 |
| `LOCAL_STORAGE_PATH` | storage/images | Local image directory |
| `AWS_BUCKET` | "" | S3 bucket name |
| `CLOUD_SYNC_ENABLED` | False | Enable cloud sync |
| `ALERT_EMAIL_ENABLED` | False | Send email alerts |
| `SMTP_HOST` | "" | SMTP server |
| `SMTP_USER` | "" | SMTP username |
| `SMTP_PASSWORD` | "" | SMTP password |

---

## Rollback & Hotfix

### Via Docker
```bash
# Tag previous image
docker tag magical-eye:0.1.0 magical-eye:0.1.0-backup
docker tag your-registry/magical-eye:0.0.9 magical-eye:0.1.0

# Restart
docker-compose down
docker-compose up -d
```

### Via Kubernetes
```bash
kubectl rollout history deployment/magical-eye-backend
kubectl rollout undo deployment/magical-eye-backend --to-revision=1
```

---

## Monitoring & Alerting

Add to `backend/main.py`:
```python
from prometheus_client import Counter, Histogram, generate_latest
import time

# Metrics
request_count = Counter('magical_eye_requests_total', 'Total requests')
inference_time = Histogram('magical_eye_inference_seconds', 'Inference time')

@app.middleware("http")
async def log_metrics(request, call_next):
    request_count.inc()
    start = time.time()
    response = await call_next(request)
    inference_time.observe(time.time() - start)
    return response

@app.get("/metrics")
def metrics():
    return generate_latest()
```

Scrape with Prometheus:
```yaml
scrape_configs:
  - job_name: 'magical-eye'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```
