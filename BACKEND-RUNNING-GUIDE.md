# Soroco House — Backend Running Guide

> **Backend build** · FastAPI · SQLAlchemy · SQLite (dev) / AWS RDS PostgreSQL · JWT · WebSocket · S3-ready image uploads

---

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Python | 3.11 or higher | `python --version` |
| pip | bundled with Python | `python -m pip --version` |

> Optional: an **AWS account** only if you want to run `DEV_STORAGE_DRIVER=s3` for image
> storage. Without it, set `DEV_STORAGE_DRIVER=local` — everything works offline.
> See `S3-SETUP-GUIDE.md` (repo root) for creating the bucket, IAM user and CloudFront.

---

## Quick Start

Open a terminal and run these commands:

```bash
# 1. Navigate to the backend folder
cd "C:\Users\Syed Thameemuddin\Desktop\project-soroco\restaurant-order-management\backend"

# 2. Create + activate a virtual environment (first time only)
python -m venv .venv
.venv\Scripts\activate            # Windows
# source .venv/bin/activate       # Linux / macOS

# 3. Install dependencies (first time only)
pip install -r requirements.txt

# 4. Create the env file, then EDIT the values (secrets, SMTP, S3)
copy .env.example .env            # Windows
# cp .env.example .env            # Linux / macOS

# 5. Start the development server (auto-reload)
uvicorn main:app --reload --port 8000
```

Then open:

```
API docs (Swagger):  http://localhost:8000/docs
Health check:        http://localhost:8000/health
```

Together with the frontend (see `FRONTEND-RUNNING-GUIDE.md`), the full app runs on:

```
Frontend:  http://localhost:5173
Backend:   http://localhost:8000   (+ /api/v1 prefix)
```

> Tables auto-create on boot (`create_all` — creates missing tables, leaves existing ones
> untouched). There is **no auto-seed**; seed the DB explicitly with `python -m src.seed`
> (idempotent — safe to re-run). Uploaded food images are stored per `DEV_STORAGE_DRIVER`
> (`local` → `backend/uploads/` served at `/images/<file>`; `s3` → the S3 bucket object URL).

---

## All Available Commands

```bash
# Start dev server (auto-reload)
uvicorn main:app --reload --port 8000

# Seed the DB (idempotent — menu, staff accounts, demo orders)
python -m src.seed

# Run the test suite
pytest

# Lint
ruff check .

# Lint + autofix
ruff check . --fix
```

---

## API Reference (quick map)

All business routes live under `/api/v1`. Swagger at `/docs` is the full reference.

### Public
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness + DB check (no `/api/v1` prefix) |
| `GET` | `/api/v1/menu` | Grouped menu (incl. unavailable + `image_url`) |
| `POST` | `/api/v1/auth/login` | Staff login → JWT |
| `GET` | `/api/v1/auth/check?email=` | Signup step 1 — `{exists, has_password}` for an email |
| `POST` | `/api/v1/auth/signup` | Set password for a pre-created account → returns JWT (auto login) |
| `POST` | `/api/v1/payments` | Sandbox payment result → order (success) / no-op (fail/cancel); bill email to `customer_email` on success |
| `WS` | `/api/v1/ws/menu` | Live menu updates (public) |

### Protected (Authorization: Bearer `<JWT>`)
| Method | Path | Role | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/auth/me` | employee/admin | Current user |
| `POST` | `/api/v1/menu` | employee/admin | Add menu item |
| `PATCH` | `/api/v1/menu/{menu_uuid}` | employee/admin | Update item / availability |
| `DELETE` | `/api/v1/menu/{menu_uuid}` | employee/admin | Remove item |
| `POST` | `/api/v1/upload/image` | employee/admin | Upload food photo → returns `image_url` |
| `GET` | `/api/v1/orders/kitchen` | employee/admin | Kitchen orders |
| `PATCH` | `/api/v1/orders/{order_uuid}` | employee/admin | Update `kitchen_status` / `order_status` |
| `GET` | `/api/v1/admin/employees` | admin | List / create (`POST`) / update (`PATCH {uuid}`) / delete (`DELETE {uuid}`) staff |
| `GET` | `/api/v1/admin/orders` | admin | Order history (by date range + status) |
| `GET` | `/api/v1/admin/orders/export` | admin | CSV of the same filtered set |
| `WS` | `/api/v1/ws/orders` | employee/admin | Live kitchen stream |

---

## Seed Credentials

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `thameem@test.com` | `admin123` | Full access (dashboard, employees, history, menu) |
| Employee | `employee@test.com` | none yet | Has no password until activated — log in via `/signup` first to set one |

> Accounts are created with **no password**. The staff member activates their own account via
> `POST /api/v1/auth/signup` (sets the password). Seeding is via `python -m src.seed`
> (idempotent — re-run any time; it will never duplicate rows).

---

## End-to-End Smoke Test

### Image upload (the feature)

```
1. Start backend (steps above). Start frontend (FRONTEND-RUNNING-GUIDE.md).
2. Login as staff:  POST /api/v1/auth/login  {email, password}  → JWT
   (seed admin: thameem@test.com / admin123)
3. Open the Menu page staff toolbar → "Add New Item" → pick a photo
4. Frontend uploads to POST /api/v1/upload/image (multipart: file + item_name)
   → returns { "image_url": "..." }   (local driver: /images/<slug>-<hex>.webp; s3: bucket URL)
