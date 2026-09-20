"""Payment services (mock gateway adapter for now)."""

from src.services.payment.payment_service import PaymentResult, process_payment

__all__ = ["PaymentResult", "process_payment"]
