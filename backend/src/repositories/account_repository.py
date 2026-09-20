"""Accounts data access (staff only)."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.repositories.schema import Account, AccountRole


class AccountRepository:
    @staticmethod
    def next_id(db: Session) -> int:
        current = db.scalar(select(func.max(Account.account_id))) or 0
        return int(current) + 1

    @staticmethod
    def get_by_email(db: Session, email: str) -> Account | None:
        return db.scalar(select(Account).where(Account.account_email == email.strip().lower()))

    @staticmethod
    def get_by_uuid(db: Session, account_uuid: str) -> Account | None:
        return db.get(Account, uuid.UUID(account_uuid))

    @staticmethod
    def list_staff(db: Session) -> list[Account]:
        return list(
            db.scalars(select(Account).order_by(Account.created_at.asc())).all()
        )

    @staticmethod
    def list_employees(db: Session) -> list[Account]:
        return list(
            db.scalars(
                select(Account)
                .where(Account.account_role == AccountRole.EMPLOYEE)
                .order_by(Account.created_at.asc())
            ).all()
        )

    @staticmethod
    def create(
        db: Session, name: str, email: str, role: AccountRole, created_by: str = "SYSTEM"
    ) -> Account:
        account = Account(
            account_uuid=uuid.uuid4(),
            account_id=AccountRepository.next_id(db),
            account_name=name.strip(),
            account_email=email.strip().lower(),
            account_password=None,
            account_role=role,
            created_by=created_by,
        )
        db.add(account)
        db.flush()
        return account

    @staticmethod
    def delete(db: Session, account: Account) -> None:
        db.delete(account)
        db.flush()