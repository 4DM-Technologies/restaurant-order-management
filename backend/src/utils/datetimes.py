"""Datetime helpers — serialization with an explicit UTC offset."""

from datetime import UTC, datetime


def iso_utc(dt: datetime) -> str:
    """ISO-8601 string with an explicit UTC offset.

    DB layers (e.g. SQLite) can return naive datetimes even when the source was
    UTC; mark them as UTC before formatting so clients don't parse them as local.
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC).isoformat()