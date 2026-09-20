# Soroco House — Restaurant Order Management

QR-code table ordering for the Soroco office café. Customers scan, browse a
live menu, order and pay (sandbox gateways); the kitchen updates orders on a
live board; admins manage the menu, staff and order history.

- **Frontend:** React 18 + Vite 5 + TypeScript + Tailwind CSS (MVVM-style screens)
- **Backend:** FastAPI + SQLAlchemy 2 + JWT auth + WebSockets (layered architecture)
- **Database:** SQLite by default (`sqlite:///./data/restaurant.db`), Postgres via `DEV_DATABASE_URL`
- **Real-time:** WebSocket feeds for the menu and the kitchen board

---

## Quick start

Independent run guides live in the repo:

- [`BACKEND-RUNNING-GUIDE.md`](BACKEND-RUNNING-GUIDE.md) — virtualenv, `pip install`, `.env`, `uvicorn`
- [`FRONTEND-RUNNING-GUIDE.md`](FRONTEND-RUNNING-GUIDE.md) — `npm install`, `npm run dev`

Two terminals:

```bash
# Terminal 1 — API on http://localhost:8000/docs
cd backend
python -m venv .venv && .venv\Scripts\activate    # Windows (Linux/macOS: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env                            # then fill in real values (never commit .env)
uvicorn main:app --reload --port 8000

# Terminal 2 — web app on http://localhost:5173
cd frontend
npm install
npm run dev
```

### Seed data

Tables auto-create on startup. Load demo menu, staff accounts and orders:

```bash
cd backend
python -m src.seed
```

Seed accounts (`backend/seed_data/accounts.json`):

| Role | Email | Password |
|---|---|---|
| admin | `thameem@test.com` | `admin123` |
| employee | `employee@test.com` | set via the `/signup` flow (pre-created, password `null`) |

---

## Monorepo layout

```
restaurant-order-management/
├── backend/                  # FastAPI service
│   ├── main.py               # app entrypoint (mounts /images, exception handlers, CORS)
│   ├── requirements.txt
│   ├── .env.example          # DEV_-prefixed env vars template
│   ├── seed_data/            # JSON seed files (menu / accounts / orders)
│   ├── src/
│   │   ├── settings.py       # pydantic-settings (env_prefix DEV_)
│   │   ├── database.py       # SQLAlchemy engine/session/Base
│   │   ├── routes/           # FastAPI routers (auth, menu, orders, payments, admin, upload, image, ws, health)
│   │   ├── models/           # Pydantic DTOs (request/response schemas, envelope helpers)
│   │   ├── services/         # business logic (auth, menu, order, payment, admin, upload, email, ws manager, seed)
│   │   ├── repositories/     # data access layer
│   │   │   └── schema/       # SQLAlchemy ORM models (accounts, menu, orders, order_items, enums)
│   │   ├── middleware/       # JWT auth (get_current_user / require_roles / authenticate_token)
│   │   ├── client/           # external clients (e.g. S3)
│   │   └── utils/            # exceptions, error codes, handlers, rate limiting, logger
│   └── tests/
├── frontend/                 # React web app
│   ├── src/
│   │   ├── ui/navigations/   # Router + protected routes
│   │   ├── ui/screens/       # screens (Home, Menu, Cart, Checkout, Payment*, Login, Signup, Orders, Admin, Employee, OrderHistory)
│   │   ├── ui/reusables/     # shared components (modals, loaders, cart bar, …)
│   │   ├── store/            # Redux Toolkit slices (auth, cart) with session persistence
│   │   ├── services/         # api client, screen services, WebSocket client, config, logger
│   │   ├── types/            # TS domain types + enums (menu, order, payment, user, cart)
│   │   └── constants/        # café constants (incl. TAX_RATE)
│   └── .env.development      # VITE_* env vars
├── define/                   # design decisions & docs
│   ├── er-diagram.mmd        # Mermaid ER diagram (actual ORM)
│   ├── er-diagram.md         # human-readable ER + sample data
│   └── PAYMENT-INTEGRATION-NEXT.md
├── design/
│   ├── api-docs.md           # API + WebSocket reference (live contract)
│   └── openapi.yaml          # machine-readable OpenAPI spec
└── .github/workflows/        # CI/CD (lint, coverage, security scans, Docker, EC2 deploy)
```

