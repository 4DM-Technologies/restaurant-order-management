"""Menu service — grouped listing + CRUD orchestration."""

from sqlalchemy.orm import Session

from src.repositories import MenuRepository
from src.repositories.schema import MenuItem
from src.utils.exceptions import ConflictError, NotFoundError
from src.utils.logger import logged

# Stable display order — must match the frontend category list.
CATEGORY_ORDER = [
    "Hot Luxury Teas",
    "Coffee Beans",
    "Cold Brew",
    "Filter Coffee",
    "Frappe",
    "Non Coffee",
]


def to_out(item: MenuItem) -> dict:
    return {
        "menu_uuid": str(item.menu_uuid),
        "menu_id": item.menu_id,
        "category": item.category,
        "item_name": item.item_name,
        "item_description": item.item_description,
        "standard_price": float(item.standard_price)
        if item.standard_price is not None
        else None,
        "small_price": float(item.small_price)
        if item.small_price is not None
        else None,
        "large_price": float(item.large_price)
        if item.large_price is not None
        else None,
        "image_url": item.image_url,
        "is_available": bool(item.is_available),
    }


@logged(workflow="menu")
def list_menu(db: Session) -> list[dict]:
    items = MenuRepository.list_all(db)
    grouped: dict[str, list[dict]] = {}
    for item in items:
        grouped.setdefault(item.category, []).append(to_out(item))

    known = [c for c in CATEGORY_ORDER if c in grouped]
    extra = sorted(c for c in grouped if c not in CATEGORY_ORDER)
    return [
        {"category": category, "items": grouped[category]}
        for category in [*known, *extra]
    ]


@logged(workflow="menu-admin")
def create_item(db: Session, data: dict) -> dict:
    existing = MenuRepository.list_all(db)
    if any(
        i.item_name.lower() == data["name"].lower() and i.category == data["category"]
        for i in existing
    ):
        raise ConflictError(
            "A menu item with that name already exists in this category"
        )
    item = MenuRepository.create(db, data)
    db.commit()
    db.refresh(item)
    return to_out(item)


@logged(workflow="menu-admin")
def patch_item(db: Session, menu_uuid: str, data: dict) -> dict:
    item = MenuRepository.get_by_uuid(db, menu_uuid)
    if item is None:
        raise NotFoundError("Menu item not found")
    item = MenuRepository.patch(db, item, data)
    db.commit()
    db.refresh(item)
    return to_out(item)


@logged(workflow="menu-admin")
def delete_item(db: Session, menu_uuid: str) -> None:
    item = MenuRepository.get_by_uuid(db, menu_uuid)
    if item is None:
        raise NotFoundError("Menu item not found")
    MenuRepository.delete(db, item)
    db.commit()
