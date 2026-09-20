"""Admin routes — employees + order history + CSV export (admin-only)."""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from src.database import get_db
from src.middleware.auth import require_roles
from src.models.admin_schema import EmployeeCreate, EmployeePatch
from src.models.response import ok, ok_message
from src.repositories.schema import AccountRole, OrderStatus
from src.services import admin_service, order_service
from src.utils.exceptions import ValidationFailure
from src.utils.logger import logged

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_roles(AccountRole.ADMIN))],
)


def _parse_date(value: str | None, end_of_day: bool = False) -> datetime | None:
    if value is None:
        return None
    try:
        parsed = datetime.strptime(value + "+00:00", "%Y-%m-%d%z")
    except ValueError as exc:
        raise ValidationFailure("Invalid date — use YYYY-MM-DD format") from exc
    if end_of_day:
        return parsed + timedelta(days=1)
    return parsed


@router.get("/employees")
@logged(workflow="admin-employees")
def employees(db: Session = Depends(get_db)) -> dict:
    return ok(admin_service.list_employees(db))


@router.post("/employees")
@logged(workflow="admin-employees")
def employees_create(payload: EmployeeCreate, db: Session = Depends(get_db)) -> dict:
    return ok(admin_service.create_employee(db, payload))


@router.delete("/employees/{account_uuid}")
@logged(workflow="admin-employees")
def employees_delete(account_uuid: str, db: Session = Depends(get_db)) -> dict:
    admin_service.delete_employee(db, account_uuid)
    return ok_message("Employee removed")


@router.patch("/employees/{account_uuid}")
@logged(workflow="admin-employees")
def employees_update(
    account_uuid: str, payload: EmployeePatch, db: Session = Depends(get_db)
) -> dict:
    return ok(
        admin_service.update_employee(
            db, account_uuid, payload.model_dump(exclude_none=True)
        )
    )


@router.get("/orders")
@logged(workflow="admin-orders")
def orders(
    from_date: str | None = Query(None, description="YYYY-MM-DD"),
    to_date: str | None = Query(None, description="YYYY-MM-DD"),
    order_status: OrderStatus | None = Query(None),
    db: Session = Depends(get_db),
) -> dict:
    return ok(
        order_service.history(
            db,
            _parse_date(from_date),
            _parse_date(to_date, end_of_day=True),
            order_status,
        )
    )


@router.get("/orders/export")
@logged(workflow="admin-orders-export")
def orders_export(
    from_date: str | None = Query(None, description="YYYY-MM-DD"),
    to_date: str | None = Query(None, description="YYYY-MM-DD"),
    order_status: OrderStatus | None = Query(None),
    db: Session = Depends(get_db),
) -> Response:
    csv_text = admin_service.build_orders_csv(
        order_service.history(
            db,
            _parse_date(from_date),
            _parse_date(to_date, end_of_day=True),
            order_status,
        )
    )
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="soroco-order-history.csv"'
        },
    )
