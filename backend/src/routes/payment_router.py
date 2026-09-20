"""Payment routes — public checkout POST (mock gateway for now)."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.payment_schema import PaymentRequest
from src.models.response import ok
from src.services import order_service
from src.services.payment import process_payment
from src.services.websocket_manager import orders_manager
from src.utils.rate_limit import limiter

router = APIRouter(prefix="/payments", tags=["payment"])


@router.post("")
@limiter.limit("20/minute")
async def create_payment(
    request: Request,
    payload: PaymentRequest,
    db: Session = Depends(get_db),
) -> dict:
    result = process_payment(db, payload)
    if result.success:
        await orders_manager.broadcast(
            {"type": "orders_updated", "data": order_service.list_kitchen(db)}
        )
        return ok(
            {
                "payment_status": "success",
                "order_number": result.order_number,
                "total": result.total,
                "order": result.order,
            }
        )
    return ok(
        {
            "payment_status": result.status,
            "message": result.message,
        }
    )
