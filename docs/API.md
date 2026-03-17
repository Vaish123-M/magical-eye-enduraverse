# API Reference

Base URL: `http://localhost:8000/api/v1`

## Authentication

Currently uses **JWT Bearer tokens** (mock auth for hackathon).

```bash
# Get token (username: admin, password: changeme)
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=changeme"

# Response
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}

# Use in subsequent requests
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/inspections
```

---

## Endpoints

### **Inspections**

#### `POST /inspections/upload`
Upload an image and run defect detection inference.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/inspections/upload \
  -F "file=@image.jpg" \
  -F "product_id=PROD-001" \
  -H "Authorization: Bearer <token>"
```

**Parameters:**
- `file` (form-data, required): Image file (JPG, PNG)
- `product_id` (form-data, optional): Product identifier

**Response:** `201 Created`
```json
{
  "id":              "550e8400-e29b-41d4-a716-446655440000",
  "product_id":      "PROD-001",
  "image_path":      "/storage/550e8400-e29b-41d4-a716-446655440000.jpg",
  "status":          "NOT_OK",
  "defect_type":     "crack",
  "confidence":      0.92,
  "override_status": null,
  "reviewed_by":     null,
  "override_note":   null,
  "synced":          false,
  "created_at":      "2025-03-16T10:30:00Z"
}
```

**Status Codes:**
- `201` — Inspection created and inference successful
- `400` — Invalid image file
- `500` — Model inference error

---

#### `GET /inspections`
List all inspections (paginated).

**Query Parameters:**
- `skip` (optional, default: 0): Offset
- `limit` (optional, default: 50): Limit

**Request:**
```bash
curl http://localhost:8000/api/v1/inspections?skip=0&limit=10 \
  -H "Authorization: Bearer <token>"
```

**Response:** `200 OK`
```json
[
  {
    "id": "...",
    "product_id": "PROD-001",
    "status": "NOT_OK",
    "defect_type": "crack",
    "confidence": 0.92,
    "created_at": "2025-03-16T10:30:00Z"
    // ... full InspectionOut schema
  }
]
```

---

#### `GET /inspections/{id}`
Fetch a single inspection by ID.

**Request:**
```bash
curl http://localhost:8000/api/v1/inspections/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <token>"
```

**Response:** `200 OK` or `404 Not Found`

---

#### `PATCH /inspections/{id}/override`
Apply human review/override to an inspection.

**Request:**
```bash
curl -X PATCH http://localhost:8000/api/v1/inspections/550e8400-e29b-41d4-a716-446655440000/override \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "override_status": "OK",
    "reviewed_by": "john.doe",
    "note": "AI flagged as defect but no visible crack in actual image"
  }'
```

**Request Body:**
- `override_status` (required): "OK" | "NOT_OK"
- `reviewed_by` (required): Human reviewer name/ID
- `note` (optional): Explanation of override

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "NOT_OK",
  "override_status": "OK",
  "reviewed_by": "john.doe",
  "override_note": "AI flagged as defect...",
  "created_at": "2025-03-16T10:30:00Z"
  // ... full InspectionOut
}
```

---

### **Dashboard**

#### `GET /dashboard/stats`
Get aggregated inspection statistics.

**Request:**
```bash
curl http://localhost:8000/api/v1/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

**Response:** `200 OK`
```json
{
  "total": 150,
  "ok": 140,
  "not_ok": 10,
  "pass_rate": 93.33,
  "defect_breakdown": {
    "crack": 5,
    "scratch": 3,
    "missing_component": 2
  }
}
```

---

#### `GET /dashboard/recent`
Get most recent inspections (for dashboard quick view).

**Query Parameters:**
- `limit` (optional, default: 10): Number of results

**Request:**
```bash
curl 'http://localhost:8000/api/v1/dashboard/recent?limit=5' \
  -H "Authorization: Bearer <token>"
```

**Response:** `200 OK` — Array of InspectionOut (limited to `limit` rows)

---

### **Alerts**

#### `GET /alerts`
List alerts.

**Query Parameters:**
- `unread_only` (optional, default: false): Filter by unacknowledged

**Request:**
```bash
curl 'http://localhost:8000/api/v1/alerts?unread_only=true' \
  -H "Authorization: Bearer <token>"
```

**Response:** `200 OK`
```json
[
  {
    "id": "alert-001",
    "inspection_id": "550e8400-e29b-41d4-a716-446655440000",
    "severity": "HIGH",
    "message": "Defect detected on product PROD-001. Type: crack. Confidence: 0.92.",
    "acknowledged": false,
    "acknowledged_by": null,
    "note": null,
    "created_at": "2025-03-16T10:30:01Z"
  }
]
```

---

#### `PATCH /alerts/{id}/acknowledge`
Mark an alert as reviewed.

**Request:**
```bash
curl -X PATCH http://localhost:8000/api/v1/alerts/alert-001/acknowledge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "acknowledged_by": "john.doe",
    "note": "Defect confirmed; scrap component"
  }'
```

**Request Body:**
- `acknowledged_by` (required): Who reviewed
- `note` (optional): Action taken

**Response:** `200 OK` (returns updated AlertOut)

---

## Error Responses

All errors return a JSON object with `detail` explaining the issue:

```json
{
  "detail": "Inspection not found."
}
```

### Common Status Codes
| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request (invalid input) |
| `401` | Unauthorized (missing/invalid token) |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## Rate Limiting

Currently **no rate limiting** (add via `slowapi` middleware in production).

---

## OpenAPI / Swagger UI

Interactive API docs available at:
- `http://localhost:8000/docs` (Swagger UI)
- `http://localhost:8000/redoc` (ReDoc)
