"""Shared application exceptions (domain-specific, mapped to friendly JSON in handlers)."""

from src.utils.exceptions import error_codes


class AppError(Exception):
    """Base application error carrying an HTTP status + envelope fields."""

    status_code = 500
    code = error_codes.INTERNAL_ERROR

    def __init__(self, message: str, detail: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.detail = detail


class NotFoundError(AppError):
    status_code = 404
    code = error_codes.NOT_FOUND


class UnauthorizedError(AppError):
    status_code = 401
    code = error_codes.UNAUTHORIZED


class ForbiddenError(AppError):
    status_code = 403
    code = error_codes.FORBIDDEN


class SignupPendingError(ForbiddenError):
    code = error_codes.SIGNUP_PENDING


class ConflictError(AppError):
    status_code = 409
    code = error_codes.CONFLICT


class ValidationFailure(AppError):
    status_code = 422
    code = error_codes.VALIDATION_ERROR


class ForgedCallbackError(AppError):
    status_code = 400
    code = error_codes.FORGED_CALLBACK