---

## Tech stack

**Backend** (`backend/requirements.txt`)

| Purpose | Library |
|---|---|
| Web framework | fastapi / uvicorn |
| ORM | sqlalchemy 2.0 |
| Config | pydantic-settings |
| Auth | python-jose (JWT HS256) + bcrypt |
| Rate limiting | slowapi |
| Image processing | Pillow (+ python-multipart) |
| Object storage | boto3 (S3) |
| Postgres driver | psycopg2-binary |

**Frontend** (`frontend/package.json`)

React 18 · Vite 5 · TypeScript 5.6 · Redux Toolkit · react-redux · react-router-dom 6 ·
Tailwind CSS 3.4 · framer-motion · lucide-react.

---

## Architecture

### Backend (layered)

```
routes (HTTP) → services (business logic) → repositories (data access) → ORM schema (models)
       └── models/ (Pydantic DTOs)          └── utils/exceptions (AppError → JSON envelope)
```

- Every router is mounted under `/api/v1` (see `backend/src/routes/__init__.py`),
  except `/health` and the static `/images` mount.
- Tables are created on startup (`Base.metadata.create_all` in `main.py`);
  there is **no Alembic migration tool** — `src.seed` performs a tiny column
  backfill (`orders.tax`) for pre-existing databases.
- Enums are stored as portable VARCHARs (`native_enum=False`) so the same schema
  works on SQLite and Postgres.
- All failures map to one JSON envelope via `utils/exceptions/handlers.py`
  (`AppError`, pydantic `422`, SlowAPI `429`, and catch-all `500`).

### Frontend (MVVM-ish)

```
ui/screens  (components + view-models)
services/   (screen services → apiClient; websocket/liveClient; uploadImageService)
store/      (redux slices: auth, cart)
types/      (BOs + enums mirroring the backend)
```

- `services/apiClient.ts` wraps `fetch`, attaches the JWT, unwraps
  `{ success, data }` and clears the session on `401`.
- Session is persisted in Redux preloadedState + localStorage
  (`soroco_access_token` / `soroco_user`).
- Lazy-loaded routes guard staff screens by role via `ProtectedRoute`
  (`/orders` = employee+admin, `/admin*` + `/order-history` = admin).

---

## Data model

Four tables — see [`define/er-diagram.mmd`](define/er-diagram.mmd) and
[`define/er-diagram.md`](define/er-diagram.md) for full column details.

```
accounts  (staff users; role: employee | admin)
menu      (items grouped by category string; nullable standard/small/large prices; is_available)
orders    (order header: order_ref idempotency key, total_price, tax, payment + kitchen statuses)
order_items (line items with price snapshot; FK orders.order_uuid CASCADE, FK menu.menu_uuid)
```

---

## API overview

Full contract: [`design/api-docs.md`](design/api-docs.md) and
[`design/openapi.yaml`](design/openapi.yaml). Interactive docs:
`http://localhost:8000/docs`.

Base URL: `http://localhost:8000/api/v1`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/health` | — | Liveness + DB check (raw response, no envelope) |
| `POST` | `/auth/login` | — | Login → JWT (5/min) |
| `POST` | `/auth/signup` | — | Set password for pre-created staff (5/min) |
| `GET` | `/auth/check?email=` | — | Is this a staff account? has password? (5/min) |
| `GET` | `/auth/me` | bearer | Current user + role |
| `GET` | `/menu` | — | Menu grouped by category |
| `POST` | `/menu` | admin | Add menu item (broadcast to WS) |
| `PATCH` | `/menu/{menu_uuid}` | employee/admin | Update item / availability (broadcast) |
| `DELETE` | `/menu/{menu_uuid}` | admin | Delete item (broadcast) |
| `POST` | `/upload/image` | admin | Upload food photo (multipart, 5/min) |
| `GET` | `/images/{filename}` | — | Streams S3 object (local driver → 404, static mount instead) |
| `POST` | `/payments` | — | Place order from gateway result (20/min, idempotent on `order_ref`) |
| `GET` | `/orders/kitchen` | employee/admin | Kitchen board (FIFO) |
| `PATCH` | `/orders/{order_uuid}` | employee/admin | Update kitchen / order status (broadcast) |
| `GET` | `/admin/employees` | admin | List staff |
| `POST` | `/admin/employees` | admin | Create staff account |
| `PATCH` | `/admin/employees/{account_uuid}` | admin | Rename / re-email staff |
| `DELETE` | `/admin/employees/{account_uuid}` | admin | Delete staff (never an admin) |
| `GET` | `/admin/orders?from_date=&to_date=&order_status=` | admin | Order history (`YYYY-MM-DD`) |
| `GET` | `/admin/orders/export` | admin | CSV export of the same filters |

Response envelope (except `/health`):

```json
{ "success": true, "data": { } }            // success
{ "success": false, "message": "…", "code": "NOT_FOUND", "detail": null }  // error
```

### WebSockets

Base: `ws://localhost:8000/api/v1`

