"""Exception handlers that map every failure to the friendly JSON envelope."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from src.utils.exceptions.error_responses import ErrorResponse
from src.utils.exceptions.exceptions import AppError
from src.utils.logger import logger


def _body(message: str, code: str | None = None, detail: str | None = None) -> dict:
    return ErrorResponse(message=message, code=code, detail=detail).model_dump()


def _flatten_validation(errors: list) -> str:
    """Flatten pydantic/fastapi validation errors into one readable message."""
    parts: list[str] = []
    for err in errors:
        loc = err.get("loc", ())
        loc_str = ".".join(str(x) for x in loc if x not in ("body", "query", "path"))
        msg = err.get("msg", "invalid value")
        parts.append(f"{loc_str}: {msg}" if loc_str else msg)
    return "; ".join(parts[:3]) if parts else "Invalid request payload"


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=_body(exc.message, exc.code, exc.detail),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=_body(_flatten_validation(exc.errors()), "VALIDATION_ERROR"),
        )

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(
        _request: Request, exc: RateLimitExceeded
    ) -> JSONResponse:
        return JSONResponse(
            status_code=429,
            content=_body(
                "Too many attempts. Please wait and try again.",
                "RATE_LIMITED",
            ),
        )

    @app.exception_handler(Exception)
    async def unexpected_handler(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error: %s", exc)
        return JSONResponse(
            status_code=500,
            content=_body("Something went wrong on our side. Please try again."),
        )