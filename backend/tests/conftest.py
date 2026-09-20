"""Isolated test environment.

Env vars MUST be set at import time (before any `src.*` module is imported)
so `src.settings` and `src.database` pick up the isolated SQLite + local
storage + mock email. Never touch RDS/S3/real SMTP.
"""

import os
import tempfile

import pytest
from fastapi.testclient import TestClient

_TMP = tempfile.mkdtemp(prefix="soroco-test-")
os.environ["DEV_DATABASE_URL"] = f"sqlite:///{_TMP}/test.db"
os.environ["DEV_STORAGE_DRIVER"] = "local"
os.environ["DEV_UPLOAD_DIR"] = _TMP
os.environ["DEV_EMAIL_MOCK"] = "true"


@pytest.fixture
def client():
    from src.database import Base, engine

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    from main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db():
    from src.database import SessionLocal

    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def _make_user(db, name: str, email: str, password: str | None):
    from src.repositories import AccountRepository
    from src.repositories.schema import AccountRole
    from src.services.auth_service import hash_password

    account = AccountRepository.create(
        db, name, email, AccountRole.ADMIN, created_by="TEST"
    )
    if password:
        account.account_password = hash_password(password)
    db.commit()
    return account


@pytest.fixture
def admin_user(client):
    """Seeded admin — returns (email, password, auth headers)."""
    from src.database import SessionLocal
    from src.repositories.schema import AccountRole
    from src.services.auth_service import create_access_token

    with SessionLocal() as session:
        account = _make_user(session, "Admin One", "admin@test.com", "admin12345")
        token = create_access_token(
            str(account.account_uuid), account.account_email, AccountRole.ADMIN.value
        )
    return "admin@test.com", "admin12345", {"Authorization": f"Bearer {token}"}


@pytest.fixture
def employee_user(client, admin_user):
    """Admin adds an employee; employee sets a password; returns its headers."""
    _, _, admin_headers = admin_user
    created = client.post(
        "/api/v1/admin/employees",
        json={"name": "Staff One", "email": "staff@test.com"},
        headers=admin_headers,
    )
    assert created.status_code == 200

    signup = client.post(
        "/api/v1/auth/signup",
        json={"email": "staff@test.com", "password": "staff12345", "confirm": "staff12345"},
    )
    assert signup.status_code == 200
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "staff@test.com", "password": "staff12345"},
    ).json()["data"]
    return "staff@test.com", "staff12345", {
        "Authorization": f"Bearer {login['access_token']}"
    }