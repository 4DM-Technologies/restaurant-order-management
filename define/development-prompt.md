# SOROCO HOUSE — Restaurant Order Management System | Full Development Prompt

> Hand this document to any engineer or AI coding agent. It is a complete, self-contained specification of the business, the product behavior, the data model, and the endpoints. Reading this alone must be enough to start building.

---

## 1. Project Overview

Build a **QR-menu ordering system** for **Soroco House**, a specialty coffee café brand. Customers scan a QR code at their table, browse the menu, add/remove items, pay via **UPI (PhonePe / Razorpay sandbox)**, and the kitchen receives the order in real time. Restaurant staff log in to a protected kitchen/admin UI.

The reference website is **https://www.soroco.coffee/** — replicate its visual look and feel for the customer-facing menu page (see Section 3).

- **Backend:** Python + FastAPI (+ WebSocket). SQL database.
- **Frontend:** React (Vite). Mobile-first (customers use phones).
- **Auth:** JWT session tokens with a role (`admin`|`employee`).
- **Payments:** PhonePe or Razorpay **sandbox only** (no live money).
- **Real-time:** WebSocket for kitchen order streaming and menu change streaming.
- **Food item images:** placeholders for now; real images will be added later.

---

## 2. Roles & Who Uses What

| Role | Access |
|---|---|
| **Customer** (no login) | `/menu`, `/cart`, `/payment` — browses, orders, pays. |
| **Employee** (login) | Everything the customer has, PLUS menu admin controls at `/menu`, the kitchen board at `/orders`. |
| **Admin** (login) | Everything the employee has, PLUS `/admin` (employee management + order history). |

- Customers do **not** have accounts. There is no customer signup.
- Accounts in the DB represent **staff only** (`employee` or `admin`). Employees are pre-created by an admin (name + email) and then set their own password via the signup flow.
- **Rule:** Admin can never be deleted via the UI.

---

## 3. Brand & UI Reference (REPLICATE soroco.coffee)

Fetch and study **https://www.soroco.coffee/** and **https://www.soroco.coffee/menus** before designing any page. Replicate this identity:

- **Logo:** "Soroco House" wordmark + logo mark (top-left).
- **Colors:** earthy, warm, minimalist tones (coffee browns, cream/off-white, warm greys). Calm, cozy, "aesthetic" feel.
- **Typography:** clean, light, modern sans-serif; large elegant headings ("Sip the Specialty", "Good to the Last Sip").
- **Layout language:** generous whitespace, hero section, image-forward gallery, cards.
- **Contact/footer:** phone, email (`enquiry@majofoods.in`), address, and a newsletter strip **"Stay in the Loop"** (email subscribe).
- **Menu style:** grouped by **category** (e.g. Coffee, Cold Brew, Hot Luxury Teas), item names with descriptions and prices in ₹ (`₹200`).
- **Cafés:** the brand has multiple locations (Nungambakkam, OMR, Anna Nagar). Keep the menu UI styled consistently regardless of café.

**Customer menu page (`/menu`) is the replica target.** Build it mobile-first: category sections, item photo placeholder, `₹` prices, and a bottom cart bar. The app pages (cart, login, kitchen, admin) follow the same warm/minimal design language.

---

## 4. Frontend Pages & Exact Behavior

### 4.1 `/menu` — Customer menu (public)

- Browse menu grouped by category. Each item card shows: **image** (or placeholder when `image_url` is NULL), **name**, **description**, **price(s)** (standard / small / large if applicable).
- Customers **add/remove items entirely in the frontend**:
  - `+` increments quantity of that item, `-` decrements.
  - Quantity 0 removes the item card control for that item.
  - No backend write happens here; this is local cart state (Context/Redux + localStorage).
- A **bottom sticky cart bar** shows item count + running total with a **downward arrow / chevron**. Clicking it navigates to `/cart`.
- **Available/Unavailable:** if an item is marked unavailable (see §4.1.1), it renders **greyed out**, labeled "Unavailable", and its `+` is disabled (cannot be added to cart).
- Live updates: menu changes broadcast by staff arrive over the WebSocket and re-render the menu **without a refresh** (Section 8).

#### 4.1.1 Staff extra controls on `/menu` (employee/admin only)

If the session JWT exists **and** the role is `employee` or `admin`, the same menu page shows extra controls:

- **"Add New Item"** button at the top → modal with **category, name, price, description, photo upload** → if a photo is picked, upload it to `POST /api/v1/uploads` (Section 9A) → `POST` to backend → new menu item saved to DB (`is_available` defaults TRUE) → `image_url` = the returned upload URL (or NULL if no photo) → broadcast over WS.
- **Remove item:** a visible **trash icon** on each item card (shown only to staff; no long-press/swipe). Tap → popup **"Are you sure?"** → confirm → `DELETE` item from DB → broadcast over WS.
- **Availability dropdown / toggle** (Available ⇄ Unavailable) per item:
  - **Persisted.** Toggling writes `menu.is_available` to the DB (`PATCH /menu/{menu_uuid}`) AND broadcasts the change over WS. On server restart, the DB state is the source of truth. Toggling to Unavailable greys the card out for everyone (customers included) via WS broadcast.
