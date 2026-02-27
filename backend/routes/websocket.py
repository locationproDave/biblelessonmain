# WebSocket Routes for Real-Time Collaborative Editing
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, Set, Optional
from datetime import datetime, timezone
import json
import asyncio
import logging

from services.database import db

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket"])

# Connection manager for handling WebSocket connections
class ConnectionManager:
    def __init__(self):
        # lesson_id -> set of (websocket, user_id, user_name)
        self.active_connections: Dict[str, Set[tuple]] = {}
        # websocket -> (lesson_id, user_id, user_name)
        self.connection_info: Dict[WebSocket, tuple] = {}
        
    async def connect(self, websocket: WebSocket, lesson_id: str, user_id: str, user_name: str):
        await websocket.accept()
        
        if lesson_id not in self.active_connections:
            self.active_connections[lesson_id] = set()
        
        connection_tuple = (websocket, user_id, user_name)
        self.active_connections[lesson_id].add(connection_tuple)
        self.connection_info[websocket] = (lesson_id, user_id, user_name)
        
        logger.info(f"WebSocket connected: user={user_name} lesson={lesson_id}")
        
        # Notify others that user joined
        await self.broadcast_presence(lesson_id, user_id, user_name, "joined")
        
    def disconnect(self, websocket: WebSocket):
        if websocket in self.connection_info:
            lesson_id, user_id, user_name = self.connection_info[websocket]
            
            # Remove from active connections
            if lesson_id in self.active_connections:
                self.active_connections[lesson_id] = {
                    conn for conn in self.active_connections[lesson_id] 
                    if conn[0] != websocket
                }
                if not self.active_connections[lesson_id]:
                    del self.active_connections[lesson_id]
            
            del self.connection_info[websocket]
            
            logger.info(f"WebSocket disconnected: user={user_name} lesson={lesson_id}")
            
            # Notify others that user left (fire and forget)
            asyncio.create_task(self.broadcast_presence(lesson_id, user_id, user_name, "left"))
    
    async def broadcast_presence(self, lesson_id: str, user_id: str, user_name: str, action: str):
        """Broadcast presence update to all users in the lesson"""
        if lesson_id not in self.active_connections:
            return
            
        message = {
            "type": "presence",
            "action": action,
            "userId": user_id,
            "userName": user_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "activeUsers": self.get_active_users(lesson_id)
        }
        
        await self.broadcast_to_lesson(lesson_id, message)
    
    def get_active_users(self, lesson_id: str) -> list:
        """Get list of active users in a lesson"""
        if lesson_id not in self.active_connections:
            return []
        
        users = []
        seen_ids = set()
        for ws, user_id, user_name in self.active_connections[lesson_id]:
            if user_id not in seen_ids:
                users.append({"userId": user_id, "userName": user_name})
                seen_ids.add(user_id)
        return users
    
    async def broadcast_to_lesson(self, lesson_id: str, message: dict, exclude_websocket: WebSocket = None):
        """Broadcast message to all users in a lesson"""
        if lesson_id not in self.active_connections:
            return
            
        disconnected = []
        for ws, user_id, user_name in self.active_connections[lesson_id]:
            if ws != exclude_websocket:
                try:
                    await ws.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending to websocket: {e}")
                    disconnected.append(ws)
        
        # Clean up disconnected sockets
        for ws in disconnected:
            self.disconnect(ws)
    
    async def send_to_user(self, websocket: WebSocket, message: dict):
        """Send message to a specific user"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending to user: {e}")
            self.disconnect(websocket)

manager = ConnectionManager()

async def get_user_from_token(token: str) -> Optional[dict]:
    """Validate token and get user"""
    if not token:
        return None
    session = await db.sessions.find_one({"token": token})
    if not session:
        return None
    user = await db.users.find_one({"id": session["userId"]})
    return user

@router.websocket("/ws/lesson/{lesson_id}")
async def websocket_lesson_endpoint(
    websocket: WebSocket, 
    lesson_id: str,
    token: str = Query(None)
):
    """WebSocket endpoint for real-time lesson collaboration"""
    
    # Authenticate user
    user = await get_user_from_token(token)
    if not user:
        await websocket.close(code=4001, reason="Unauthorized")
        return
    
    user_id = user["id"]
    user_name = user.get("name", user.get("email", "Unknown"))
    
    await manager.connect(websocket, lesson_id, user_id, user_name)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            message_type = data.get("type")
            
            if message_type == "cursor":
                # User is moving cursor - broadcast position
                await manager.broadcast_to_lesson(lesson_id, {
                    "type": "cursor",
                    "userId": user_id,
                    "userName": user_name,
                    "position": data.get("position"),
                    "sectionIndex": data.get("sectionIndex")
                }, exclude_websocket=websocket)
                
            elif message_type == "typing":
                # User is typing - broadcast typing indicator
                await manager.broadcast_to_lesson(lesson_id, {
                    "type": "typing",
                    "userId": user_id,
                    "userName": user_name,
                    "sectionIndex": data.get("sectionIndex"),
                    "isTyping": data.get("isTyping", True)
                }, exclude_websocket=websocket)
                
            elif message_type == "edit":
                # User made an edit - broadcast the change
                edit_data = {
                    "type": "edit",
                    "userId": user_id,
                    "userName": user_name,
                    "sectionIndex": data.get("sectionIndex"),
                    "field": data.get("field"),
                    "value": data.get("value"),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                await manager.broadcast_to_lesson(lesson_id, edit_data, exclude_websocket=websocket)
                
                # Optionally save to database
                if data.get("persist", False):
                    await save_lesson_edit(lesson_id, data, user_id)
                
            elif message_type == "section_focus":
                # User focused on a section
                await manager.broadcast_to_lesson(lesson_id, {
                    "type": "section_focus",
                    "userId": user_id,
                    "userName": user_name,
                    "sectionIndex": data.get("sectionIndex")
                }, exclude_websocket=websocket)
                
            elif message_type == "ping":
                # Keep-alive ping
                await manager.send_to_user(websocket, {"type": "pong"})
                
            elif message_type == "get_active_users":
                # Request list of active users
                await manager.send_to_user(websocket, {
                    "type": "active_users",
                    "users": manager.get_active_users(lesson_id)
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

async def save_lesson_edit(lesson_id: str, edit_data: dict, user_id: str):
    """Save lesson edit to database"""
    try:
        field = edit_data.get("field")
        value = edit_data.get("value")
        section_index = edit_data.get("sectionIndex")
        
        if field == "content" and section_index is not None:
            # Update section content
            lesson = await db.lessons.find_one({"id": lesson_id})
            if lesson:
                sections = lesson.get("sectionsJson", "[]")
                if isinstance(sections, str):
                    sections = json.loads(sections)
                
                if 0 <= section_index < len(sections):
                    sections[section_index]["content"] = value
                    await db.lessons.update_one(
                        {"id": lesson_id},
                        {"$set": {
                            "sectionsJson": json.dumps(sections),
                            "updatedAt": datetime.now(timezone.utc).isoformat()
                        }}
                    )
                    
        elif field == "title":
            await db.lessons.update_one(
                {"id": lesson_id},
                {"$set": {
                    "title": value,
                    "updatedAt": datetime.now(timezone.utc).isoformat()
                }}
            )
            
    except Exception as e:
        logger.error(f"Error saving lesson edit: {e}")

# REST endpoint to get active users (for initial load)
@router.get("/collaboration/{lesson_id}/users")
async def get_lesson_collaborators(lesson_id: str):
    """Get list of users currently viewing/editing a lesson"""
    return {
        "lessonId": lesson_id,
        "activeUsers": manager.get_active_users(lesson_id)
    }
