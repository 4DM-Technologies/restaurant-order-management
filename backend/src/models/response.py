"""Standard success envelope helpers."""

from typing import Any


def ok(data: Any) -> dict:
    return {"success": True, "data": data}


def ok_message(message: str) -> dict:
    return {"success": True, "data": {"message": message}}