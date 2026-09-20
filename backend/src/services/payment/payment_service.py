"""Payment orchestration — MOCK gateway for now.

Real gateway verification (PhonePe checksum / Razorpay server-side) is a later
feature — see `define/PAYMENT-INTEGRATION-NEXT.md`. The endpoint behavior here
matches the spec: success inserts orders + order_items (server-priced snapshot),
emails the bill and is idempotent on `order_ref`; failed/cancelled create no rows.
"""

from dataclasses import dataclass

from sqlalchemy.orm import Session

from src.models.payment_schema import PaymentRequest
from src.repositories import MenuRepository, OrderRepository
from src.repositories.schema.enums import SelectedSize
from src.services import email_service
from src.services.order_service import serialize_order
from src.utils.exceptions import ValidationFailure
from src.utils.logger import logger

_SIZE_COL = {
    SelectedSize.SMALL: "small_price",
    SelectedSize.LARGE: "large_price",
}

TAX_RATE = 0.05  # GST — kept in sync with the frontend constant.


@dataclass
class PaymentResult:
    success: bool
    status: str
    order_number: int | None = None
    total: float | None = None
    message: str | None = None
    order: dict | None = None


def _resolve_unit_price(menu_item, size: SelectedSize | None) -> float:
    if size in _SIZE_COL:
        priced = getattr(menu_item, _SIZE_COL[size])
        if priced is not None:
            return float(priced)
    if menu_item.standard_price is None:
        raise ValidationFailure(
            f"Menu item '{menu_item.item_name}' has no price for the selected size"
        )
    return float(menu_item.standard_price)


def process_payment(db: Session, payload: PaymentRequest) -> PaymentResult:
    logger.info(
        "Payment received: order_ref=%s gateway_status=%s method=%s",
        payload.order_ref,
        payload.gateway_status,
        payload.payment_method.value,
    )
    if payload.gateway_status in ("failed", "cancelled"):
        logger.info(
            "Payment %s for order_ref=%s — no order created",
            payload.gateway_status,
            payload.order_ref,
        )
        return PaymentResult(
            success=False,
            status=payload.gateway_status,
            message="Payment failed/cancelled, nothing was charged",
        )

    existing = OrderRepository.get_by_order_ref(db, payload.order_ref)
    if existing is not None and existing.payment_status.value == "success":
        logger.info("Idempotent hit for order_ref=%s", payload.order_ref)
        return PaymentResult(
            success=True,
            status="success",
            order_number=existing.order_number,
            total=float(existing.total_price),
            order=serialize_order(db, existing),
        )

    rows: list[dict] = []
    item_details: list[dict] = []
    subtotal = 0.0
    for it in payload.items:
        menu_item = MenuRepository.get_by_uuid(db, it.menu_uuid)
        if menu_item is None:
            raise ValidationFailure(
                f"Menu item {it.menu_uuid} is no longer on the menu"
            )
        unit_price = _resolve_unit_price(menu_item, it.selected_size)
        line_total = round(unit_price * it.quantity, 2)
        subtotal += line_total
        size_name = _enum_val(it.selected_size)
        rows.append(
            {
                "menu_uuid": it.menu_uuid,
                "selected_size": it.selected_size,
                "quantity": it.quantity,
                "unit_price": unit_price,
                "line_total": line_total,
            }
        )
        item_details.append(
            {
                "item_name": menu_item.item_name,
                "selected_size": size_name,
                "quantity": it.quantity,
                "line_total": line_total,
            }
        )

    subtotal = round(subtotal, 2)
    tax = round(subtotal * TAX_RATE, 2)
    total = round(subtotal + tax, 2)
    order = OrderRepository.create(
        db,
        order_ref=payload.order_ref,
        table_name=payload.table_name,
        customer_name=payload.customer_name,
        phone_number=payload.phone_number,
        payment_method=payload.payment_method,
        payment_transaction_id=payload.transaction_id,
        total_price=total,
        tax=tax,
    )
    OrderRepository.add_items(db, order, rows)
    db.commit()
    db.refresh(order)
    logger.info(
        "Order created: order_ref=%s order_number=%s total=%s items=%d",
        payload.order_ref,
        order.order_number,
        total,
        len(rows),
    )

    if payload.customer_email:
        email_service.send_bill(
            payload.customer_email,
            order_number=order.order_number,
            items=item_details,
            subtotal=float(subtotal),
            tax=float(tax),
            total=float(order.total_price),
            payment_method=payload.payment_method.value,
            table_name=payload.table_name,
            customer_name=payload.customer_name,
        )

    return PaymentResult(
        success=True,
        status="success",
        order_number=order.order_number,
        total=float(order.total_price),
        order=serialize_order(db, order),
    )


def _enum_val(value) -> str | None:
    return value.value if value is not None else None