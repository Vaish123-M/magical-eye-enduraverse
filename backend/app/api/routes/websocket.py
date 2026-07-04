"""WebSocket routes for real-time updates."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Set
import json
import asyncio

router = APIRouter(prefix="/ws", tags=["WebSocket"])


class ConnectionManager:
    """Manages WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients."""
        if not self.active_connections:
            return
        
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.add(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            self.active_connections.discard(conn)


manager = ConnectionManager()


@router.websocket("/inspections")
async def websocket_inspection_updates(websocket: WebSocket):
    """WebSocket endpoint for real-time inspection updates."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def broadcast_inspection_update(inspection_data: dict):
    """Helper function to broadcast inspection updates."""
    await manager.broadcast({
        "type": "inspection_update",
        "data": inspection_data
    })
