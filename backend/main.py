"""Soroco House — FastAPI application entrypoint.

Run: uvicorn main:app --reload
Tables auto-create on startup; use `python -m src.seed` to load seed data.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.database import Base, engine
from src.routes import include_routers
from src.settings import settings
from src.utils.exceptions.handlers import register_exception_handlers
from src.utils.rate_limit import limiter


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Create tables on startup (no auto-seed — run `python -m src.seed`).
    Base.metadata.create_all(bind=engine)
    yield


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