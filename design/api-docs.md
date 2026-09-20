# Soroco House — API Documentation

> This document describes the **actual** API as implemented in `backend/src/routes/`
> and matches the codebase (verified against `main.py`, all routers, services,
> models and exception handlers). Machine-readable spec:
> [`design/openapi.yaml`](./openapi.yaml).

---

## 1. Base URL

```
http://localhost:8000/api/v1
```

- Every JSON route below is under `/api/v1`, except `GET /health` which is
  mounted at the root. Static uploads are mounted at `/images` (root).
- The frontend never writes `/api/v1` in code — its `VITE_API_BASE_URL` /
  `VITE_WS_BASE_URL` already carry it.
- All prices are in ₹ (INR), computed server-side — client-sent totals are ignored.

### Exceptions to the JSON envelope

| Route | Why |
|---|---|
| `GET /health` | Raw `{status, database}` — no envelope |
| `GET /images/{filename}` | Raw image bytes (S3 proxy) or `404` JSON error |
| `GET /admin/orders/export` | `text/csv` attachment |

---

## 2. Authentication & roles

- Public routes: no auth.
- Staff routes: `Authorization: Bearer <JWT>`.
- The JWT is HS256 (python-jose), claims `{sub, email, role, exp}`, and is
  issued by `POST /auth/login` or `POST /auth/signup`. Lifetime:
  `DEV_JWT_EXPIRE_MINUTES` (default 480).
- Roles: `employee`, `admin`. `require_roles(...)` is enforced server-side on
  every staff/admin route.

| Route | public | employee | admin |
|---|---|---:|---:|
| `GET /health`, `GET /menu`, `POST /payments` | ✔ | ✔ | ✔ |
| `GET /images/{filename}` | ✔ | ✔ | ✔ |
| `POST /auth/login`, `POST /auth/signup`, `GET /auth/check` | ✔ | — | — |
| `GET /auth/me` | — | ✔ | ✔ |
| `PATCH /menu/{uuid}`, `GET /orders/kitchen`, `PATCH /orders/{uuid}` | — | ✔ | ✔ |
| `POST /menu`, `DELETE /menu/{uuid}`, `POST /upload/image` | — | ✖ | ✔ |
| `GET/POST/PATCH/DELETE /admin/employees`, `GET /admin/orders`, `GET /admin/orders/export` | — | ✖ | ✔ |
| `WS /ws/menu` | ✔ | — | — |
| `WS /ws/orders?token=` | — | ✔ | ✔ |

---

## 3. Response envelope

**Success** — every success is wrapped in `ok(data)` or `ok_message(text)`:

```json
{ "success": true, "data": { } }
```

```json
{ "success": true, "data": { "message": "Employee removed" } }
```

**Error** — every failure is mapped by `utils/exceptions/handlers.py` to:

```json
{
  "success": false,
  "message": "Menu item not found",
  "code": "NOT_FOUND",
  "detail": null
}
```

`detail` is optional and only populated on payments validation failures
(e.g. `detail="Menu item <uuid> is no longer on the menu"`).

**HTTP status ↔ code**

| HTTP | `code` | Meaning |
|---|---|---|
| `400` | `FORGED_CALLBACK` | Validated-gateway signature rejected (reserved) |
| `401` | `UNAUTHORIZED` / `INVALID_CREDENTIALS` | Missing/invalid token; bad login |
| `403` | `FORBIDDEN` / `SIGNUP_PENDING` | Role insufficient; account exists, no password yet |
| `404` | `NOT_FOUND` | Unknown resource |
| `409` | `CONFLICT` | Duplicate email, duplicate menu name, admin delete attempt |
| `422` | `VALIDATION_ERROR` | Pydantic validation or business-rule violation (dates, price-for-size, phone, email) |
| `429` | `RATE_LIMITED` | SlowAPI limit hit |
| `500` | `INTERNAL_ERROR` | Unhandled exception (no `code`/`detail` in body) |

Rate limits (SlowAPI, per IP): auth routes **5/min**, `POST /upload/image`
**5/min**, `POST /payments` **20/min**.

---

