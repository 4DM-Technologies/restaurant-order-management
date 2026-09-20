"""Soroco House — FastAPI application entrypoint.

Run: uvicorn main:app --reload
Tables auto-create on startup; use `python -m src.seed` to load seed data.
"""

from dotenv import load_dotenv

load_dotenv()

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.database import Base, engine
from src.routes import include_routers
from src.settings import settings
from src.utils.exceptions.handlers import register_exception_handlers
from src.utils.logger import TraceIDMiddleware, logger
from src.utils.rate_limit import limiter


def _base_url() -> str:
    if settings.public_url:
        return settings.public_url.rstrip("/")
    return f"http://{settings.host}:{settings.port}"


def _startup_banner(app_name: str, version: str) -> None:
    base = _base_url()
    logger.info(
        "%s v%s is starting up",
        app_name,
        version,
        extra={"event": "startup", "state": "booting"},
    )
    logger.info(
        "Backend link: %s",
        base,
        extra={"event": "startup", "state": "booting", "url": base},
    )
    logger.info(
        "Interactive docs: %s/docs",
        base,
        extra={"event": "startup", "state": "booting"},
    )
    logger.info(
        "Health check: %s/health",
        base,
        extra={"event": "startup", "state": "booting"},
    )
    logger.info(
        "Database: %s",
        settings.database_url.split("@")[-1],
        extra={"event": "startup", "state": "booting", "component": "database"},
    )
    logger.info(
        "Storage driver: %s",
        settings.storage_driver,
        extra={"event": "startup", "state": "booting", "component": "storage"},
    )
    logger.info(
        "Bill email: %s",
        "MOCK (console)" if settings.email_mock else settings.smtp_sender,
        extra={"event": "startup", "state": "booting", "component": "email"},
    )


def _migrate_tables() -> list[str]:
    Base.metadata.create_all(bind=engine)
    return sorted(Base.metadata.tables.keys())


@asynccontextmanager
async def lifespan(app: FastAPI):
    _startup_banner(app.title.split(" — ")[0], app.version)
    # Create tables on startup (no auto-seed — run `python -m src.seed`).
    tables = _migrate_tables()
    logger.info(
        "Database migration complete — %d table(s) ready: %s",
        len(tables),
        ", ".join(tables) if tables else "none",
        extra={"event": "startup", "state": "ready", "component": "database"},
    )
    yield
    logger.info(
        "%s v%s shut down",
        app.title.split(" — ")[0],
        app.version,
        extra={"event": "shutdown", "state": "stopped"},
    )


def create_app() -> FastAPI:
    app = FastAPI(
        title="Soroco House — Restaurant Order Management",
        version="1.0.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(TraceIDMiddleware)

    # Slowapi rate limiting.
    app.state.limiter = limiter

    # Friendly JSON error envelope for every failure.
    register_exception_handlers(app)

    # Serve uploaded food photos under /images.
    os.makedirs(settings.upload_dir, exist_ok=True)
    app.mount(
        "/images",
        StaticFiles(directory=settings.upload_dir),
        name="images",
    )

    include_routers(app)
    return app


app = create_app()
