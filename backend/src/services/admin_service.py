"""Admin orchestration — employee accounts + order history CSV export."""

import csv
import io

from sqlalchemy.orm import Session

from src.models.admin_schema import EmployeeCreate
from src.repositories import AccountRepository
from src.repositories.schema import Account, AccountRole
from src.utils.datetimes import iso_utc
from src.utils.exceptions import ConflictError, NotFoundError
from src.utils.logger import logged


def _account_out(account: Account) -> dict:
    return {
        "account_uuid": str(account.account_uuid),
        "account_id": account.account_id,
        "account_name": account.account_name,
        "account_email": account.account_email,
        "account_role": account.account_role.value,
        "created_at": iso_utc(account.created_at),
        "has_password": account.account_password is not None,
        "can_delete": account.account_role != AccountRole.ADMIN,
    }


@logged(workflow="admin-employees")
def list_employees(db: Session) -> list[dict]:
    return [_account_out(a) for a in AccountRepository.list_staff(db)]


@logged(workflow="admin-employees")
def create_employee(db: Session, data: EmployeeCreate) -> dict:
    if AccountRepository.get_by_email(db, data.email) is not None:
        raise ConflictError("An account already exists for that email")
    account = AccountRepository.create(
        db, data.name, data.email, AccountRole.EMPLOYEE, created_by="ADMIN"
    )
    db.commit()
    db.refresh(account)
    return _account_out(account)


@logged(workflow="admin-employees")
def delete_employee(db: Session, account_uuid: str) -> None:
    account = AccountRepository.get_by_uuid(db, account_uuid)
    if account is None:
        raise NotFoundError("Employee account not found")
    if account.account_role == AccountRole.ADMIN:
        raise ConflictError("Admin accounts cannot be deleted through this endpoint")
    AccountRepository.delete(db, account)
    db.commit()


def update_employee(db: Session, account_uuid: str, data: dict) -> dict:
    account = AccountRepository.get_by_uuid(db, account_uuid)
    if account is None:
        raise NotFoundError("Employee account not found")
    if "email" in data and data["email"].strip().lower() != account.account_email:
        existing = AccountRepository.get_by_email(db, data["email"])
        if existing is not None:
            raise ConflictError("An account already exists for that email")
    if data.get("name") is not None:
        account.account_name = data["name"].strip()
    if data.get("email") is not None:
        account.account_email = data["email"].strip().lower()
    account.updated_by = "ADMIN"
    db.commit()
    db.refresh(account)
    return _account_out(account)


@logged(workflow="admin-orders-export")
def build_orders_csv(orders: list[dict]) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "Order Number",
            "Ordered At",
            "Table",
            "Customer",
            "Items",
            "Quantity",
            "Subtotal (INR)",
            "Tax (INR)",
            "Total (INR)",
            "Payment Method",
            "Payment Status",
            "Kitchen Status",
            "Order Status",
        ]
    )
    for order in orders:
        item_lines = "; ".join(
            f"{it['item_name']}"
            + (f" ({it['selected_size']})" if it.get("selected_size") else "")
            + f" x{it['quantity']}"
            for it in order["items"]
        )
        qty = sum(it["quantity"] for it in order["items"])
        writer.writerow(
            [
                order["order_number"],
                order["created_at"],
                order["table_name"],
                order["customer_name"],
                item_lines,
                qty,
                f"{order['subtotal']:.2f}",
                f"{order['tax']:.2f}",
                f"{order['total_price']:.2f}",
                order["payment_method"],
                order["payment_status"],
                order["kitchen_status"],
                order["order_status"],
            ]
        )
    return buffer.getvalue()
