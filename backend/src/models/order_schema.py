"""Order DTOs — kitchen board, PATCH, history."""

from pydantic import BaseModel, ConfigDict, model_validator

from src.repositories.schema.enums import (
    KitchenStatus,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    menu_uuid: str
    item_name: str | None = None
    selected_size: str | None = None
    quantity: int
    unit_price: float
    line_total: float


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_uuid: str
    order_id: int
    order_number: int
    table_name: str
    customer_name: str
    phone_number: str
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    payment_transaction_id: str | None = None
    kitchen_status: KitchenStatus
    order_status: OrderStatus
    total_price: float
    created_at: str
    items: list[OrderItemOut] = []


class OrderPatch(BaseModel):
    kitchen_status: KitchenStatus | None = None
    order_status: OrderStatus | None = None

    @model_validator(mode="after")
    def at_least_one(self) -> "OrderPatch":
        if self.kitchen_status is None and self.order_status is None:
            raise ValueError("Provide kitchen_status or order_status")
        return self