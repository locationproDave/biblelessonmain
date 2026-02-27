# User Profile Routes
from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel

from services.database import db

router = APIRouter(prefix="/user", tags=["User Profile"])

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatarUrl: Optional[str] = None
    bio: Optional[str] = None
    churchName: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None

def serialize_doc(doc: dict) -> dict:
    if doc is None:
        return None
    result = {k: v for k, v in doc.items() if k != '_id'}
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

@router.get("/profile")
async def get_user_profile(authorization: str = Header(None)):
    """Get current user's profile"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": session["userId"]}, {"_id": 0, "passwordHash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get preferences
    prefs = await db.preferences.find_one({"userId": session["userId"]}, {"_id": 0})
    
    # Get subscription info
    subscription = await db.subscriptions.find_one({"userId": session["userId"]}, {"_id": 0})
    
    # Get lesson stats
    total_lessons = await db.lessons.count_documents({"userId": session["userId"]})
    completed_lessons = await db.progress.count_documents({
        "userId": session["userId"],
        "status": "completed"
    })
    
    return {
        **user,
        "preferences": prefs,
        "subscription": subscription,
        "stats": {
            "totalLessons": total_lessons,
            "completedLessons": completed_lessons,
            "memberSince": user.get("createdAt")
        }
    }

@router.put("/profile")
async def update_user_profile(data: UserProfileUpdate, authorization: str = Header(None)):
    """Update user's profile"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"id": session["userId"]},
        {"$set": update_data}
    )
    
    user = await db.users.find_one({"id": session["userId"]}, {"_id": 0, "passwordHash": 0})
    return user

@router.get("/activity")
async def get_user_activity(authorization: str = Header(None), limit: int = 20):
    """Get user's recent activity"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get recent lessons created
    recent_lessons = await db.lessons.find(
        {"userId": session["userId"]},
        {"_id": 0, "id": 1, "title": 1, "createdAt": 1}
    ).sort("createdAt", -1).limit(limit).to_list(limit)
    
    # Get recent progress updates
    recent_progress = await db.progress.find(
        {"userId": session["userId"]},
        {"_id": 0}
    ).sort("updatedAt", -1).limit(limit).to_list(limit)
    
    # Combine and sort by date
    activities = []
    
    for lesson in recent_lessons:
        activities.append({
            "type": "lesson_created",
            "title": f"Created lesson: {lesson.get('title', 'Untitled')}",
            "lessonId": lesson.get("id"),
            "timestamp": lesson.get("createdAt")
        })
    
    for progress in recent_progress:
        lesson = await db.lessons.find_one({"id": progress.get("lessonId")}, {"title": 1})
        lesson_title = lesson.get("title", "Unknown") if lesson else "Unknown"
        activities.append({
            "type": f"lesson_{progress.get('status', 'updated')}",
            "title": f"Updated progress: {lesson_title}",
            "lessonId": progress.get("lessonId"),
            "status": progress.get("status"),
            "timestamp": progress.get("updatedAt") or progress.get("createdAt")
        })
    
    # Sort by timestamp
    activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    return activities[:limit]

@router.get("/lessons")
async def get_user_lessons(authorization: str = Header(None), limit: int = 50, offset: int = 0):
    """Get all lessons created by user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    total = await db.lessons.count_documents({"userId": session["userId"]})
    lessons = await db.lessons.find(
        {"userId": session["userId"]},
        {"_id": 0}
    ).sort("createdAt", -1).skip(offset).limit(limit).to_list(limit)
    
    return {
        "total": total,
        "lessons": lessons,
        "offset": offset,
        "limit": limit
    }