## 4. Endpoint reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/health` | — | Liveness + DB probe (raw) |
| `POST` | `/auth/login` | — | Login → JWT + role |
| `POST` | `/auth/signup` | — | Set password for pre-created account → JWT |
| `GET` | `/auth/check?email=` | — | Is this a staff account? Has it set a password? |
| `GET` | `/auth/me` | bearer | Current user + role |
| `GET` | `/menu` | — | Menu grouped by category |
| `POST` | `/menu` | admin | Add item (broadcast) |
| `PATCH` | `/menu/{menu_uuid}` | emp/admin | Update item / toggle availability (broadcast) |
| `DELETE` | `/menu/{menu_uuid}` | admin | Delete item (broadcast) |
| `POST` | `/upload/image` | admin | Upload food photo (multipart) |
| `GET` | `/images/{filename}` | — | Stream S3 object (local driver → `404`) |
| `POST` | `/payments` | — | Place order from gateway result |
| `GET` | `/orders/kitchen` | emp/admin | Kitchen board, FIFO |
| `PATCH` | `/orders/{order_uuid}` | emp/admin | Update kitchen/order status (broadcast) |
| `GET` | `/admin/employees` | admin | List staff |
| `POST` | `/admin/employees` | admin | Create staff account |
| `PATCH` | `/admin/employees/{account_uuid}` | admin | Rename / re-email staff |
| `DELETE` | `/admin/employees/{account_uuid}` | admin | Delete staff (never an admin) |
| `GET` | `/admin/orders` | admin | Order history by date range + status |
| `GET` | `/admin/orders/export` | admin | CSV export of the same filters |

### 4.1 `GET /health`

No auth, no envelope.

```
GET /health
```

```json
{ "status": "ok", "database": "ok" }
```

`status` is `degraded` when the DB probe fails; `database` reports `ok`/`error`.

### 4.2 `POST /auth/login` (public, 5/min)

```json
{ "email": "thameem@test.com", "password": "admin123" }
```

`200` → `data`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "account_uuid": "a1b2c3d4-...",
  "name": "Thameem",
  "email": "thameem@test.com",
  "role": "admin"
}
```

Failures: `401 INVALID_CREDENTIALS` ("Invalid email or password"),
`429 RATE_LIMITED`.

### 4.3 `POST /auth/signup` (public, 5/min)

Pre-created staff account (password `NULL`) completes signup by setting a
password. The `confirm` field is required and validated server-side to match
`password` (which must be ≥ 8 characters).

```json
{ "email": "employee@test.com", "password": "strongpass1", "confirm": "strongpass1" }
```

`200` → same `data` shape as login (role `employee`).

Failures: `404 NOT_FOUND` ("No account found for this email — ask the admin to
add you first"), `409 CONFLICT` ("This account is already active. Please sign
in instead."), `429 RATE_LIMITED`.

### 4.4 `GET /auth/check?email=` (public, 5/min)

Signup step-1 helper — no `404`, always `200`:

```
GET /auth/check?email=employee@test.com
```

`data`:

```json
{ "exists": true, "has_password": false }
```

### 4.5 `GET /auth/me` (bearer)

```
GET /auth/me
```

`data` → `{ "account_uuid", "name", "email", "role" }`. `401 UNAUTHORIZED`
without a valid token.

### 4.6 `GET /menu` (public)

```
GET /menu
```

`data` is a list of category groups (display order is stable — the known
categories from `menu_service.CATEGORY_ORDER` first, unknown categories sorted
afterwards):

```json
[
  {
    "category": "Hot Luxury Teas",
    "items": [
      {
        "menu_uuid": "m1111111-1111-1111-1111-111111111111",
        "menu_id": 1,
        "category": "Hot Luxury Teas",
        "item_name": "Darjeeling First Flush",
        "item_description": "Light, floral & muscatel…",
        "standard_price": 280.0,
        "small_price": null,
        "large_price": null,
        "image_url": "https://images.unsplash.com/...",
        "is_available": true
      }
    ]
  }
]
```

- Prices are **flat** fields (not nested under a `prices` object).
- **All** items are returned, including `is_available: false` — customers see
  them greyed out and disabled; staff use the admin menu screen to re-enable.

### 4.7 `POST /menu` (admin)

Add an item. Request fields are `name` / `description` (aliased to
`item_name` / `item_description` in responses); a convenience `price` alias sets
`standard_price`. At least **one** price is required. Body
(`models/menu_schema.MenuItemCreate`):

```json
{
  "name": "Mango Frappe",
  "category": "Frappe",
  "description": "Seasonal",
  "standard_price": 300.0,
  "small_price": null,
  "large_price": 360.0
}
```

`200` → `data` = the created item (shape of §4.6, `menu_id` auto-assigned,
`is_available` defaults `true`). `409 CONFLICT` if the same `name` + `category`
already exists. Broadcasts `{"type":"menu_updated"}` to `/ws/menu`.

### 4.8 `PATCH /menu/{menu_uuid}` (employee + admin)

Update availability, prices or text (same field names as §4.7; at least one
field required):

```json
{ "is_available": false }
```

`200` → `data` = the updated item. `404 NOT_FOUND` if unknown. Persisted +
broadcast to `/ws/menu`.

### 4.9 `DELETE /menu/{menu_uuid}` (admin)

```
DELETE /menu/m1111111-1111-1111-1111-111111111111
```

`200` → `data: { "message": "Menu item deleted" }`. `404` if unknown.
Broadcast to `/ws/menu`.

### 4.10 `POST /upload/image` (admin, 5/min)

Multipart `multipart/form-data`:

| field | type | notes |
|---|---|---|
| `file` | file | JPEG/PNG/WebP, ≤ `DEV_UPLOAD_MAX_SIZE_MB` (default 5 MB) |
| `item_name` | text | optional, defaults to `"food"` (used for the S3 key) |

`200` → `data: { "image_url": "/api/v1/images/<filename>" }`. The file is
validated, resized to max 640px and re-encoded to WebP (q82) before storage.
Local driver → `data/uploads/<uuid>.webp`; S3 driver → private bucket
(see §4.11). `401/403` for non-admins, `422` for type/size violations.

### 4.11 `GET /images/{filename}` (public)

Streams an object when `DEV_STORAGE_DRIVER=s3` (bucket is private, Block
Public Access on) with `Cache-Control: public, max-age=31536000, immutable`.
With the **local** driver this endpoint returns `404 NOT_FOUND` — local uploads
are served by the static `/images` mount, e.g. `http://localhost:8000/images/<uuid>.webp`.

