# Payment Integration — NEXT FEATURE

This hand-off doc describes exactly what to build to replace the current
**mock payment** with a real sandbox gateway.

## Current state (working, do not break)

- `POST /api/v1/payments` (see `src/routes/payment_router.py`) accepts a
  `PaymentRequest` and — while `DEV_PAYMENT_PROVIDER=mock` — treats its
  `gateway_status` (`success | failed | cancelled`) as the payment decision.
- On `success` it inserts `orders` + `order_items` with **server-priced snapshots**
  (price resolved by `selected_size`, see `src/services/payment/payment_service.py`),
  marks payment `success`, emails the bill (`src/services/email_service.py`) and
  broadcasts `{type: "orders_updated"}` over the kitchen WebSocket.
- Idempotency: `orders.order_ref` (client-generated UUID) is a unique key; a repeat
  POST with the same `order_ref` returns the existing order instead of a duplicate.
- Failed/cancelled requests create **no** DB rows and return
  `{payment_status: "failed"|"cancelled", message}`.
- Stubs exist: `src/services/payment/phonepay_client.py`, `src/services/payment/razorpay_client.py`.

## What to do next

1. **Get sandbox credentials** (choose one provider, then the other later):
   - PhonePe UAT: merchant id (`MERCHANTUAT`), salt key, salt index, plus the UAT
     PG redirect flow (phonepe test app / QR). API base:
     `https://api-preprod.phonepe.com/apis/pg-sandbox`.
   - Razorpay test mode: `rzp_test_*` key id + secret, webhook secret.
2. **Add env vars** to `.env` (backend) and `.env.example`:
   `DEV_PAYMENT_PROVIDER=phonepay` (or `razorpay`), `DEV_PHONEPAY_SALT_KEY=…`,
   `DEV_PHONEPAY_SALT_INDEX=1`, `DEV_RAZORPAY_KEY_SECRET=…`, `DEV_RAZORPAY_KEY_ID=…`.
   Also expose `VITE_RAZORPAY_KEY_ID` (frontend test key) in the frontend env.
3. **Implement the client stub** matching the active provider:
   - PhonePe: create checksum `SHA512(base64(payload) + salt_key) + "###" + salt_index`
     → call PG "Create Payment"; return `redirect_url`. Callback handler must verify
     the `x-verify` header the same way and only then accept.
   - Razorpay: set up `orders` (Razorpay Payment Link/Order), server-side verify payment
     capture using SDK/secret, rely on webhooks with webhook-secret verification.
4. **Re-wire `POST /api/v1/payments`**: the frontend posts (a) checkout-intent first?
   (b) the final verified payment. Keep `order_ref` idempotency and the existing
   order-insert + billing email + WS broadcast behavior unchanged.

## Frontend expectations (already built)

- `PaymentScreen.vm.ts` builds a `PaymentRequest` with `order_ref`,
  `gateway_status`, items `[{menu_uuid, quantity, selected_size}]`, customer info
  and table name, then POSTs to `/api/v1/payments`.
- Keep the mock flow working as-is when `DEV_PAYMENT_PROVIDER=mock` — tests depend on it.

## Definition of done

- Sandbox payment completes end-to-end (redirect → success → order appears on the
  kitchen board with correct total; bill email received).
- `verify_callback` rejects forged requests (`FORGED_CALLBACK`, 400).
- Failed/cancelled payments never create orders and the UI shows the failure state.
- Backed by pytest tests using an isolated DB (never RDS), `DEV_PAYMENT_PROVIDER=mock`
  is still the default for CI.