"""Auth DTOs — login / signup / me."""

import re

from pydantic import BaseModel, field_validator

from src.repositories.schema.enums import AccountRole

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        if not _EMAIL_RE.match(v):
            raise ValueError("Enter a valid email address")
        return v.strip().lower()


class LoginResponse(BaseModel):
    token: str
    role: AccountRole
    name: str
    email: str
    account_uuid: str


class SignupRequest(BaseModel):
    email: str
    password: str
    confirm: str

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        if not _EMAIL_RE.match(v):
            raise ValueError("Enter a valid email address")
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @field_validator("confirm")
    @classmethod
    def confirm_matches(cls, v: str, info) -> str:
        pwd = info.data.get("password")
        if pwd is not None and v != pwd:
            raise ValueError("Passwords do not match")
        return v


class MeResponse(BaseModel):
    account_uuid: str
    name: str
    email: str
    role: AccountRole
