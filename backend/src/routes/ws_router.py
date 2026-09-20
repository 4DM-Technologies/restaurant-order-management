"""WebSocket routes — public live menu stream + authenticated kitchen stream."""

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from src.middleware.auth import authenticate_token
from src.services.websocket_manager import menu_manager, orders_manager
from src.utils.exceptions import AppError
from src.utils.logger import logger

router = APIRouter(prefix="/ws", tags=["websockets"])


async def _authorize(websocket: WebSocket, token: str) -> bool:
    try:
        authenticate_token(token)
        return True
    except AppError:
        logger.warning("WebSocket /orders rejected: invalid or missing token")
        await websocket.close(code=4401)
        return False


@router.websocket("/menu")
async def ws_menu(websocket: WebSocket) -> None:
    """Public live menu feed — no authentication required."""
    logger.info("WebSocket /menu client connecting (public feed)")
    await menu_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        menu_manager.disconnect(websocket)


@router.websocket("/orders")
async def ws_orders(websocket: WebSocket, token: str = Query(...)) -> None:
    """Authenticated kitchen stream — staff/admin JWT required."""
    if not await _authorize(websocket, token):
        return
    logger.info("WebSocket /orders client authenticated and connecting")
    await orders_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        orders_manager.disconnect(websocket)
