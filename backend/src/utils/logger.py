"""Centralized structured JSON logging + ``@logged`` call-tracing decorator.

Every record is emitted as a single JSON line::

    {
      "timestamp": "2026-09-21T02:00:00.123456+00:00",
      "level": "INFO",
      "logger": "src.services.menu_service",
      "file": "menu_service.py",
      "line": 42,
      "message": "enter list_menu()",
      "trace_id": "550e8400-e29b",
      "layer": "SERVICE",
      "workflow": "menu",
      "func": "list_menu",
      "elapsed_ms": 1.2
    }

- Failure records additionally carry ``exc_type``, ``exc_message`` and
  ``stacktrace``.
- Custom fields supplied via ``extra={...}`` are merged into the output.
- ``trace_id`` flows through a contextvar, so every log produced while serving
  one request shares the same id (set by ``TraceIDMiddleware`` or manually via
  ``set_trace_id()`` / ``reset_trace_id()``).
- Secrets and PII (tokens, passwords, emails) are redacted before output.
- Noisy third-party loggers (httpx, motor, boto3, ...) are lowered to WARNING.
"""

import functools
import inspect
import json
import logging
import os
import re
import sys
import time
import traceback
import uuid
from collections.abc import Callable
from contextvars import ContextVar, Token
from datetime import UTC, datetime
from typing import Any, ParamSpec, TypeVar

P = ParamSpec("P")
T = TypeVar("T")

REDACTED = "[REDACTED]"

# ── trace_id propagation ─────────────────────────────────────────────────
_trace_id_var: ContextVar[str] = ContextVar("trace_id", default="")


def get_trace_id() -> str:
    return _trace_id_var.get()


def set_trace_id(value: str) -> Token:
    return _trace_id_var.set(value)


def reset_trace_id(token: Token) -> None:
    _trace_id_var.reset(token)


# ── redaction ────────────────────────────────────────────────────────────
_SECRET_VALUE = re.compile(
    r"(?i)(password|passwd|secret|api[_-]?key|token|authorization)\s*[=:]\s*"
    r'("[^"]+"|\'[^\']+\'|[^\s&,;]+)'
)
_BEARER = re.compile(r"(?i)bearer\s+[a-z0-9._~+/-]+=*")
_JWT = re.compile(r"\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b")
_EMAIL = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
_PLAINTEXT_PIN = re.compile(r"(?i)\bcvv\b\s*[=:]\s*\d{3,4}")


def redact(text: str) -> str:
    """Scrub tokens / passwords / PII from a free-form string."""
    text = _JWT.sub(REDACTED, text)
    text = _BEARER.sub(f"bearer {REDACTED}", text)
    text = _SECRET_VALUE.sub(lambda m: f"{m.group(1)}={REDACTED}", text)
    text = _PLAINTEXT_PIN.sub(f"cvv={REDACTED}", text)
    text = _EMAIL.sub(REDACTED, text)
    return text


def _safe_value(value: Any) -> Any:
    if isinstance(value, str):
        return redact(value)
    if isinstance(value, (list, tuple, dict)):
        return json.loads(json.dumps(value, default=str))
    return value


# ── JSON formatter ───────────────────────────────────────────────────────
_RESERVED = set(logging.makeLogRecord({}).__dict__)
_RESERVED.update({"asctime", "message"})


