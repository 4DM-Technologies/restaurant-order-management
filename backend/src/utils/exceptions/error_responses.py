"""Standardized error response models."""

from typing import Literal

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Friendly machine-readable error envelope returned for every non-2xx."""

    success: Literal[False] = False
    message: str
    code: str | None = None
    detail: str | None = None