### 4.12 `POST /payments` (public, 20/min)

Single endpoint. The frontend posts the gateway result; the backend is the
source of truth for pricing. While integration is mocked, the provided
`gateway_status` is the decision input (see `define/PAYMENT-INTEGRATION-NEXT.md`).

Request body (`PaymentRequest`):

```json
{
  "order_ref": "or_abc123def456",
  "gateway_status": "success",
  "payment_method": "razorpay",
  "transaction_id": "pay_PkF21XS9mup1b9",
  "table_name": "A1",
  "customer_name": "Alex",
  "phone_number": "+919876543210",
  "customer_email": "alex@example.com",
  "items": [
    { "menu_uuid": "m2222222-2222-2222-2222-222222222222", "selected_size": "large", "quantity": 2 },
    { "menu_uuid": "m1111111-1111-1111-1111-111111111111", "quantity": 1 }
  ]
}
```

| field | rules |
|---|---|
| `order_ref` | required, ≤255, unique idempotency key |
| `gateway_status` | `success` \| `failed` \| `cancelled` |
| `payment_method` | `phonepay` \| `razorpay` (default `razorpay`) |
| `transaction_id` | optional |
| `phone_number` | optional; if present must have ≥10 digits |
| `customer_email` | required, must contain `@` |
| `items[]` | at least one; `quantity ≥ 1`, `selected_size` = `standard`/`small`/`large` |

**`success`** → order header + line items are written (server-priced, 5% tax,
`kitchen_status=in_queue`, `order_status=ordered`), the bill email is sent
(mock SMTP or console), and `orders_updated` is broadcast to `/ws/orders`.
`200` → `data`:

```json
{
  "payment_status": "success",
  "order_number": 12,
  "total": 483.0,
  "order": {
    "order_uuid": "o9999999-9999-9999-9999-999999999999",
    "order_id": 5,
    "order_number": 12,
    "table_name": "A1",
    "customer_name": "Alex",
    "phone_number": "+919876543210",
    "payment_method": "razorpay",
    "payment_status": "success",
    "payment_transaction_id": "pay_PkF21XS9mup1b9",
    "kitchen_status": "in_queue",
    "order_status": "ordered",
    "total_price": 483.0,
    "subtotal": 460.0,
    "tax": 23.0,
    "created_at": "2026-09-20T10:36:12.123456+00:00",
    "items": [
      { "menu_uuid": "m2222...", "item_name": "Signature Cold Brew", "selected_size": "large", "quantity": 2, "unit_price": 220.0, "line_total": 440.0 }
    ]
  }
}
```

**`failed` / `cancelled`** → no rows written. `200` → `data`:

```json
{ "payment_status": "cancelled", "message": "Payment failed/cancelled, nothing was charged" }
```

**Idempotency:** confirming the same `order_ref` twice with `success` returns
the existing order — never a duplicate.

**`422 VALIDATION_ERROR`** cases: unknown `menu_uuid`, item has no price for the
selected size, phone < 10 digits, missing email, `items` empty.

### 4.13 `GET /orders/kitchen` (employee + admin)

```
GET /orders/kitchen
```

`data` is an **array** (FIFO, oldest first) of serialized orders — exact same
shape as `order` in §4.12, so the board restores state after a refresh.

### 4.14 `PATCH /orders/{order_uuid}` (employee + admin)

```json
{ "kitchen_status": "preparing" }
```

or

