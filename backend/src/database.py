"""Database engine, session factory, declarative base and FastAPI dependency."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from src.settings import settings


def _engine_kwargs(url: str) -> dict:
    """SQLite needs special connect args so FastAPI threads share the file."""
    if url.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    return {"pool_pre_ping": True, "pool_size": 5, "max_overflow": 10}


engine = create_engine(settings.database_url, **_engine_kwargs(settings.database_url))

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    class_=Session,
)


class Base(DeclarativeBase):
    """Base for all SQLAlchemy ORM models."""


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()