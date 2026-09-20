"""Order orchestration — kitchen board + status PATCH + history."""

from datetime import datetime

from sqlalchemy.orm import Session

from src.repositories import MenuRepository, OrderRepository
from src.repositories.schema import KitchenStatus, Order, OrderStatus
from src.utils.exceptions import NotFoundError


def _enum_str(value) -> str | None:
    return value.value if value is not None else None


def serialize_order(db: Session, order: Order) -> dict:
    names = {str(m.menu_uuid): m.item_name for m in MenuRepository.list_all(db)}
    items = [
        {
            "menu_uuid": str(oi.menu_uuid),
            "item_name": names.get(str(oi.menu_uuid)),
            "selected_size": _enum_str(oi.selected_size),
            "quantity": oi.quantity,
            "unit_price": float(oi.unit_price),
            "line_total": float(oi.line_total),
        }
        for oi in order.items
    ]
    return {
        "order_uuid": str(order.order_uuid),
        "order_id": order.order_id,
        "order_number": order.order_number,
        "table_name": order.table_name,
        "customer_name": order.customer_name,
        "phone_number": order.phone_number,
        "payment_method": _enum_str(order.payment_method),
        "payment_status": _enum_str(order.payment_status),
        "payment_transaction_id": order.payment_transaction_id,
        "kitchen_status": _enum_str(order.kitchen_status),
        "order_status": _enum_str(order.order_status),
        "total_price": float(order.total_price),
        "subtotal": round(float(order.total_price) - float(order.tax), 2),
        "tax": float(order.tax),
        "created_at": order.created_at.isoformat(),
        "items": items,
    }


def list_kitchen(db: Session) -> list[dict]:
    return [serialize_order(db, o) for o in OrderRepository.list_kitchen(db)]


def patch_order(
    db: Session,
    order_uuid: str,
    kitchen_status: KitchenStatus | None = None,
    order_status: OrderStatus | None = None,
) -> dict:
    order = OrderRepository.get_by_uuid(db, order_uuid)
    if order is None:
        raise NotFoundError("Order not found")
    order = OrderRepository.patch_statuses(
        db, order, kitchen_status=kitchen_status, order_status=order_status
    )
    db.commit()
    db.refresh(order)
    return serialize_order(db, order)


def history(
    db: Session,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    order_status: OrderStatus | None = None,
) -> list[dict]:
    orders = OrderRepository.history(db, from_date, to_date, order_status)
    return [serialize_order(db, o) for o in orders]