| Socket | Auth | Server → client frames |
|---|---|---|
| `/ws/menu` | public | `{"type":"menu_updated"}` — client re-fetches `GET /menu` |
| `/ws/orders?token=<JWT>` | employee/admin | `{"type":"orders_updated","data":[…kitchen list…]}` |

`/ws/orders` validates the token on handshake and closes with code `4401` on
failure. Customers never write to the sockets; they only apply events.

---

## Configuration

All backend settings are `DEV_`-prefixed (`.env` in `backend/`, template in
`backend/.env.example`). Key variables:

| Variable | Default | Meaning |
|---|---|---|
| `DEV_DATABASE_URL` | `sqlite:///./data/restaurant.db` | Postgres: `postgresql+psycopg2://…` |
| `DEV_JWT_SECRET_KEY` | `change-me-strong-secret` | HS256 signing secret (override in prod) |
| `DEV_JWT_EXPIRE_MINUTES` | `480` | Token lifetime |
| `DEV_AUTH_RATE_LIMIT` | `5/minute` | Login/signup/check rate |
| `DEV_CORS_ORIGINS` | `http://localhost:5173,…` | Comma-separated allow list |
| `DEV_PAYMENT_PROVIDER` | `mock` | `mock` \| `phonepay` \| `razorpay` |
| `DEV_EMAIL_MOCK` | `false` | Print bill email to console instead of SMTP |
| `DEV_STORAGE_DRIVER` | `local` | `local` \| `s3` |
| `DEV_UPLOAD_MAX_SIZE_MB` | `5` | Upload cap |
| `DEV_S3_BUCKET` | `soroco-food-images` | Only used with `storage_driver=s3` |

Frontend (`frontend/.env.development`): `VITE_API_BASE_URL`,
`VITE_WS_BASE_URL`, `VITE_IMAGE_BASE_URL`.

---

## Payments (mock)

`POST /payments` trusts the provided `gateway_status` while integration is mocked
(see `define/PAYMENT-INTEGRATION-NEXT.md` for the real-gateway plan). On
`success` the backend:

1. recomputes prices server-side from the menu (5% tax, `TAX_RATE = 0.05`),
2. inserts `orders` + `order_items` idempotently on `order_ref`,
3. emails the bill (mock SMTP or console),
4. broadcasts `orders_updated` to `/ws/orders`.

`failed` / `cancelled` create no rows and return `{payment_status, message}`.

---

## CI/CD

GitHub Actions (`.github/workflows/`):

- `ci-cd.yml` (dev): PR description check → directory compliance → ESLint +
  Ruff → pytest with a **75% coverage floor** → gitleaks + hadolint → Bandit
  SAST + Trivy SCA (gated on the `dev` environment) → Docker build/push →
  EC2 deploy via SSH.
- `prod.yml`: production pipeline.

Secrets are injected via GitHub Environments (`DEV_*`); Docker Hub images
`restaurant-api` (port 8000) and `restaurant-web` (port 80) run on an Ubuntu EC2
instance behind `--restart unless-stopped`.

---

## Docs

- `define/er-diagram.md` / `define/er-diagram.mmd` — data model
- `design/api-docs.md` — REST + WebSocket contract (hand-written, mirrors code)
- `design/openapi.yaml` — machine-readable spec
- `backend-prompt.md` / `frontend-prompt.md` — original build prompts