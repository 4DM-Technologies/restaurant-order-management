"""Kitchen routes — staff-only board + status updates (broadcast over WS)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.middleware.auth import require_roles
from src.models.order_schema import OrderPatch
from src.models.response import ok
from src.repositories.schema import AccountRole
from src.services import order_service
from src.services.websocket_manager import orders_manager
from src.utils.logger import logged

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    dependencies=[Depends(require_roles(AccountRole.ADMIN, AccountRole.EMPLOYEE))],
)


@router.get("/kitchen")
@logged(workflow="kitchen")
def kitchen(db: Session = Depends(get_db)) -> dict:
    return ok(order_service.list_kitchen(db))


@router.patch("/{order_uuid}")
@logged(workflow="kitchen")
async def update_order(
    order_uuid: str,
    payload: OrderPatch,
    db: Session = Depends(get_db),
) -> dict:
    updated = order_service.patch_order(
        db, order_uuid, payload.kitchen_status, payload.order_status
    )
    await orders_manager.broadcast(
        {"type": "orders_updated", "data": order_service.list_kitchen(db)}
    )
    return ok(updated)
