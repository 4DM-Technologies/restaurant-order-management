"""Menu data access."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.repositories.schema import MenuItem


class MenuRepository:
    @staticmethod
    def next_id(db: Session) -> int:
        current = db.scalar(select(func.max(MenuItem.menu_id))) or 0
        return int(current) + 1

    @staticmethod
    def list_all(db: Session) -> list[MenuItem]:
        return list(db.scalars(select(MenuItem).order_by(MenuItem.menu_id.asc())).all())

    @staticmethod
    def get_by_uuid(db: Session, menu_uuid: str) -> MenuItem | None:
        try:
            return db.get(MenuItem, uuid.UUID(menu_uuid))
        except ValueError:
            return None

    @staticmethod
    def get_by_menu_id(db: Session, menu_id: int) -> MenuItem | None:
        return db.scalar(select(MenuItem).where(MenuItem.menu_id == menu_id))

    @staticmethod
    def create(db: Session, data: dict) -> MenuItem:
        item = MenuItem(
            menu_uuid=uuid.uuid4(),
            menu_id=MenuRepository.next_id(db),
            category=data["category"],
            item_name=data["name"],
            item_description=data.get("description"),
            standard_price=data.get("standard_price"),
            small_price=data.get("small_price"),
            large_price=data.get("large_price"),
            image_url=data.get("image_url"),
            is_available=bool(data.get("is_available", True)),
            created_by=data.get("created_by", "SYSTEM"),
        )
        db.add(item)
        db.flush()
        return item

    @staticmethod
    def patch(db: Session, item: MenuItem, data: dict) -> MenuItem:
        for key, col in (
            ("category", "category"),
            ("name", "item_name"),
            ("description", "item_description"),
            ("standard_price", "standard_price"),
            ("small_price", "small_price"),
            ("large_price", "large_price"),
            ("image_url", "image_url"),
            ("is_available", "is_available"),
        ):
            if key in data:
                setattr(item, col, data[key])
        if "updated_by" in data:
            item.updated_by = data["updated_by"]
        db.flush()
        return item

    @staticmethod
    def delete(db: Session, item: MenuItem) -> None:
        db.delete(item)
        db.flush()