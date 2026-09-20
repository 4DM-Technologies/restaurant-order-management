"""Razorpay client — STUB. Real test-mode integration is a later feature.

Implement when DEV_PAYMENT_PROVIDER=razorpay:
  - verify_payment(order_id) server-side using DEV_RAZORPAY_KEY_ID/SECRET.
See define/PAYMENT-INTEGRATION-NEXT.md.
"""


class RazorpayClient:  # pragma: no cover - placeholder for next feature
    def verify_payment(self, **_kwargs) -> bool:
        raise NotImplementedError(
            "Razorpay test-mode integration not built yet (see define/PAYMENT-INTEGRATION-NEXT.md)"
        )
