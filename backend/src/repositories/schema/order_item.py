"""`order_items` — line items (price snapshot at order time)."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, Numeric, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base
from src.repositories.schema.enums import SelectedSize, enum_values

if TYPE_CHECKING:
    from src.repositories.schema.menu_item import MenuItem
    from src.repositories.schema.order import Order


class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_uuid: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    order_item_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    order_uuid: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("orders.order_uuid", ondelete="CASCADE"), nullable=False
    )
    menu_uuid: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("menu.menu_uuid"), nullable=False
    )
    selected_size: Mapped[SelectedSize | None] = mapped_column(
        Enum(SelectedSize, native_enum=False, length=20, values_callable=enum_values),
        nullable=True,
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    line_total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped["Order"] = relationship(back_populates="items")
    menu_item: Mapped["MenuItem"] = relationship()