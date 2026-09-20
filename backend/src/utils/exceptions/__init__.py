"""Centralized error codes + exception helpers for the Soroco backend."""

from src.utils.exceptions.error_codes import (
    CONFLICT,
    FORBIDDEN,
    FORGED_CALLBACK,
    INTERNAL_ERROR,
    INVALID_CREDENTIALS,
    NOT_FOUND,
    RATE_LIMITED,
    SIGNUP_PENDING,
    UNAUTHORIZED,
    VALIDATION_ERROR,
)
from src.utils.exceptions.error_responses import ErrorResponse
from src.utils.exceptions.exceptions import (
    AppError,
    ConflictError,
    ForbiddenError,
    ForgedCallbackError,
    NotFoundError,
    SignupPendingError,
    UnauthorizedError,
    ValidationFailure,
)

__all__ = [
    "CONFLICT",
    "FORBIDDEN",
    "FORGED_CALLBACK",
    "INTERNAL_ERROR",
    "INVALID_CREDENTIALS",
    "NOT_FOUND",
    "RATE_LIMITED",
    "SIGNUP_PENDING",
    "UNAUTHORIZED",
    "VALIDATION_ERROR",
    "AppError",
    "ConflictError",
    "ErrorResponse",
    "ForbiddenError",
    "ForgedCallbackError",
    "NotFoundError",
    "SignupPendingError",
    "UnauthorizedError",
    "ValidationFailure",
]
