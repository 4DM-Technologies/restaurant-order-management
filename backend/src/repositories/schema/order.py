"""`orders` — transaction header (customer-facing order)."""

import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Enum, Integer, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base
from src.repositories.schema.enums import (
    KitchenStatus,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    enum_values,
)

if TYPE_CHECKING:
    from src.repositories.schema.order_item import OrderItem


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Order(Base):
    __tablename__ = "orders"

    order_uuid: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    order_number: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    # Client-generated payment reference -> idempotency key (avoids double insert).
    order_ref: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )
    table_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(50), nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, native_enum=False, length=20, values_callable=enum_values),
        nullable=False,
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, native_enum=False, length=20, values_callable=enum_values),
        nullable=False,
    )
    payment_transaction_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    kitchen_status: Mapped[KitchenStatus] = mapped_column(
        Enum(KitchenStatus, native_enum=False, length=20, values_callable=enum_values),
        nullable=False,
        default=KitchenStatus.IN_QUEUE,
    )
    order_status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, native_enum=False, length=20, values_callable=enum_values),
        nullable=False,
        default=OrderStatus.ORDERED,
    )
    total_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    tax: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_utcnow)
    created_by: Mapped[str] = mapped_column(
        String(255), nullable=False, default="SYSTEM"
    )
    updated_at: Mapped[datetime | None] = mapped_column(nullable=True, onupdate=_utcnow)
    updated_by: Mapped[str | None] = mapped_column(String(255), nullable=True)

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
