"""Menu routes — public read, admin CRUD + WebSocket broadcast."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.middleware.auth import require_roles
from src.models.menu_schema import MenuItemCreate, MenuItemPatch
from src.models.response import ok, ok_message
from src.repositories.schema import AccountRole
from src.services import menu_service
from src.services.websocket_manager import menu_manager

router = APIRouter(prefix="/menu", tags=["menu"])


@router.get("")
def menu_list(db: Session = Depends(get_db)) -> dict:
    return ok(menu_service.list_menu(db))


@router.post("")
async def menu_create(
    payload: MenuItemCreate,
    _admin=Depends(require_roles(AccountRole.ADMIN)),
    db: Session = Depends(get_db),
) -> dict:
    item = menu_service.create_item(db, payload.model_dump())
    await menu_manager.broadcast({"type": "menu_updated"})
    return ok(item)


@router.patch("/{menu_uuid}")
async def menu_patch(
    menu_uuid: str,
    payload: MenuItemPatch,
    _user=Depends(require_roles(AccountRole.EMPLOYEE, AccountRole.ADMIN)),
    db: Session = Depends(get_db),
) -> dict:
    item = menu_service.patch_item(db, menu_uuid, payload.model_dump(exclude_none=True))
    await menu_manager.broadcast({"type": "menu_updated"})
    return ok(item)


@router.delete("/{menu_uuid}")
async def menu_delete(
    menu_uuid: str,
    _admin=Depends(require_roles(AccountRole.ADMIN)),
    db: Session = Depends(get_db),
) -> dict:
    menu_service.delete_item(db, menu_uuid)
    await menu_manager.broadcast({"type": "menu_updated"})
    return ok_message("Menu item deleted")