```json
{ "order_status": "delivered" }
```

Validation is **enum-only** — any value from the column's ENUM is accepted, no
enforced transition order. `200` → `data` = the full updated serialized order.
`404` unknown. Persisted + broadcast `orders_updated` (with the fresh kitchen
list) to `/ws/orders`.

### 4.15 `GET /admin/employees` (admin)

`data` = array of account objects:

```json
[
  {
    "account_uuid": "a1b2c3d4-...",
    "account_id": 1,
    "account_name": "Thameem",
    "account_email": "thameem@test.com",
    "account_role": "admin",
    "created_at": "2026-09-20T09:00:00+00:00",
    "has_password": true,
    "can_delete": false
  }
]
```

`has_password` flags who still needs `/signup`; `can_delete` is false for admins.

### 4.16 `POST /admin/employees` (admin)

```json
{ "name": "New Staff", "email": "new@test.com" }
```

`200` → `data` = the created account (role `employee`, `has_password: false`).
`409 CONFLICT` duplicate email, `422` invalid fields.

### 4.17 `PATCH /admin/employees/{account_uuid}` (admin)

```json
{ "name": "New Name", "email": "renamed@test.com" }
```

At least one of `name`/`email` is required (`422` otherwise). `200` → `data` =
updated account. `404` unknown, `409` email already taken.

### 4.18 `DELETE /admin/employees/{account_uuid}` (admin)

```
DELETE /admin/employees/e5f6g7h8-...
```

`200` → `data: { "message": "Employee removed" }`. `404` unknown,
`409 CONFLICT` when the target is an admin ("Admin accounts cannot be deleted
through this endpoint").

### 4.19 `GET /admin/orders` (admin)

```
GET /admin/orders?from_date=2026-09-01&to_date=2026-09-20&order_status=delivered
```

| query | required | notes |
|---|---|---|
| `from_date` | no | `YYYY-MM-DD` (start of day) |
| `to_date` | no | `YYYY-MM-DD` (inclusive — end of day) |
| `order_status` | no | `ordered` \| `delivered` |

`data` = array of serialized orders (same shape as §4.12, includes
`payment_status` etc.). Bad date format → `422 VALIDATION_ERROR`.

### 4.20 `GET /admin/orders/export` (admin)

Same filters as §4.19. Returns `text/csv` attachment
(`Content-Disposition: attachment; filename="soroco-order-history.csv"`)
— **not** the JSON envelope. Columns:

```
Order Number, Ordered At, Table, Customer, Items, Quantity, Subtotal (INR), Tax (INR), Total (INR), Payment Method, Payment Status, Kitchen Status, Order Status
```

---

## 5. WebSockets

Base: `ws://localhost:8000/api/v1`

```
WS  /ws/menu
WS  /ws/orders?token=<JWT>
```

All frames are JSON, server → client. Clients never send application messages;
they only receive and apply events.

### 5.1 `WS /ws/menu` (public)

- **Frame:** `{"type": "menu_updated"}` — sent after every menu
  create/update/delete.
- **No payload.** Clients re-fetch `GET /menu` on receipt (state is cheap and
  always consistent).

### 5.2 `WS /ws/orders` (employee/admin)

- Authenticated via **query parameter** on connect. The server validates the
  token on the handshake and closes with **code `4401`** on failure.
- **Frame:** `{"type": "orders_updated", "data": [ …serialized orders (FIFO)… ]}`
  — broadcast after `PATCH /orders/{uuid}` (status change) and after a
  successful `POST /payments`. `data` is the **full kitchen list**, so clients
  can replace their board state directly.

### 5.3 Reconnect behavior

- Client auto-reconnects with backoff (`frontend/src/services/websocket/liveClient.ts`).
- On `/ws/menu` reconnect: re-fetch `GET /menu`.
- On `/ws/orders` reconnect: re-fetch `GET /orders/kitchen` (do not trust the gap).

---

## 6. Notes for implementers

- Never trust the client for totals — the backend recomputes every line price
  from the menu at `POST /payments` (5% tax via `TAX_RATE = 0.05`).
- Validate JWT + role server-side on every write: menu create/delete and image
  upload are **admin-only**; menu patch and kitchen routes are employee/admin.
- `is_available`, `kitchen_status` and `order_status` are persisted — change
  them only through their PATCH endpoints.
- Payment keys are sandbox-only (`DEV_` prefix). Bill emails print to console
  when `DEV_EMAIL_MOCK=true`.
- `order_number` is the customer-facing number shown on success screens and emails.
- Error handling details live in `backend/src/utils/exceptions/` — do not return
  ad-hoc error shapes; raise `AppError` subclasses so the handlers map them to the
  single error envelope.