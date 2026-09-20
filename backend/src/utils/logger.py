"""Centralized logging configuration + `@logged` call-tracing decorator."""

import functools
import inspect
import logging
import sys
import time
from collections.abc import Callable
from typing import Any, ParamSpec, TypeVar

P = ParamSpec("P")
T = TypeVar("T")


class _DevFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        ts = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(record.created))
        return (
            f"{ts} {record.levelname:7s} "
            f"{record.name}:{record.filename}:{record.lineno} - {record.getMessage()}"
        )


def _build_logger() -> logging.Logger:
    root = logging.getLogger()
    if root.handlers:
        return root

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(_DevFormatter())
    root.addHandler(handler)
    root.setLevel(logging.INFO)

    for noisy in ("botocore", "boto3", "urllib3", "s3transfer"):
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

    Logs the file, layer (route/service/repository/...), function, workflow,
    start timestamp and elapsed duration. Include an optional `workflow` label
    (e.g. ``@logged(workflow="place-order")``) to group related calls.
    """

    def decorator(func: Callable[P, T]):
        func_name = func.__qualname__
        layer = _layer_for(func)
        file_short = _short_file(inspect.getsourcefile(func) or "")

        def _enter() -> str:
            started_ts = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            logger.log(
                level,
                "[%s] %s | layer=%s | file=%s | workflow=%s | enter %s()",
                started_ts,
                func_name,
                layer,
                file_short,
                workflow,
                func_name,
            )
            return started_ts

        def _exit(started_ts: str, started_mono: float) -> None:
            elapsed_ms = (time.monotonic() - started_mono) * 1000
            logger.log(
                level,
                "[%s] %s | layer=%s | file=%s | workflow=%s | exit %s() (%.1f ms)",
                time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
                func_name,
                layer,
                file_short,
                workflow,
                func_name,
                elapsed_ms,
            )

        def _fail(started_ts: str, started_mono: float, exc: Exception) -> None:
            elapsed_ms = (time.monotonic() - started_mono) * 1000
            logger.exception(
                "[%s] %s | layer=%s | file=%s | workflow=%s | %s() raised %s (%.1f ms)",
                time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
                func_name,
                layer,
                file_short,
                workflow,
                func_name,
                type(exc).__name__,
                elapsed_ms,
            )

        if inspect.iscoroutinefunction(func):

            @functools.wraps(func)
            async def async_wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
                started_ts = _enter()
                started_mono = time.monotonic()
                try:
                    result = await func(*args, **kwargs)
                except Exception as exc:
                    _fail(started_ts, started_mono, exc)
                    raise
                _exit(started_ts, started_mono)
                return result

            return async_wrapper

        @functools.wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            started_ts = _enter()
            started_mono = time.monotonic()
            try:
                result = func(*args, **kwargs)
            except Exception as exc:
                _fail(started_ts, started_mono, exc)
                raise
            _exit(started_ts, started_mono)
            return result

        return wrapper

    return decorator
