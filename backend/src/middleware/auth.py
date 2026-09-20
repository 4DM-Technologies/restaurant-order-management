"""Authentication dependencies — validated server-side on every protected route."""

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from src.database import get_db
from src.repositories import AccountRepository
from src.repositories.schema import Account, AccountRole
from src.services.auth_service import decode_token
from src.utils.exceptions import (
    ForbiddenError,
    UnauthorizedError,
)


def _bearer_token(request: Request) -> str:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        raise UnauthorizedError("Authentication required. Please log in.")
    return header[len("Bearer ") :].strip()


def get_current_user(request: Request, db: Session = Depends(get_db)) -> Account:
    token = _bearer_token(request)
    try:
        payload = decode_token(token)
    except Exception as exc:
        raise UnauthorizedError("Invalid or expired token. Please log in again.") from exc

    subject = payload.get("sub")
    account = AccountRepository.get_by_uuid(db, str(subject)) if subject else None
    if account is None:
        raise UnauthorizedError("Account no longer exists. Please log in again.")
    return account


def require_roles(*roles: AccountRole):
    def dependency(user: Account = Depends(get_current_user)) -> Account:
        if user.account_role not in roles:
            raise ForbiddenError("Unauthorized")
        return user

    return dependency


def authenticate_token(token: str) -> Account:
    """WebSocket connect-time validation (query/token param). Returns account or raises."""
    try:
        payload = decode_token(token)
    except Exception as exc:
        raise UnauthorizedError("Invalid or expired token") from exc
    subject = payload.get("sub")
    if not subject:
        raise UnauthorizedError("Missing account in token")
    from src.database import SessionLocal
    from src.repositories import AccountRepository as repo

    with SessionLocal() as db:
        account = repo.get_by_uuid(db, str(subject))
        if account is None:
            raise UnauthorizedError("Account no longer exists")
        if account.account_role not in (AccountRole.EMPLOYEE, AccountRole.ADMIN):
            raise ForbiddenError("Unauthorized")
        return account