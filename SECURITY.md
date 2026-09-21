# Security

Current status of the Soroco House app (dev sandbox). This documents both the
hardening applied and the known limitations that are intentionally accepted.

## Hardening applied

- **No SQL injection** — all queries use SQLAlchemy bound parameters.
- **No XSS sinks** — React escapes all rendered data; no `dangerouslySetInnerHTML`
  / `innerHTML` / `eval` anywhere in the frontend; bill email HTML is fully
  escaped server-side.
- **Token tampering** — JWTs are HS256 with `algorithms=["HS256"]` and the role is
  re-checked against the database on every protected call (never trusted from
  the token payload).
- **Server-side pricing** — checkout totals are recomputed from the menu table;
  the client cannot set prices.
- **Role enforcement** — admin/employee/staff gates enforced on the API; the
  client-side UI gating is only cosmetic.
- **Upload safety** — images must decode via Pillow, are capped in byte size and
  decoded dimensions (guards decompression bombs), and are re-encoded to 640px
  WebP so embedded payloads are stripped.
- **No SSRF** — nothing fetches attacker-supplied URLs; S3 serving uses a fixed
  bucket and a strict `<slug>-<hex>.webp` key pattern.
- **Menu `image_url` allow-list** — only app-served paths (`/images/..`,
  `/api/v1/images/..`), the S3 CDN origin, or `https://` hosts in
  `DEV_IMAGE_URL_HOSTS` (default `images.unsplash.com`) are accepted.
- **Payment idempotency without PII** — re-posted `order_ref` responses return
  only status/order number/total; stored customer details are never echoed to a
  caller who did not create the order.
- **Email/phone validation** — CR/LF header injection rejected; phone normalized
  to digits.
- **CSV formula injection** — leading `= + - @` in exported cells are neutralized
  (backend and frontend exports).
- **Security headers** — `X-Content-Type-Options: nosniff`, `X-Frame-Options:
  DENY`, `Referrer-Policy: no-referrer` on API responses and the static host.
- **Rate limiting** — slowapi on login/signup/check, uploads, and payments.

## Accepted risks (dev sandbox, revisit before production)

- **Plaintext HTTP / WS** — the frontend is served over `http://`/`ws://` (public
  IP, port 8000/3000). Terminate TLS and build against `https://`/`wss://`
  before production.
- **JWT + profile in localStorage** — tokens live in `localStorage`
  (`soroco_access_token` / `soroco_user`), so any future XSS would enable
  account takeover. Safe today only because there are no XSS sinks. Prefer
  HttpOnly cookies if the surface grows.
- **Kitchen WebSocket token in query string** — `ws://...?token=<jwt>` can leak
  into proxy/access logs. Switch to a `Sec-WebSocket-Protocol` header or a
  one-time ticket before production.
- **`/auth/check` reveals `has_password`** — enables staff-email enumeration and
  activation-state disclosure; rate-limited to 5/min and acceptable while signup
  is admin-invite only.
- **Mock payment** — `gateway_status` is decided client-side; card details are
  demo-only (never transmitted). Real gateways must verify server-side.
- **`/docs` public** — Swagger UI is exposed; fine for a dev box, disable behind
  auth before production.
- **Hardcoded seed credentials** — `frontend/.env.example` ships demo email /
  password values; only for first-run setup on the sandbox.

## Operations notes

- `DEV_JWT_SECRET_KEY` must not remain the `change-me-strong-secret` default.
- If a private S3 bucket stores images, keep Block Public Access on and serve via
  `/api/v1/images/...`.