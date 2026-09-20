"""Tests for the JSON logger + @logged call-tracing decorator."""

import asyncio
import json
import logging

import pytest

from src.utils.logger import (
    JsonFormatter,
    TraceIDMiddleware,
    get_trace_id,
    logged,
    redact,
    reset_trace_id,
    set_trace_id,
)


def _formatted(messages: list[logging.LogRecord]) -> list[dict]:
    formatter = JsonFormatter()
    return [json.loads(formatter.format(r)) for r in messages]


@pytest.fixture(autouse=True)
def _clear_trace_id():
    token = None
    if get_trace_id():
        token = set_trace_id("")
    yield
    if token is not None:
        reset_trace_id(token)


def test_logged_traces_enter_and_exit(caplog):
    @logged(workflow="test-workflow")
    def add(a: int, b: int) -> int:
        return a + b

    with caplog.at_level(logging.INFO, logger="root"):
        assert add(2, 3) == 5

    messages = [r.getMessage() for r in caplog.records]
    assert any("enter " in m and "add()" in m for m in messages)
    assert any("exit " in m and "add()" in m for m in messages)


def test_logged_includes_structured_fields(caplog):
    @logged(workflow="test-workflow")
    def sample() -> None:
        return None

    with caplog.at_level(logging.INFO, logger="root"):
        sample()

    payloads = _formatted(caplog.records)
    enterers = [p for p in payloads if p["message"].startswith("enter ")]
    assert enterers
    record = enterers[0]
    assert record["layer"] == "CORE"
    assert record["workflow"] == "test-workflow"
    assert record["func"].endswith("sample")
    assert record["file"] == "test_logger.py"
    assert isinstance(record["line"], int)
    for key in ("timestamp", "level", "logger", "message"):
        assert key in record


def test_logged_logs_exception_with_stacktrace(caplog):
    @logged(workflow="test-workflow")
    def boom() -> None:
        raise ValueError("kaboom")

    with (
        caplog.at_level(logging.INFO, logger="root"),
        pytest.raises(ValueError, match="kaboom"),
    ):
        boom()

    payloads = _formatted(caplog.records)
    failures = [p for p in payloads if "raised" in p.get("message", "")]
    assert failures
    failure = failures[0]
    assert failure["exc_type"] == "ValueError"
    assert failure["exc_message"] == "kaboom"
    assert "in boom" in failure["stacktrace"]
    assert failure["level"] == "ERROR"


def test_logged_supports_async(caplog):
    @logged(workflow="test-async")
    async def fetch() -> int:
        return 7

    with caplog.at_level(logging.INFO, logger="root"):
        result = asyncio.run(fetch())

    assert result == 7
    messages = [r.getMessage() for r in caplog.records]
    assert any("enter " in m and "fetch()" in m for m in messages)
    assert any("exit " in m and "fetch()" in m for m in messages)


def test_logged_preserves_function_metadata():
    @logged()
    def documented() -> None:
        """Docstring here."""

    assert documented.__name__ == "documented"
    assert documented.__doc__ == "Docstring here."


def test_logged_accepts_level_override(caplog):
    with caplog.at_level(logging.DEBUG, logger="root"):

        @logged(workflow="debug-wf", level=logging.DEBUG)
        def quiet() -> None:
            return None

        quiet()

    assert any(r.levelno == logging.DEBUG for r in caplog.records)


def test_trace_id_flows_through_extra_and_formatter(caplog):
    logger = logging.getLogger("root")
    token = set_trace_id("trace-abc-123")
    try:
        with caplog.at_level(logging.INFO, logger="root"):
            logger.info("hello", extra={"user_ref": "u_42"})
            payloads = _formatted(caplog.records)
    finally:
        reset_trace_id(token)

    assert payloads[0]["trace_id"] == "trace-abc-123"
    assert payloads[0]["user_ref"] == "u_42"


def test_redaction_scrubs_secrets_and_pii():
    assert redact("Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig") == (
        "Bearer [REDACTED]"
    )
    assert "secret" not in redact("password=super-secret-123 auth_token=xyz")
    assert "[REDACTED]" in redact("password=super-secret-123")
    assert redact("email user@example.com here") == "email [REDACTED] here"


def test_redact_keeps_benign_text():
    text = "Sent push order #42 to kitchen"
    assert redact(text) == text


def test_noisy_third_party_loggers_suppressed():
    for name in ("httpx", "botocore", "boto3", "urllib3", "uvicorn.access"):
        assert logging.getLogger(name).level <= logging.WARNING


def test_middleware_sets_trace_id_and_response_header():
    from fastapi import FastAPI
    from fastapi.testclient import TestClient

    app = FastAPI()
    app.add_middleware(TraceIDMiddleware)

    @app.get("/ping")
    async def ping():
        return {"trace_id": get_trace_id()}

    with TestClient(app) as client:
        response = client.get("/ping")
        assert response.status_code == 200
        assert response.headers.get("x-request-id")
        assert response.json()["trace_id"] == response.headers["x-request-id"]

    with TestClient(app) as client:
        response = client.get("/ping", headers={"X-Request-ID": "incoming-id-9"})
        assert response.headers["x-request-id"] == "incoming-id-9"
        assert response.json()["trace_id"] == "incoming-id-9"
