"""Payment DTOs — single POST /payment (mock gateway for now)."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

from src.repositories.schema.enums import PaymentMethod, SelectedSize


class PaymentItem(BaseModel):
    menu_uuid: str
    quantity: int = Field(ge=1)
    selected_size: SelectedSize | None = None


class PaymentRequest(BaseModel):
    """Gateway result posted by the frontend / redirect callback.

    `gateway_status` in {"success","failed","cancelled"}. While the gateway
    is mocked, this is the decision input; real clients verify it server-side.
    """

    order_ref: str = Field(min_length=1, max_length=255)
    gateway_status: Literal["success", "failed", "cancelled"]
    payment_method: PaymentMethod = PaymentMethod.RAZORPAY
    transaction_id: str | None = None
    table_name: str
    customer_name: str
    phone_number: str = ""
    customer_email: str
    items: list[PaymentItem] = Field(min_length=1)

    @field_validator("phone_number")
    @classmethod
    def phone_optional(cls, v: str) -> str:
        if not v.strip():
            return ""
        digits = "".join(ch for ch in v if ch.isdigit())
        if len(digits) < 10:
            raise ValueError("Enter a valid phone number (10 digits)")
        return v

    @field_validator("customer_email")
    @classmethod
    def email_required(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Email is required")
        if "@" not in v:
            raise ValueError("Enter a valid email address")
        return v


class PaymentSuccess(BaseModel):
    status: Literal["success"] = "success"
    order_number: int
    total: float


class PaymentFailure(BaseModel):
    status: Literal["failed", "cancelled"]
    message: str