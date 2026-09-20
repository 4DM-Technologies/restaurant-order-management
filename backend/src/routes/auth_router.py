"""Auth routes — login / signup / me (rate-limited)."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from src.database import get_db
from src.middleware.auth import get_current_user
from src.models.auth_schema import LoginRequest, SignupRequest
from src.models.response import ok
from src.repositories import AccountRepository
from src.repositories.schema import Account
from src.services.auth_service import (
    create_access_token,
    hash_password,
    verify_password,
)
from src.settings import settings
from src.utils.exceptions import ConflictError, NotFoundError, UnauthorizedError
from src.utils.logger import logged
from src.utils.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
@limiter.limit(settings.auth_rate_limit)
@logged(workflow="auth")
def login(
    request: Request,
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> dict:
    account = AccountRepository.get_by_email(db, payload.email)
    if account is None or not verify_password(
        payload.password, account.account_password or ""
    ):
        raise UnauthorizedError("Invalid email or password")
    token = create_access_token(
        str(account.account_uuid), account.account_email, account.account_role.value
    )
    return ok(
        {
            "access_token": token,
            "token_type": "bearer",
            "account_uuid": str(account.account_uuid),
            "name": account.account_name,
            "email": account.account_email,
            "role": account.account_role.value,
        }
    )


@router.post("/signup")
@limiter.limit(settings.auth_rate_limit)
@logged(workflow="auth")
def signup(
    request: Request,
    payload: SignupRequest,
    db: Session = Depends(get_db),
) -> dict:
    account = AccountRepository.get_by_email(db, payload.email)
    if account is None:
        raise NotFoundError(
            "No account found for this email — ask the admin to add you first"
        )
    if account.account_password is not None:
        raise ConflictError("This account is already active. Please sign in instead.")
    account.account_password = hash_password(payload.password)
    db.commit()
    token = create_access_token(
        str(account.account_uuid), account.account_email, account.account_role.value
    )
    return ok(
        {
            "access_token": token,
            "token_type": "bearer",
            "account_uuid": str(account.account_uuid),
            "name": account.account_name,
            "email": account.account_email,
            "role": account.account_role.value,
        }
    )


@router.get("/check")
@limiter.limit(settings.auth_rate_limit)
@logged(workflow="auth")
def check_account(
    request: Request,
    email: str,
    db: Session = Depends(get_db),
) -> dict:
    account = AccountRepository.get_by_email(db, email)
    if account is None:
        return ok({"exists": False, "has_password": False})
    return ok(
        {
            "exists": True,
            "has_password": account.account_password is not None,
        }
    )


@router.get("/me")
def me(user: Account = Depends(get_current_user)) -> dict:
    return ok(
        {
            "account_uuid": str(user.account_uuid),
            "name": user.account_name,
            "email": user.account_email,
            "role": user.account_role.value,
        }
    )
