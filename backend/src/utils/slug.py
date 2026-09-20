"""Slug + unique filename helpers (uploaded image naming)."""

import re
import secrets

_SLUG_RE = re.compile(r"[^a-z0-9]+")


def slugify(value: str) -> str:
    """Lowercase; non [a-z0-9] runs -> '-'; collapse; strip leading/trailing '-'."""
    return _SLUG_RE.sub("-", value.strip().lower()).strip("-")


def unique_filename(slug: str, extension: str = "webp") -> str:
    """``<slug>-<8 hex chars>.webp`` — backed-generated, collision-safe."""
    return f"{slug}-{secrets.token_hex(4)}.{extension.lstrip('.')}"