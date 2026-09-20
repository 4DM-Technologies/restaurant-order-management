"""Orders data access (kitchen + history + line items)."""

import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from src.repositories.schema import (
    KitchenStatus,
    Order,
    OrderItem,
    OrderStatus,
    PaymentStatus,
)


class OrderRepository:
    @staticmethod
    def _next(db: Session, column) -> int:
        current = db.scalar(select(func.max(column))) or 0
        return int(current) + 1

    @staticmethod
    def next_order_id(db: Session) -> int:
        return OrderRepository._next(db, Order.order_id)

    @staticmethod
    def next_order_number(db: Session) -> int:
        return OrderRepository._next(db, Order.order_number)

    @staticmethod
    def next_item_id(db: Session) -> int:
        return OrderRepository._next(db, OrderItem.order_item_id)

    @staticmethod
    def get_by_uuid(db: Session, order_uuid: str) -> Order | None:
        try:
            return db.scalar(
                select(Order)
                .where(Order.order_uuid == uuid.UUID(order_uuid))
                .options(selectinload(Order.items))
            )
        except ValueError:
            return None

    @staticmethod
    def get_by_order_ref(db: Session, order_ref: str) -> Order | None:
        return db.scalar(
            select(Order)
            .where(Order.order_ref == order_ref)
            .options(selectinload(Order.items))
        )

    @staticmethod
    def list_kitchen(db: Session) -> list[Order]:
        """FIFO — oldest first, most essential for the kitchen board."""
        return list(
            db.scalars(
                select(Order)
                .options(selectinload(Order.items))
                .order_by(Order.created_at.asc())
            ).all()
        )

    @staticmethod
    def history(
        db: Session,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
        order_status: OrderStatus | None = None,
    ) -> list[Order]:
        stmt = select(Order).options(selectinload(Order.items))
        if from_date is not None:
            stmt = stmt.where(Order.created_at >= from_date)
        if to_date is not None:
            stmt = stmt.where(Order.created_at <= to_date)
        if order_status is not None:
            stmt = stmt.where(Order.order_status == order_status)
        return list(db.scalars(stmt.order_by(Order.created_at.desc())).all())

    @staticmethod
    def create(
        db: Session,
        *,
        order_ref: str,
        table_name: str,
        customer_name: str,
        phone_number: str,
        payment_method,
        payment_transaction_id: str | None,
        total_price: float,
        tax: float = 0.0,
    ) -> Order:
        order = Order(
            order_uuid=uuid.uuid4(),
            order_id=OrderRepository.next_order_id(db),
            order_number=OrderRepository.next_order_number(db),
            order_ref=order_ref,
            table_name=table_name,
            customer_name=customer_name,
            phone_number=phone_number,
            payment_method=payment_method,
            payment_status=PaymentStatus.SUCCESS,
            payment_transaction_id=payment_transaction_id,
            kitchen_status=KitchenStatus.IN_QUEUE,
            order_status=OrderStatus.ORDERED,
            total_price=total_price,
            tax=tax,
            created_by="SYSTEM",
        )
        db.add(order)
        db.flush()
        return order

    @staticmethod
    def add_items(db: Session, order: Order, item_rows: list[dict]) -> list[OrderItem]:
        items: list[OrderItem] = []
        next_id = OrderRepository.next_item_id(db)
        for row in item_rows:
            item = OrderItem(
                order_item_uuid=uuid.uuid4(),
                order_item_id=next_id,
                order_uuid=order.order_uuid,
                menu_uuid=uuid.UUID(row["menu_uuid"]),
                selected_size=row.get("selected_size"),
                quantity=row["quantity"],
                unit_price=row["unit_price"],
                line_total=row["line_total"],
            )
            db.add(item)
            items.append(item)
            next_id += 1
        db.flush()
        return items

    @staticmethod
    def patch_statuses(
        db: Session, order: Order, kitchen_status=None, order_status=None, updated_by="SYSTEM"
    ) -> Order:
        if kitchen_status is not None:
            order.kitchen_status = kitchen_status
        if order_status is not None:
            order.order_status = order_status
        order.updated_by = updated_by
        db.flush()
        return order