- Menu items disabled for customers must still be visible to staff (so they can re-enable).
- **Security:** every one of these staff actions **must be re-validated against the JWT on the backend** — never trusted from the client. `DELETE`/`POST`/`PATCH` are blocked server-side, not just hidden in the UI.

### 4.2 `/cart` — Customer cart

- Lists every selected item: name, size (if any), quantity, line total.
- Shows **grand total bill**.
- **Payment method selection while scrolling down** (a section further down the cart page): select **PhonePe** or **Razorpay**.
- Button **"Pay"** → shows input form: **table name, customer name, phone number**.
  - Validate phone number (10-digit Indian / E.164).
- Clicking **"Proceed to Pay"** calls the backend `/payment` endpoint (Section 6).
- **On payment failure/cancel:** the customer is returned to the cart and a **user-friendly error message** is shown in the cart section (e.g. "Payment was cancelled. No amount was charged. Please try again."). Cart contents are **not** lost.
- **On success:** backend places the order and emails the bill → customer sees a success screen ("Order placed! Order #12") and the cart is cleared.

### 4.3 `/payment` — (backend-driven page/redirect)

- Triggered from the cart. The backend creates a sandbox payment session; the customer is redirected to the gateway (or gateway checkout is opened) and the result is received back.
- Result handling defined in Section 7.

### 4.4 `/login` — Staff sign-in (protected routes only)

- Only reachable when a protected page redirects here.
- Fields: **email, password**.
- Backend validates credentials, and on success **issues a JWT with the role** from the DB → redirect to the originally requested page (`/orders` or `/admin`).
- Below the password field: **"Don't have an account? Please signup."** → link to `/signup`.
- Wrong credentials → friendly inline error.
- **Special case:** if the email exists but the account has no password yet (admin pre-created it), the backend returns `403 SIGNUP_PENDING` → frontend redirects the user to `/signup` instead of showing a credentials error.

### 4.5 `/signup` — Staff account password setup

- Staff accounts are **pre-created by admin (name + email only)**. Signup only *completes* an account by setting its password.
- Step 1: enter **email address** → click "Next".
  - If the email **exists** in the `accounts` table → show **Password** + **Confirm password** fields.
  - If it does **not** exist → user-friendly error, e.g. **"Invalid email address. Ask an admin to add you first."**
- Step 2: enter matching password + confirm → backend **hashes** it and stores it → redirect to `/orders`.
- Password min length ≥ 8; confirm must match.

### 4.6 `/orders` — Kitchen board (protected: employee/admin)

- **Protected.** No/invalid JWT → redirect to `/login`. After login, return to `/orders`.
- Displays incoming orders in **FIFO order** (oldest placed first), **live** via WebSocket (Section 8).
- Each order card: order number, table name, customer name, items with quantity/size, total, placed time, phone (for verification).
- **Status buttons per order — default `In-Queue`:** `In-Queue` → `Preparing` → `Prepared`.
  - **Persisted.** Each click calls `PATCH /orders/{order_uuid}` with the new `kitchen_status`, which is written to the DB. On page refresh or server restart the statuses are restored from the DB (no reset). Status changes are also broadcast over the kitchen WS so all open boards stay in sync.
- A separate **"Delivered"** action marks the order lifecycle as complete (`order_status = 'delivered'` via `PATCH`) — this is what moves it into completed/delivered state in the view.
- Completed/delivered orders can be collapsed or cleared from the view (client-side), but the underlying DB rows remain (needed for order history & CSV).

### 4.7 `/admin` — Admin dashboard (protected: admin only)

- **Only `admin` role.** If an `employee` tries to access:
  - They see **"Unauthorized"** and stay on the page (no redirect to login).
- If **no session** → redirect to sign-in, then back to `/admin`.
- Two buttons/sections:
  1. **Employee**
  2. **Order History**

### 4.8 `/admin/employee` — Employee management (protect: admin only)

- Shows all employee details (name, email, role, created date).
- **Search bar** to filter employees; on its right side a **`+` icon**.
  - `+` → modal: **name + email** → `POST` → creates a new account in `accounts` (role `employee`, **password NULL**) → the new employee can then sign up (set their password) at `/signup`.
- **Delete employee:** a visible **trash icon** on each employee row (same pattern as menu items; no long-press/swipe). Tap → popup **"Are you sure you want to delete the employee?"** → confirm → `DELETE` → account removed from DB.
- The user account of the currently logged-in admin cannot be deleted.

### 4.9 `/order-history` — (protect: admin only)

- Shows **all orders placed so far**, from the `orders` table (header + items).
- **Filters:** Today / Yesterday / **Custom date range** + **Order status** dropdown (`ordered` / `delivered` / all) — the three apply together (date range AND status).
- **Export button** → downloads the **currently filtered** orders (same filters: date range + order status) as a **CSV file** (columns: order no., date/time, table, customer, phone, items/quantities, total, payment method, order status, kitchen status, payment status).

### 4.10 Route protection summary

| Route | Public | employee | admin |
|---|---|---|---|
| `/menu` | ✔ (customer) + staff controls if JWT role ∈ {employee, admin} | ✔ | ✔ |
| `/cart`, `/payment` | ✔ | ✔ | ✔ |
| `/orders` | login redirect | ✔ | ✔ |
| `/admin`, `/admin/employee`, `/order-history` | login redirect | ❌ "Unauthorized" stays | ✔ |

