"""Tests for the @logged call-tracing decorator."""

import logging

from src.utils.logger import logged


def test_logged_traces_enter_and_exit(caplog):
    @logged(workflow="test-workflow")
    def add(a: int, b: int) -> int:
        return a + b

    with caplog.at_level(logging.INFO, logger="root"):
        assert add(2, 3) == 5

    messages = [r.getMessage() for r in caplog.records]
    assert any("enter " in m and "add()" in m for m in messages)
    assert any("exit " in m and "add()" in m for m in messages)


def test_logged_includes_layer_file_workflow(caplog):
    @logged(workflow="test-workflow")
    def sample() -> None:
        return None

    with caplog.at_level(logging.INFO, logger="root"):
        sample()

    messages = [r.getMessage() for r in caplog.records]
    joined = " | ".join(messages)
    assert "layer=" in joined
    assert "workflow=test-workflow" in joined
    assert "file=" in joined
    assert "test_logger.py" in joined


def test_logged_logs_exception(caplog):
    @logged(workflow="test-workflow")
    def boom() -> None:
        raise ValueError("kaboom")

    import pytest

    with caplog.at_level(logging.INFO, logger="root"), pytest.raises(
        ValueError, match="kaboom"
    ):
        boom()

    messages = [r.getMessage() for r in caplog.records]
    assert any("raised ValueError" in m for m in messages)


def test_logged_supports_async(caplog):
    import asyncio

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