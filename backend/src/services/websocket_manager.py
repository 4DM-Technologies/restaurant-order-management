"""Thread/async-safe ConnectionManager for menu + kitchen WebSocket streams."""

import asyncio
from typing import Any

from fastapi import WebSocket

from src.utils.logger import logger


class ConnectionManager:
    """Tracks live sockets and broadcasts JSON messages."""

    def __init__(self) -> None:
        self.active: list[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self.active.append(websocket)
        logger.info("WebSocket connected: %s (total=%d)", websocket.url.path, len(self.active))

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active:
            self.active.remove(websocket)
            logger.info("WebSocket disconnected: %s (remaining=%d)", websocket.url.path, len(self.active))

    async def broadcast(self, message: dict[str, Any]) -> None:
        if not self.active:
            return
        async with self._lock:
            sockets = list(self.active)
        dead: list[WebSocket] = []
        for ws in sockets:
            try:
                await ws.send_json(message)
            except Exception:  # noqa: BLE001
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)
        if dead:
            logger.warning("WebSocket broadcast: dropped %d dead client(s)", len(dead))


menu_manager = ConnectionManager()
orders_manager = ConnectionManager()