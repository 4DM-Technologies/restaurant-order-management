"""FastAPI route wiring."""

from fastapi import FastAPI

from src.routes import (
    admin_router,
    auth_router,
    health_router,
    image_router,
    menu_router,
    order_router,
    payment_router,
    upload_router,
    ws_router,
)

API_PREFIX = "/api/v1"


def include_routers(app: FastAPI) -> None:
    app.include_router(health_router.router)
    app.include_router(auth_router.router, prefix=API_PREFIX)
    app.include_router(menu_router.router, prefix=API_PREFIX)
    app.include_router(upload_router.router, prefix=API_PREFIX)
    app.include_router(image_router.router, prefix=API_PREFIX)
    app.include_router(order_router.router, prefix=API_PREFIX)
    app.include_router(payment_router.router, prefix=API_PREFIX)
    app.include_router(admin_router.router, prefix=API_PREFIX)
    app.include_router(ws_router.router, prefix=API_PREFIX)