---

## 5. Data Model

The canonical schema is in **`define/er-diagram.md`** (and `define/er-diagram.mmd`). Summary:

### `accounts` (staff only; no customer accounts)
`account_uuid` PK · `account_id` · `account_name` · `account_email` **UNIQUE** · `account_password` **NULL until signup** · `account_role` ENUM(`employee`,`admin`) · `created_at/by` · `updated_at/by`

### `menu`
`menu_uuid` PK · `menu_id` · `category` · `item_name` · `item_description` · `standard_price` · `small_price` · `large_price` (all DECIMAL(10,2), nullable) · `image_url` VARCHAR(500) NULL (real images later; NULL → frontend shows placeholder) · `is_available` BOOLEAN NOT NULL DEFAULT TRUE · audit columns

### `orders` (transaction header)
`order_uuid` PK · `order_id` · `order_number` (customer-facing) · `table_name` · `customer_name` · `phone_number` · `payment_method` ENUM(`phonepay`,`razorpay`) · `payment_status` ENUM(`success`,`failed`,`cancelled`) · `payment_transaction_id` (gateway ref) · `kitchen_status` ENUM(`in_queue`,`preparing`,`prepared`) NOT NULL DEFAULT `in_queue` · `order_status` ENUM(`ordered`,`delivered`) NOT NULL DEFAULT `ordered` · `total_price` · audit columns

### `order_items` (line items — one row per menu line)
`order_item_uuid` PK · `order_item_id` · `order_uuid` **FK→orders.order_uuid** · `menu_uuid` **FK→menu.menu_uuid** · `selected_size` ENUM(`standard`,`small`,`large`) NULL · `quantity` · `unit_price` (price **snapshot at order time**) · `line_total`

**Relationships:**
- `orders` 1 ── N `order_items`
- `menu` 1 ── N `order_items`
- `orders` N ── M `menu` (resolved through `order_items`)

> **Note update:** Three business-state columns are now **persisted**:
> - `menu.is_available` (availability) — **persisted**. Survives server restarts.
> - `orders.kitchen_status` (In-Queue/Preparing/Prepared) — **persisted**. Survives page refresh & server restart.
> - `orders.order_status` (Ordered/Delivered lifecycle) — **persisted**.
>
> These are separate concerns from `payment_status`: payment outcome (success/failed/cancelled) is independent of kitchen progress and order lifecycle.
> Note that `orders.order_status` transitions to `delivered` only when a staff member marks an order delivered on the kitchen board.

---

## 6. Backend API Endpoints (FastAPI)

All JSON unless noted. Protected = requires `Authorization: Bearer <JWT>`; roles in parentheses.

> **API versioning:** every backend route lives under the **`/api/v1`** prefix (FastAPI router prefix). The frontend never writes `/api/v1` in code — its `VITE_API_BASE_URL` (and `VITE_WS_BASE_URL`) already contains the prefix, so the frontend only calls the short path, e.g. frontend `/menu` → real request `http://localhost:8000/api/v1/menu`.

| Method | Endpoint (full path = `/api/v1` + this) | Protection | Purpose |
|---|---|---|---|
| `GET` | `/health` | public | Liveness probe (health check) |
| `GET` | `/menu` | public | List ALL menu items grouped by category (includes `is_available`, `image_url`). **Unavailable items are still returned** — the frontend greys them out for customers, while staff see them to re-enable |
| `POST` | `/menu` | **protected** (employee/admin) | Add menu item {name, price, description, category, prices} |
| `PATCH` | `/menu/{menu_uuid}` | **protected** (employee/admin) | Update item (availability toggle / `is_available`, prices, etc.) |
| `DELETE` | `/menu/{menu_uuid}` | **protected** (employee/admin) | Remove menu item |
| `POST` | `/uploads` | **protected** (employee/admin) | Upload a food photo — multipart `file` + `item_name` form fields. Validates type (jpeg/png/webp) and size (≤ `DEV_UPLOAD_MAX_SIZE_MB`), resizes to ~640px WebP with Pillow, stores via the storage driver (S3 or local fallback, Section 9A), returns `{"image_url": "<relative /images/<file> path or absolute S3/CDN URL>"}`. The returned value is saved into `menu.image_url` |
| `POST` | `/payment` | public | Single payment endpoint — receives the **final** gateway result from the frontend (or gateway callback). Branches by status: **success** → insert `orders` + `order_items`, recompute prices, `payment_status='success'`, `kitchen_status='in_queue'`, `order_status='ordered'`, store `payment_transaction_id`, generate + email bill, broadcast kitchen WS; **failed / cancelled** → no order rows, return friendly error so the cart stays intact |
| `GET` | `/orders` | **protected** (employee/admin) | Orders for kitchen (FIFO, includes `kitchen_status` + `order_status`) |
| `PATCH` | `/orders/{order_uuid}` | **protected** (employee/admin) | Update `kitchen_status` or `order_status`. **Validation = enum only:** value must be one of the column's ENUM values (`in_queue`/`preparing`/`prepared` or `ordered`/`delivered`). No enforced transition order — staff may jump or revert freely |
| `POST` | `/auth/login` | public | {email, password} → JWT {token, role} |
| `POST` | `/auth/signup` | public | {email, password, confirm} → validates email exists in accounts, sets hash → JWT |
| `GET` | `/auth/me` | protected | Current user + role |
| `GET` | `/admin/employees` | **protected** (admin) | All employees |
| `POST` | `/admin/employees` | **protected** (admin) | Create employee {name, email} (password NULL) |
| `DELETE` | `/admin/employees/{account_uuid}` | **protected** (admin) | Delete employee |
| `GET` | `/order-history?from=&to=&order_status=` | **protected** (admin) | Orders by date range + optional `order_status` filter (`ordered`/`delivered`, all when omitted) |
| `GET` | `/order-history/export.csv?from=&to=&order_status=` | **protected** (admin) | CSV download of filtered orders (same filters as above) |
| `WS` | `/ws/orders` | **token required** (employee/admin) | Live order stream to kitchen |
| `WS` | `/ws/menu` | public (read updates) | Live menu change stream (add/remove/availability) to all viewers |

