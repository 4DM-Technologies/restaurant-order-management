"""JWT + password helpers (bcrypt direct — avoids passlib/bcrypt clash)."""

from datetime import UTC, datetime, timedelta

import bcrypt
from jose import jwt

from src.settings import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(subject: str, email: str, role: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": subject,
        "email": email,
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")


def decode_token(token: str) -> dict:
    """Raise JWTError if the token is invalid/expired."""
    return jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])