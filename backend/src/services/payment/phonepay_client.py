"""PhonePe client — STUB. Real sandbox integration is a later feature.

Implement when DEV_PAYMENT_PROVIDER=phonepay:
  - create_payment_session(...) -> redirect_url via PG Create Payment API
  - verify_callback(response_b64, x_verify_header) -> bool using the
    SHA512(decoded + DEV_PHONEPE_SALT_KEY) + "###" + salt_index checksum.
See define/PAYMENT-INTEGRATION-NEXT.md.
"""


class PhonePeClient:  # pragma: no cover - placeholder for next feature
    def create_session(self, **_kwargs) -> dict:
        raise NotImplementedError(
            "PhonePe sandbox integration not built yet (see define/PAYMENT-INTEGRATION-NEXT.md)"
        )

    def verify_callback(self, _response_b64: str, _x_verify: str) -> bool:
        raise NotImplementedError(
            "PhonePe sandbox integration not built yet (see define/PAYMENT-INTEGRATION-NEXT.md)"
        )
