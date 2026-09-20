"""Portable ENUM values (native_enum=False -> VARCHAR on every DB)."""

import enum


class AccountRole(str, enum.Enum):
    EMPLOYEE = "employee"
    ADMIN = "admin"


class PaymentMethod(str, enum.Enum):
    PHONEPAY = "phonepay"
    RAZORPAY = "razorpay"


class PaymentStatus(str, enum.Enum):
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class KitchenStatus(str, enum.Enum):
    IN_QUEUE = "in_queue"
    PREPARING = "preparing"
    PREPARED = "prepared"
    DELIVERED = "delivered"


class OrderStatus(str, enum.Enum):
    ORDERED = "ordered"
    DELIVERED = "delivered"


class SelectedSize(str, enum.Enum):
    STANDARD = "standard"
    SMALL = "small"
    LARGE = "large"


def enum_values(enum_class: type[enum.Enum]) -> list[str]:
    """Store enum .value strings in the DB (portable across SQLite/Postgres)."""
    return [member.value for member in enum_class]