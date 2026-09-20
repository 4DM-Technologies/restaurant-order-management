"""`accounts` — staff only (no customer accounts)."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import Enum, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base
from src.repositories.schema.enums import AccountRole, enum_values


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Account(Base):
    __tablename__ = "accounts"

    account_uuid: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    account_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    account_name: Mapped[str] = mapped_column(String(255), nullable=False)
    account_email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    account_password: Mapped[str | None] = mapped_column(Text, nullable=True)
    account_role: Mapped[AccountRole] = mapped_column(
        Enum(AccountRole, native_enum=False, length=20, values_callable=enum_values),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=_utcnow)
    created_by: Mapped[str] = mapped_column(String(255), nullable=False, default="SYSTEM")
    updated_at: Mapped[datetime | None] = mapped_column(nullable=True, onupdate=_utcnow)
    updated_by: Mapped[str | None] = mapped_column(String(255), nullable=True)