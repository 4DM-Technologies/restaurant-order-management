"""`menu` — items grouped by category string."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base


def _utcnow() -> datetime:
    return datetime.now(UTC)


class MenuItem(Base):
    __tablename__ = "menu"

    menu_uuid: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    menu_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    item_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    standard_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    small_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    large_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_utcnow)
    created_by: Mapped[str] = mapped_column(
        String(255), nullable=False, default="SYSTEM"
    )
    updated_at: Mapped[datetime | None] = mapped_column(nullable=True, onupdate=_utcnow)
    updated_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