**Payment endpoint behavior (single route, two workflows):**

```
POST /api/v1/payment {order_ref, gateway_status, transaction_id, ...}
   │
   ├─ status = success
   │    → validate server-side → INSERT orders + order_items (update orders table)
   │    → payment_status='success', kitchen_status='in_queue', order_status='ordered', store transaction_id, recompute total = sum of lines
   │    → generate bill message + email it to the customer
   │    → broadcast new order to kitchen WS (FIFO)
   │    → respond {status: 'success', order_number, total}
   │
   └─ status = failed | cancelled
        → NO order rows created
        → respond {status: 'failed'|'cancelled', message: 'Payment failed/cancelled, nothing was charged'}
        → frontend shows friendly error in /cart, cart contents preserved
```

**Always enforce on the backend:** the /menu staff actions, /orders, /admin*, /order-history must validate the JWT and role. Do not rely on the frontend hiding buttons.

**Rate limiting (slowapi):** `/auth/login` and `/auth/signup` are rate-limited server-side — e.g. **5 attempts per minute per IP** — to prevent brute-force password guessing. All other endpoints are unlimited for the demo. Return `429 Too Many Requests` when exceeded.

---

## 7. Payment Flow (PhonePe / Razorpay SANDBOX only)

- Use **sandbox/test credentials** — no live transactions.
- **PhonePe (sandbox):** uses a **server-to-server callback + customer redirect** flow:
  1. Backend calls PhonePe "PG Create Payment" API with `{merchantId, amount (paise), orderId, transactionId, redirectMode, callbackUrl}`.
  2. PhonePe returns `{redirectUrl, transactionId}` → customer is redirected to the sandbox payment page.
  3. Customer pays → PhonePe performs a **server-to-server callback** to our callback URL (`http://localhost:{DEV_PORT}/api/v1/payment` by default) AND redirects the customer back to our success/error screen.
  - **Callback contract (what PhonePe POSTs to our endpoint):**
    - Header `X-VERIFY: <sha512_checksum>###<salt_index>` (note the `###` separator + salt index)
    - Body: `{ "response": "<base64-encoded-JSON>", "checksum": "<same checksum>" }`
  - **Checksum verification (must implement, not skip):**
    ```
    decoded   = base64_decode(JSON.response)               // the actual JSON string
    checksum  = SHA512(decoded + DEV_PHONEPE_SALT_KEY)
    header    = checksum + "###" + DEV_PHONEPE_SALT_INDEX
    pass only if header X-VERIFY == expected  (else reject as a forged callback)
    ```
  - **Decoded response payload fields:**
    ```json
    {
      "merchantId": "MERCHANTUAT",
      "transactionId": "T20260305123045",
      "amount": 50000,                  // in paise (₹500 = 50000)
      "state": "COMPLETED",
      "responseCode": "SUCCESS",
      "paymentInstrument": { "type": "UPI" }
    }
    ```
  - Success test: `state == "COMPLETED"` **and** `responseCode == "SUCCESS"` → treat as success. Anything else → failed/cancelled (no order rows).
  - **Both** the customer redirect result AND the server callback should be accepted by `/payment` (idempotent — see below).
- **Razorpay:** test mode keys (`rzp_test_*`); standard checkout with `RazorpayCheckout`; SDK's `onSuccess` / `onDismiss` (cancel) / error handlers. Razorpay's SDK sends the payment result to our backend in plain JSON (no base64/checksum needed — Razorpay secures it server-side via API secret verification on our backend).

**State machine per order payment:**

```
cart → gateway sandbox redirect/checkout (customer pays)
   → result comes back to POST /api/v1/payment
   → status = success  → update orders table (insert order + items) → email bill → kitchen WS broadcast → success screen
   → status = failed   → no order row → return to /cart → friendly error, cart preserved
   → status = cancelled → no order row → return to /cart → friendly "cancelled, no charge" error, cart preserved
```

