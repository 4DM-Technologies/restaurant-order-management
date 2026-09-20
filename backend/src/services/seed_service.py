"""Idempotent seed loader — backfills from backend/seed_data/*.json.

Run via `python -m src.seed` (from the backend/ directory). Safe to repeat.
"""

import json
import pathlib
import uuid
from datetime import datetime

from sqlalchemy import func, inspect, select, text

from src.database import Base, SessionLocal, engine
from src.repositories import AccountRepository, MenuRepository
from src.repositories.schema import (
    AccountRole,
    KitchenStatus,
    Order,
    OrderItem,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    SelectedSize,
)
from src.services.auth_service import hash_password

DATA_DIR = pathlib.Path(__file__).resolve().parent.parent.parent / "seed_data"


def _load(name: str):
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


def seed_menu(db) -> tuple[int, int]:
    """Upsert menu items by menu_id. Returns (created, updated)."""
    created = updated = 0
    for row in _load("menu_items.json"):
        data = {
            "category": row["category"],
            "name": row["item_name"],
            "description": row.get("item_description"),
            "standard_price": row.get("standard_price"),
            "small_price": row.get("small_price"),
            "large_price": row.get("large_price"),
            "image_url": row.get("image_url"),
            "is_available": row.get("is_available", True),
        }
        existing = MenuRepository.get_by_menu_id(db, row["menu_id"])
        if existing is None:
            data["created_by"] = "SEED"
            MenuRepository.create(db, data)
            created += 1
        else:
            data["updated_by"] = "SEED"
            MenuRepository.patch(db, existing, data)
            updated += 1
    return created, updated


def seed_accounts(db) -> tuple[int, int]:
    """Upsert staff accounts by email; set password only when provided + unset."""
    created = updated = 0
    for row in _load("accounts.json"):
        password = hash_password(row["password"]) if row.get("password") else None
        account = AccountRepository.get_by_email(db, row["email"])
        if account is None:
            account = AccountRepository.create(
                db,
                row["name"],
                row["email"],
                AccountRole(row["role"]),
                created_by="SEED",
            )
            account.account_password = password
            db.flush()
            created += 1
        elif password is not None and account.account_password is None:
            account.account_password = password
            db.flush()
            updated += 1
    return created, updated


def seed_orders(db) -> int:
    """Insert demo orders + items once (skips existing order numbers)."""
    payload = _load("orders.json")
    items_by_number = _load("order_items.json")
    menu_uuid_by_id = {
        row["menu_id"]: MenuRepository.get_by_menu_id(db, row["menu_id"]).menu_uuid
        for row in _load("menu_items.json")
    }
    created = 0
    last_order_id = int(db.scalar(select(func.max(Order.order_id))) or 0)
    last_item_id = int(db.scalar(select(func.max(OrderItem.order_item_id))) or 0)
    for row in payload["orders"]:
        number = int(row["order_number"])
        exists = db.scalar(select(Order).where(Order.order_number == number))
        if exists:
            continue
        last_order_id += 1
        order = Order(
            order_uuid=uuid.uuid4(),
            order_id=last_order_id,
            order_number=number,
            order_ref=row.get("order_ref"),
            table_name=row["table_name"],
            customer_name=row["customer_name"],
            phone_number=row["phone_number"],
            payment_method=PaymentMethod(row["payment_method"]),
            payment_status=PaymentStatus(row["payment_status"]),
            payment_transaction_id=row.get("payment_transaction_id"),
            kitchen_status=KitchenStatus(row["kitchen_status"]),
            order_status=OrderStatus(row["order_status"]),
            total_price=float(row["total_price"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            created_by="SEED",
        )
        db.add(order)
        db.flush()
        for it in items_by_number.get(str(number), []):
            last_item_id += 1
            db.add(
                OrderItem(
                    order_item_uuid=uuid.uuid4(),
                    order_item_id=last_item_id,
                    order_uuid=order.order_uuid,
                    menu_uuid=menu_uuid_by_id[it["menu_id"]],
                    selected_size=SelectedSize(it["selected_size"])
                    if it.get("selected_size")
                    else None,
                    quantity=it["quantity"],
                    unit_price=it["unit_price"],
                    line_total=it["line_total"],
                )
            )
        db.flush()
        created += 1
    return created


def _ensure_orders_tax_column() -> None:
    """Backfill the `tax` column on pre-existing DBs (no Alembic in this repo)."""
    inspector = inspect(engine)
    if not inspector.has_table("orders"):
        return
    columns = {col["name"] for col in inspector.get_columns("orders")}
    if "tax" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "ALTER TABLE orders "
                    "ADD COLUMN tax NUMERIC(10, 2) NOT NULL DEFAULT 0"
                )
            )


def seed_all() -> dict:
    Base.metadata.create_all(bind=engine)
    _ensure_orders_tax_column()
    with SessionLocal() as db:
        menu_created, menu_updated = seed_menu(db)
        accounts_created, accounts_updated = seed_accounts(db)
        orders_created = seed_orders(db)
        db.commit()
        return {
            "menu": {"created": menu_created, "updated": menu_updated},
            "accounts": {"created": accounts_created, "updated": accounts_updated},
            "orders_created": orders_created,
        }