5. Frontend POSTs /api/v1/menu with that image_url
6. Card shows the uploaded photo via getImageUrl(item.image)
7. Refresh the page → item + image reload from the DB (image persists on disk / S3)
```

Verify the stored file directly:

```bash
# local driver
dir backend\uploads            # look for <slug>-<8hex>.webp
# open in browser
http://localhost:8000/images/<file>
```

### Kitchen order flow

```
1. Customer (browser) adds items → pays (mock gateway) → POST /api/v1/payments success
2. Order inserted (orders + order_items); bill email is sent to customer_email (real Gmail SMTP
   when DEV_EMAIL_MOCK=false, console-only when true)
3. Kitchen board (ws://localhost:8000/api/v1/ws/orders) receives it live
4. Staff PATCH /api/v1/orders/{uuid}  { "kitchen_status": "preparing" }
5. Status broadcasts to all open boards; persists across refresh / restart
```

### Order history + CSV

```
GET  /api/v1/admin/orders?from=2026-09-01&to=2026-09-20&order_status=delivered
GET  /api/v1/admin/orders/export?...same filters...   (downloads CSV)
```

---

## Image Storage — local vs S3

Two drivers, one switch in `.env` (`DEV_STORAGE_DRIVER`):

| Driver | Where files live | Returned `image_url` | When to use |
|---|---|---|---|
| `local` | `backend/uploads/` (gitignored), mounted at `/images` | `/images/<slug>-<hex>.webp` | Offline dev — no AWS account needed |
| `s3` | `DEV_S3_BUCKET` via `boto3` | `<DEV_S3_CDN_URL>` URL, else bucket object URL | When S3 is set up (see `S3-SETUP-GUIDE.md`) |

Frontend rule: `VITE_IMAGE_BASE_URL + image_url` for relative paths, absolute URLs as-is.
Dev base: `http://localhost:8000` (backend origin serving `/images/...`).

Switching local → s3 is only a `.env` change; no code or schema change anywhere.

---

## Env Reference

All backend keys live in `backend/.env` (copy from `backend/.env.example`). Highlights:

| Variable | Meaning |
|---|---|
| `DEV_PORT` | Uvicorn port (default 8000) |
| `DEV_DATABASE_URL` | `sqlite:///./data/restaurant.db` — or the `postgresql+psycopg2://…` URL from `RDS-SETUP-GUIDE.md` to run on AWS RDS PostgreSQL (need `psycopg2-binary` in requirements) |
| `DEV_CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `DEV_STORAGE_DRIVER` | `local` or `s3` |
| `DEV_UPLOAD_DIR` / `DEV_UPLOAD_MAX_SIZE_MB` | Local storage dir / size cap |
| `DEV_S3_*` | Bucket, region, credentials, CDN URL |
| `DEV_EMAIL_MOCK` | `false` (current) = real Gmail SMTP bill emails via App Password; `true` = print bill to console instead |

Full table: see `define/development-prompt.md` §10.2 and `backend/.env.example`.

---

## Project Structure

```
backend/
├── main.py                    # create_app, CORS, /images mount, routers, seed hook
├── requirements.txt
├── .env.example               # full DEV_* reference
├── uploads/                   # local image storage (gitignored)
├── data/                      # SQLite dev DB (gitignored)
├── tests/                     # pytest suite
└── src/
    ├── settings.py            # pydantic-settings (DEV_*)
    ├── database.py            # engine, session, Base
    ├── models/                # account, menu_item, order, order_item
    ├── schemas/               # pydantic DTOs (API contract)
    ├── repositories/          # data access
    ├── routes/                # auth, menu, upload, order, payment, history, admin
    ├── services/              # auth, menu, order, payment/, email, storage/, websocket
    ├── middleware/            # auth deps (get_current_user / require_roles)
    └── utils/                 # slug, exception handlers
```

---

## Troubleshooting

### Port 8000 already in use
```bash
uvicorn main:app --reload --port 8001     # then update VITE_API_BASE_URL* / VITE_IMAGE_BASE_URL in frontend .env
```

### `ModuleNotFoundError: ...` on startup
Activate the venv and reinstall:
```bash
.venv\Scripts\activate && pip install -r requirements.txt
```

### "database is locked"
SQLite + concurrent dev writes. Enable WAL (see spec §11 rule 9) or restart the server once.

### CORS errors in the browser console
Make sure `DEV_CORS_ORIGINS` includes your exact frontend origin, e.g. `http://localhost:5173`.

### Upload returns 422
Missing `python-multipart` dependency — reinstall requirements. Or the file isn't `jpeg/png/webp` or exceeds `DEV_UPLOAD_MAX_SIZE_MB`.

### Uploaded image 404s in the browser
Check the mount + base agree: backend serves `/images/<file>`, frontend `VITE_IMAGE_BASE_URL` must be the origin only (`http://localhost:8000`), never `.../images`.

### Health returns OK but `/api/v1/...` 404s
Wrong path. All business routes carry the `/api/v1` prefix; only `/docs`, `/images/...` and `/health` are outside it.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.111 |
| Server | Uvicorn 0.30 |
| ORM | SQLAlchemy 2.x |
| DB | SQLite (dev) or AWS RDS PostgreSQL (see `RDS-SETUP-GUIDE.md`) |
| Auth | JWT (HS256) + bcrypt |
| Uploads | python-multipart + Pillow (WebP resize) |
| Storage | Local driver + boto3 S3 driver |
| Real-time | WebSocket |
| Rate limiting | slowapi |
| Tests / Lint | pytest / ruff |

---

*Soroco House · Backend Phase · FastAPI + AWS RDS PostgreSQL · real SMTP bill emails · mock payment gateway*