class JsonFormatter(logging.Formatter):
    """Single-line JSON for every record with exception/trace context."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "file": record.filename,
            "line": record.lineno,
            "message": redact(record.getMessage()),
        }

        for key, value in vars(record).items():
            if key.startswith("_") or key in _RESERVED:
                continue
            payload[key] = _safe_value(value)

        trace_id = payload.get("trace_id") or get_trace_id()
        if trace_id:
            payload["trace_id"] = trace_id

        if record.exc_info and record.exc_info[0] is not None:
            exc_type, exc_value, _exc_tb = record.exc_info
            payload["exc_type"] = exc_type.__name__
            payload["exc_message"] = redact(str(exc_value))
            payload["stacktrace"] = redact(
                "".join(traceback.format_exception(*record.exc_info))
            )

        return json.dumps(payload, ensure_ascii=False, default=str)


# ── root logger + third-party noise ─────────────────────────────────────
_NOISY_LOGGERS = (
    "httpx",
    "httpcore",
    "botocore",
    "boto3",
    "urllib3",
    "s3transfer",
    "uvicorn.access",
    "uvicorn.error",
    "sqlalchemy.engine",
    "motor",
    "aiobotocore",
    "aiosqlite",
)


def _build_logger() -> logging.Logger:
    root = logging.getLogger()
    if root.handlers:
        return root

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)

    default_level = os.getenv("DEV_LOG_LEVEL", "INFO").upper()
    root.setLevel(getattr(logging, default_level, logging.INFO))

    for noisy in _NOISY_LOGGERS:
        logging.getLogger(noisy).setLevel(logging.WARNING)

    return root


logger = _build_logger()

# ── Layer detection for `@logged` ────────────────────────────────────────
_LAYER_BY_MODULE = {
    "src.routes": "ROUTE",
    "src.services": "SERVICE",
    "src.repositories": "REPOSITORY",
    "src.middleware": "MIDDLEWARE",
    "src.models": "MODEL",
    "src.utils": "UTIL",
}


def _layer_for(func: Callable[..., Any]) -> str:
    module = func.__module__
    for prefix, layer in _LAYER_BY_MODULE.items():
        if module == prefix or module.startswith(prefix + "."):
            return layer
    return "CORE"


def _short_file(path: str) -> str:
    return path.replace("\\", "/").split("/")[-1]


def logged(
    *, workflow: str = "-", level: int = logging.INFO
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Trace a function call — drop it above any function to activate.

    Logs enter/exit (with elapsed ms) or failure as structured JSON carrying
    the file, line, layer, function and workflow as machine-readable fields.
    Async functions are traced automatically.
    """

    def decorator(func: Callable[P, T]):
        func_name = func.__qualname__
        layer = _layer_for(func)
        file_short = _short_file(inspect.getsourcefile(func) or "")
        line = getattr(func.__code__, "co_firstlineno", 0)

        base_extra = {
            "layer": layer,
            "workflow": workflow,
            "func": func_name,
            "file": file_short,
            "line": line,
        }

        def _enter() -> float:
            logger.log(
                level,
                "enter %s()",
                func_name,
                extra=base_extra,
            )
            return time.monotonic()

        def _exit(started_mono: float) -> None:
            elapsed_ms = (time.monotonic() - started_mono) * 1000
            logger.log(
                level,
                "exit %s() (%.1f ms)",
                func_name,
                elapsed_ms,
                extra={**base_extra, "elapsed_ms": round(elapsed_ms, 1)},
            )

        def _fail(started_mono: float, exc: Exception) -> None:
            elapsed_ms = (time.monotonic() - started_mono) * 1000
            logger.exception(
                "%s() raised %s (%.1f ms)",
                func_name,
                type(exc).__name__,
                elapsed_ms,
                extra={**base_extra, "elapsed_ms": round(elapsed_ms, 1)},
            )

        if inspect.iscoroutinefunction(func):

            @functools.wraps(func)
            async def async_wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
                started_mono = _enter()
                try:
                    result = await func(*args, **kwargs)
                except Exception as exc:
                    _fail(started_mono, exc)
                    raise
                _exit(started_mono)
                return result

            return async_wrapper

        @functools.wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            started_mono = _enter()
            try:
                result = func(*args, **kwargs)
            except Exception as exc:
                _fail(started_mono, exc)
                raise
            _exit(started_mono)
            return result

        return wrapper

    return decorator


class TraceIDMiddleware:
    """ASGI middleware that assigns a trace_id to every HTTP request.

    Reads ``X-Request-ID`` when present, otherwise generates one, and makes
    it available to the whole request context via ``set_trace_id``. The id is
    also echoed back in the response ``X-Request-ID`` header.
    """

    def __init__(self, app: Any):
        self.app = app

    async def __call__(self, scope: dict, receive: Any, send: Any) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = next(
            (
                value.decode()
                for key, value in scope.get("headers", [])
                if key.lower() == b"x-request-id"
            ),
            uuid.uuid4().hex[:12],
        )
        token = set_trace_id(request_id)

        async def send_wrapper(message: dict) -> None:
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"x-request-id", request_id.encode()))
                message["headers"] = headers
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            reset_trace_id(token)