- The **single `POST /api/v1/payment` endpoint** is the source of truth for the outcome. On **success** it validates the gateway response, **then inserts `orders` + `order_items`** (pricing recomputed from DB prices & quantities; `unit_price` snapshot), stores `payment_transaction_id`, sets `payment_status='success'`, initializes `kitchen_status='in_queue'` and `order_status='ordered'`, emails the bill, and broadcasts the order to the kitchen.
- On **failure/cancellation it must NOT create order rows** — it just returns a friendly error/cancel message.
- Handle idempotency: if the same `order_ref` reaches the endpoint twice, do not double-insert. If the order already exists with `payment_status='success'`, return the existing order.

---

## 8. Real-time Streaming (FastAPI WebSocket)

1. **`/api/v1/ws/menu`** — staff add/remove/availability changes are broadcast to every connected menu viewer (including the staff's own menu). Customers see updates without refresh ("no defects"). Availability & add/remove are pushed instantly.
2. **`/api/v1/ws/orders`** — broadcasts to all connected kitchen boards:
   - a newly placed order (payment succeeded + order persisted, Section 7, rendered **FIFO** oldest first)
   - `kitchen_status` / `order_status` updates from any staff `PATCH /orders/{order_uuid}` so open boards stay in sync.

Design: WebSocket connection per page; small manager in FastAPI (`ConnectionManager`) with `connect/disconnect/broadcast`. Menu WS is public; orders WS authenticates the token on connect with role check.

---

## 9. Bill Email — Free SMTP Delivery

- On successful order placement, generate a **bill message** (order number, items w/ qty+size, line & total, payment method, table name) and email it to the customer (the payment request captures the customer email). The bill is a plain-text friendly message.
- **Email provider: 100% free SMTP (Gmail)** — chosen because it costs nothing:
  - Use any regular Gmail address with a **16-character App Password** (Google Account → Security → 2-Step Verification → App passwords). No paid plan involved.
  - SMTP settings: host `smtp.gmail.com`, **port `587` with STARTTLS**. Username = the Gmail address, password = the App Password, sender = the same address.
  - Drop-in free alternatives: **Zoho Mail** free tier or **Outlook.com** SMTP — any SMTP server works; the settings are plain env vars.
- Wrap email in a service with a **mock adapter**: when `DEV_EMAIL_MOCK=true`, the bill is printed to the console and nothing is sent (useful when offline); when `false` (the DEFAULT) it really sends via SMTP using `DEV_SMTP_HOST` / `DEV_SMTP_PORT` / `DEV_SMTP_USER` / `DEV_SMTP_PASSWORD` / `DEV_SMTP_SENDER`. Fill the Gmail App Password to get real emails in dev.
- **Free-tier note (read this):** Gmail free SMTP is rate-limited (≈500 recipients/day) — far above a restaurant demo's needs. Keep `DEV_EMAIL_MOCK=false` so bills are genuinely emailed in dev; flip it to `true` only when running offline.

---

## 9A. Food Image Storage — Upload, Serve, Cache (S3)

**Goal:** staff upload a photo for a menu item once, it is stored durably, the item's `menu.image_url` holds the served URL, and the page stays fast. This design is S3-ready by construction: moving from local-disk dev to S3 requires **zero frontend changes and zero schema changes**.

### 9A.1 Architecture

```
Browser (menu editor)
   │  multipart file + item_name          (FileReader for preview only — never base64 in the DB)
   ▼
POST /api/v1/uploads   (JWT, role employee/admin)
   │
   ├─ 1. Validate: content-type in {jpeg, png, webp} AND size ≤ DEV_UPLOAD_MAX_SIZE_MB
   ├─ 2. Normalize + resize to ~640px wide, re-encode WebP (Pillow)   ← smaller, faster loads
   ├─ 3. Filename: slugify(item_name) + "-" + 8-char unique suffix + ".webp"
   │       e.g. "hazelnut-latte-x9f2k1q4.webp"   (never the raw name — see below)
   └─ 4. Storage driver (chosen by DEV_STORAGE_DRIVER):
          · local → writes to DEV_UPLOAD_DIR (mounted at /images), returns "/images/<file>"
          · s3    → boto3 put_object to DEV_S3_BUCKET, returns the object URL
                    (S3 URL, or DEV_S3_CDN_URL-prefixed when a CDN is set)
   → response { "image_url": "<url>" }
```

The frontend `POST`s the returned `image_url` into `POST`/`PATCH /menu`, so the DB stores only a URL string.

### 9A.2 Why NOT "filename = exact item name"

Raw food names contain spaces, `₹`, emojis, accented chars, apostrophes and slashes — they must be percent-encoded in URLs, can collide, and can enable path traversal. **The backend always generates** `slugify(item_name)-<8char>.webp`:

- `slugify`: lowercase; replace every non `[a-z0-9]` run with `-`; collapse; strip leading/trailing `-`.
- unique suffix: 8 random hex chars (`secrets.token_hex(4)`) — collisions impossible.
- extension is decided by the re-encode target (`.webp`), never taken from the client filename.

Store the slug's display relationship in the DB (`item_name` column); the filename never needs to match an item exactly.

### 9A.3 Storage driver abstraction (S3-ready)

Implement a small internal service, e.g. `src/services/storage/storage.py`, exposing:

```
save_image(file_bytes: bytes, slug: str, content_type: str) -> str   # public URL or relative path
```

- **Local driver** (`DEV_STORAGE_DRIVER=local`): writes to `DEV_UPLOAD_DIR`, and `main.py` mounts `app.mount("/images", StaticFiles(directory=DEV_UPLOAD_DIR))`. Returns `/images/<file>`. This keeps the demo fully offline-capable.
- **S3 driver** (`DEV_STORAGE_DRIVER=s3`): `boto3` `put_object` on `DEV_S3_BUCKET` with `ContentType` + `Cache-Control: public, max-age=31536000, immutable`. Returns `<DEV_S3_CDN_URL>/<key>` when set, else the bucket object URL. Follow `define/S3-SETUP-GUIDE.md` to create the bucket, IAM user and CloudFront.

### 9A.4 Serving + caching (keeps the menu fast)

- **Relative `/images/...`** are served by FastAPI in dev; **absolute S3/CDN URLs** are used in prod (CloudFront in front of S3 = edge cache).
- All uploaded objects get `Cache-Control: public, max-age=31536000, immutable` (never mutated — a new upload is a new URL), so repeat visits are instant.
- **Frontend correctness (mandatory):** food `<img>` tags use a single `getImageUrl()` helper: absolute URLs pass through unchanged; relative paths are prefixed with `VITE_IMAGE_BASE_URL`; empty `image_url` renders the branded placeholder. Never hardcode an origin inside a component.
- **Perf expectation (answers "will the menu page lag?"):**
  - Menu text (name/desc/price) is one small JSON GET — milliseconds, not visible.
  - Images load **in parallel** and, with `loading="lazy"` + `decoding="async"` + the existing `aspect-[4/3]` placeholder box, the page paints text instantly while photos stream in — no layout shift, no page-visible lag.
  - `640px WebP` uploads (~30–100 KB) are the only payload served, so even first cold loads are quick; CloudFront + immutable caching make re-visits instant.

### 9A.5 Security & rules

1. `POST /api/v1/uploads` is **JWT-protected (employee/admin)** — re-validated on the backend like every other staff action. Customers never upload.
2. Server-side validation only: reject anything that is not a decodable jpeg/png/webp and anything over `DEV_UPLOAD_MAX_SIZE_MB`.
3. Filenames are backend-generated (slug + hex suffix). Never trust the client-provided filename.
4. `DEV_UPLOAD_DIR` is gitignored. Nothing runtime-written is ever committed to the repo.

---

## 10. Seed Data & Environment

### 10.1 Seed Data

- Seed one **admin** account (e.g. thameem@restaurant.com / hashed password) and one **employee** (email only, password NULL so it can be exercised through `/signup`).
- Seed a sample menu with categories & prices in ₹ matching the reference site (Coffee, Cold Brew, Hot Luxury Teas, Coffee Beans).
- Food images: seed items carry `image_url = NULL` so the frontend renders the branded placeholder box. Real photos are added by staff from the menu UI: pick a photo in the Add/Edit item modal → it is uploaded to `POST /api/v1/uploads` → the file is stored by the storage driver (S3 or local fallback, Section 9A) → the returned URL is written to `menu.image_url`. `image_url` is just a URL string, so no schema change is needed when real images arrive.

### 10.2 Backend `.env` (FastAPI — DEV only)

All keys are prefixed `DEV_` to make it explicit these are **dev/sandbox-only** settings (sandbox payment keys, free SMTP credentials). Production would use entirely different live credentials — none of these ship to prod.

| Variable | Example | Purpose |
|---|---|---|
| `DEV_APP_NAME` | `restaurant-order-management` | App/brand name shown in email bill |
| `DEV_PORT` | `8000` | Uvicorn bind port (`HOST` defaults to `0.0.0.0`) |
| `DEV_DATABASE_URL` | `sqlite:///./data/restaurant.db` | SQLAlchemy DSN. Dev default = SQLite; production/dev-on-AWS = PostgreSQL: `postgresql+psycopg2://USER:PASS@<rds-endpoint>:5432/<db>?sslmode=require` — step-by-step in `RDS-SETUP-GUIDE.md` (repo root). Switching DBs = change this one line |
| `DEV_JWT_SECRET_KEY` | `change-me-strong-secret` | HMAC signing secret for JWT (algorithm hardcoded `HS256`) |
| `DEV_JWT_EXPIRE_MINUTES` | `480` | Token lifetime (8h work shift) |
| `DEV_CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated allowed frontend origins |
| `DEV_PAYMENT_PROVIDER` | `razorpay` | `phonepay` or `razorpay` (sandbox switch) |
| `DEV_PHONEPE_MERCHANT_ID` | `MERCHANTUAT` | PhonePe sandbox merchant id |
| `DEV_PHONEPE_BASE_URL` | `https://api-preprod.phonepe.com/apis/pg-sandbox` | PhonePe sandbox PG endpoint |
| `DEV_PHONEPE_SALT_KEY` | (sandbox key) | PhonePe salt for checksum |
| `DEV_PHONEPE_SALT_INDEX` | `1` | PhonePe salt index — appended to the X-VERIFY header as `checksum###saltIndex` (the callback URL is derived separately from `DEV_PORT`: `http://localhost:{DEV_PORT}/api/v1/payment`) |
| `DEV_RAZORPAY_KEY_ID` | `rzp_test_xxxx` | Razorpay test-mode key id |
| `DEV_RAZORPAY_KEY_SECRET` | (test secret) | Razorpay test-mode key secret |
| `DEV_EMAIL_MOCK` | `false` | `false` → really send email via SMTP (default); `true` → print to console |
| `DEV_SMTP_HOST` | `smtp.gmail.com` | Free SMTP host (Gmail App Password) |
| `DEV_SMTP_PORT` | `587` | SMTP port (587 = STARTTLS) |
| `DEV_SMTP_USER` | (gmail address) | SMTP username, e.g. `restaurant.dev@gmail.com` |
| `DEV_SMTP_PASSWORD` | (16-char app password) | SMTP password (Gmail App Password — needs 2FA) |
| `DEV_SMTP_SENDER` | (same gmail) | From: address shown on the bill email |
| `DEV_AUTH_RATE_LIMIT` | `5/min` | slowapi limit on `/auth/login` + `/auth/signup` per IP (5 attempts per minute) |
| `DEV_STORAGE_DRIVER` | `s3` | Image storage backend: `s3` (AWS S3) or `local` (offline dev fallback that writes into `DEV_UPLOAD_DIR`) |
| `DEV_UPLOAD_DIR` | `./uploads` | Local-fallback directory for uploaded images (gitignored, never committed) |
| `DEV_UPLOAD_MAX_SIZE_MB` | `5` | Maximum accepted upload size in MB |
| `DEV_UPLOAD_ALLOWED_TYPES` | `jpeg,png,webp` | Comma-separated allowed image content types |
| `DEV_S3_BUCKET` | `soroco-food-images` | S3 bucket that stores food images |
| `DEV_S3_REGION` | `ap-south-1` | S3 bucket region |
| `DEV_S3_ACCESS_KEY_ID` | `(IAM) key` | AWS access key with PutObject/GetObject/ListBucket on the bucket |
| `DEV_S3_SECRET_ACCESS_KEY` | `(IAM) secret` | AWS secret access key |
| `DEV_S3_CDN_URL` | `https://dxxxx.cloudfront.net` | Optional CloudFront/CDN origin in front of the bucket. Empty → the backend returns the S3 object URL (`https://<bucket>.s3.<region>.amazonaws.com/<key>`) |

```dotenv
# backend/.env — DEV/sandbox only. Do NOT reuse these keys in production.
DEV_APP_NAME=restaurant-order-management
DEV_PORT=8000
DEV_DATABASE_URL=sqlite:///./data/restaurant.db
# RDS PostgreSQL (AWS) — see RDS-SETUP-GUIDE.md, change only this line:
# DEV_DATABASE_URL=postgresql+psycopg2://postgres:PASSWORD@soroco-restaurant-db.c0f2k1x9t3oy.ap-south-1.rds.amazonaws.com:5432/restaurant_db?sslmode=require
DEV_JWT_SECRET_KEY=change-me-strong-secret
DEV_JWT_EXPIRE_MINUTES=480
DEV_CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEV_PAYMENT_PROVIDER=razorpay
DEV_RAZORPAY_KEY_ID=rzp_test_xxxx
DEV_RAZORPAY_KEY_SECRET=test-secret
# Only needed if switching DEV_PAYMENT_PROVIDER=phonepay:
DEV_PHONEPE_MERCHANT_ID=MERCHANTUAT
DEV_PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
DEV_PHONEPE_SALT_KEY=your-sandbox-salt-key
DEV_PHONEPE_SALT_INDEX=1
DEV_EMAIL_MOCK=false
DEV_SMTP_HOST=smtp.gmail.com
DEV_SMTP_PORT=587
DEV_SMTP_USER=restaurant.dev@gmail.com
DEV_SMTP_PASSWORD=your-16-char-app-password
DEV_SMTP_SENDER=restaurant.dev@gmail.com
DEV_AUTH_RATE_LIMIT=5/min
# Image storage (Section 9A). local = offline fallback; s3 = real bucket.
DEV_STORAGE_DRIVER=local
DEV_UPLOAD_DIR=./uploads
DEV_UPLOAD_MAX_SIZE_MB=5
DEV_UPLOAD_ALLOWED_TYPES=jpeg,png,webp
DEV_S3_BUCKET=soroco-food-images
DEV_S3_REGION=ap-south-1
DEV_S3_ACCESS_KEY_ID=
DEV_S3_SECRET_ACCESS_KEY=
DEV_S3_CDN_URL=
```

### 10.3 Frontend `.env` (React/Vite)

**Note on naming:** Vite only exposes env vars starting with `VITE_` to the browser, so frontend keys keep the `VITE_` prefix (a plain `DEV_` key would be invisible to React). The file `.env.development` itself marks these as dev-only.

| Variable | Example | Purpose |
|---|---|---|
| `VITE_APP_NAME` | `restaurant-order-management` | Brand name shown in UI |
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | REST API base (no trailing slash). Already contains the `/api/v1` prefix, so frontend code only writes short paths like `/menu`, `/payment` |
| `VITE_WS_BASE_URL` | `ws://localhost:8000/api/v1` | WebSocket base (same backend). Connect to e.g. `ws://localhost:8000/api/v1/ws/menu` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_test_xxxx` | Razorpay checkout key id (client-side) — same test key as backend |
| `VITE_PAYMENT_METHODS` | `phonepay,razorpay` | Which methods to render in the cart (comma-separated) |
| `VITE_IMAGE_BASE_URL` | `http://localhost:8000` | **Origin** that serves food images at `/images/...`. Dev: the FastAPI backend (mount `/images`) → `http://localhost:8000`. Prod: your CloudFront/S3 origin, e.g. `https://dxxxx.cloudfront.net` (no trailing slash), or empty `""` when a reverse proxy serves `/images` same-origin. The frontend helper joins `VITE_IMAGE_BASE_URL + image_url` for **relative** paths (e.g. `/images/hazelnut-latte-x9f2.webp`) and uses any **absolute** (`http/https`) `image_url` as-is. Never hardcode full URLs in components — always go through the image URL helper (see the frontend prompt). |

```dotenv
# frontend/.env.development sample
VITE_APP_NAME=restaurant-order-management
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_BASE_URL=ws://localhost:8000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_xxxx
VITE_PAYMENT_METHODS=phonepay,razorpay
# Local dev: backend serves /images/... on this origin.
# Prod: set to your S3/CloudFront origin (or empty "" behind a same-origin proxy).
VITE_IMAGE_BASE_URL=http://localhost:8000
```

> **Rules:** never commit real secrets (`.env` in `.gitignore`, provide `.env.example` files). All backend keys carry the `DEV_` prefix because they are dev/sandbox-only — sandbox payment keys and the free SMTP credentials must never be used in production. Keep the same `RAZORPAY_KEY_ID` client & server-side; PhonePe is entirely server-side so no PhonePe keys appear in the frontend.

---

## 11. Role & Permission Rules (recap / non-negotiable)

1. `/orders` → JWT with role `employee` or `admin`, else login.
2. `/admin*` + `/order-history` → **admin only**. Employee sees "Unauthorized" and stays.
3. /menu staff controls → token re-validated on every backend call.
4. No customer accounts. Customer identity only via the pay-time form.
5. `kitchen_status`, `order_status`, and menu `is_available` **ARE persisted** to the DB (written via their PATCH endpoints) — do not keep them UI-only.
6. Order total/unit prices are computed server-side at payment success.
7. Payment sandbox only — never switch to live keys in this build.
8. `/auth/login` + `/auth/signup` are rate-limited (slowapi) to prevent brute force.
9. **DB:** SQLite for dev (`sqlite:///./data/restaurant.db`). Concurrency is acceptable for the demo; if we later switch to Postgres the DSN in `.env` changes only. (On capacity we can enable SQLite WAL mode if "database is locked" errors appear.) **AWS RDS PostgreSQL:** optional — `RDS-SETUP-GUIDE.md` (repo root) has the console walkthrough + the `postgresql+psycopg2://` URL to paste into `DEV_DATABASE_URL` (add `psycopg2-binary` to `requirements.txt` when using Postgres).
10. **JWT lifetime:** fixed `DEV_JWT_EXPIRE_MINUTES=480` (8h staff shift). No refresh-token rotation for now; a staff member re-logs in after expiry. Revisit if production needs longer-lived sessions.
11. **Uploads (Section 9A):** `POST /api/v1/uploads` is protected (employee/admin) and re-validated server-side; type/size always validated; filenames are backend-generated slugs, never raw client values.

---

## 12. Definition of Done / Acceptance Checks

- [ ] Customer browses `/menu`, + /− works locally, cart bar shows count + total.
- [ ] `/cart` shows items, total, PhonePe/Razorpay selection; Pay asks table/name/phone.
- [ ] Sandbox payment: success lands the order + email; cancel/fail returns friendly error with cart intact and **no DB order**.
- [ ] `/orders` blocks unauthenticated → `/login`; login returns JWT with role; kitchen stream is live and FIFO; status buttons cycle In-Queue → Preparing → Prepared **and persist across page refresh / server restart**; marking Delivered moves the order to completed.
- [ ] Staff menu controls add/remove/availability update over WS for all connected menu viewers and **persist `is_available` so a server restart keeps items unavailable**; backend rejects these without a valid token.
- [ ] Menu items with a NULL `image_url` render the branded placeholder; setting `image_url` later shows the real image.
- [ ] Staff can upload a photo in the Add/Edit item modal: `POST /api/v1/uploads` validates type/size, stores it (S3 or local fallback), and the returned `image_url` is written to the item; the image is then served (dev `/images/...` or S3/CDN URL) and survives reload.
- [ ] Food images load fast: `loading="lazy"` + `decoding="async"` + `aspect-[4/3]` placeholder (no layout shift), and uploaded objects carry `Cache-Control: public, max-age=31536000, immutable`.
- [ ] `/auth/login` and `/auth/signup` return 429 after too many attempts in a short window.
- [ ] `/admin` allows admin; employee gets "Unauthorized", persists on page.
- [ ] Admin can create employee (email-only) then that email can complete `/signup` and log in.
- [ ] Admin can delete employee after confirm dialog.
- [ ] `/order-history` filters today/yesterday/custom **+ order status (`ordered`/`delivered`)** and exports CSV with the same filters applied.
- [ ] UI mirrors the soroco.coffee warm, minimalist style (mobile-first).
- [ ] Backend tests + `ruff` clean; frontend `lint` clean.