# MagicalEye: portfolio and interview guide

## One-line pitch

MagicalEye is an offline-tolerant, human-in-the-loop visual quality platform that turns a computer-vision model into an observable production service for smart factories.

## What makes it distinctive

### 1. Model-to-product ownership

The repository covers the complete path from dataset preparation and training to ONNX export, API inference, browser capture, persistence, alerting, and operations. This is stronger than presenting a notebook or an isolated model checkpoint.

### 2. Trustworthy AI workflow

The system stores the model verdict and supports an explicit human override. Grad-CAM visualizations, confidence thresholds, model metadata, and review history make the prediction inspectable rather than a black box.

### 3. Edge and cloud thinking

Images can originate from a browser, ESP32-CAM, or Raspberry Pi. Local storage and deferred cloud synchronization support intermittent connectivity, while Docker, Redis, Celery, PostgreSQL, Prometheus, and OpenTelemetry provide a path to production deployment.

### 4. Engineering discipline

The backend includes typed request/response schemas, JWT refresh-token rotation, RBAC, upload validation, rate limiting, Alembic migrations, structured JSON logging, health probes, and automated tests. CI validates the backend, frontend, ML imports, and build artifacts.

## Five-minute demo path

1. Open `/docs` and show the versioned API contract.
2. Call `/health/live`, `/health/ready`, and `/api/v1/ai/model-info` to explain operational readiness and model provenance.
3. Log in through the frontend and upload one OK and one defective image.
4. Show the inspection history, confidence, alert, and human override flow.
5. Open Prometheus metrics and explain what would be alerted on in production.
6. Show the MLflow run and Grad-CAM output to connect model quality to user trust.

## Resume-ready bullets

- Built an end-to-end computer-vision quality platform with FastAPI, React, SQLAlchemy, ONNX Runtime, Docker Compose, and CI, supporting browser and edge-camera inspection workflows.
- Productionized image classification with ONNX export, CPU/GPU provider selection, model fingerprinting, confidence-aware results, Grad-CAM explainability, and MLflow experiment tracking.
- Designed an auditable human-in-the-loop workflow that persists AI verdicts, review overrides, alerts, and inspection history for operational traceability.
- Implemented backend reliability and security capabilities including JWT refresh-token rotation, RBAC, upload content validation, rate limiting, Alembic migrations, structured logs, Prometheus metrics, and liveness/readiness probes.
- Built an offline-first synchronization path with local persistence and deferred cloud delivery, demonstrating resilience to unreliable factory connectivity.

## Honest limitations and next steps

The current model is a binary OK/defective classifier; it does not claim to localize every defect type. The next high-value improvements would be calibrated confidence thresholds, a true holdout test set from a different production line, batch inference benchmarking, and a model registry with signed artifacts. Calling these out in an interview demonstrates scientific honesty and systems thinking.
