# Series Routes - Lesson Collections/Series Management
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from services.database import db

router = APIRouter(prefix="/series", tags=["Series"])

# Pydantic Models
class SeriesCreate(BaseModel):
    name: str
    summary: str
    theme: str
    ageGroup: str
    lessonIds: List[str] = []

class SeriesUpdate(BaseModel):
    name: Optional[str] = None
    summary: Optional[str] = None
    theme: Optional[str] = None
    ageGroup: Optional[str] = None
    lessonIds: Optional[List[str]] = None

class LessonOrderUpdate(BaseModel):
    lessonIds: List[str]

# Series colors for visual distinction
SERIES_COLORS = [
    'from-indigo-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-violet-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
    'from-fuchsia-500 to-purple-600',
    'from-lime-500 to-green-600',
]

def pick_color(index: int) -> str:
    return SERIES_COLORS[index % len(SERIES_COLORS)]

def serialize_doc(doc: dict) -> dict:
    """Remove MongoDB _id and convert datetimes"""
    if doc is None:
        return None
    result = {k: v for k, v in doc.items() if k != '_id'}
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

async def get_user_from_token(authorization: str) -> dict:
    """Extract user from authorization token"""
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return None
    user = await db.users.find_one({"id": session["userId"]})
    return user

@router.get("")
async def get_all_series(authorization: str = Header(None)):
    """Get all series for the authenticated user"""
    user = await get_user_from_token(authorization)
    if not user:
        return []
    
    series_list = await db.series.find({"userId": user["id"]}, {"_id": 0}).to_list(100)
    return [serialize_doc(s) for s in series_list]

@router.post("")
async def create_series(data: SeriesCreate, authorization: str = Header(None)):
    """Create a new lesson series"""
    user = await get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Count existing series to assign color
    count = await db.series.count_documents({"userId": user["id"]})
    
    series = {
        "id": str(uuid.uuid4()),
        "userId": user["id"],
        "name": data.name,
        "summary": data.summary,
        "theme": data.theme,
        "ageGroup": data.ageGroup,
        "lessonIds": data.lessonIds,
        "color": pick_color(count),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.series.insert_one(series)
    return serialize_doc(series)

@router.get("/{series_id}")
async def get_series(series_id: str, authorization: str = Header(None)):
    """Get a specific series by ID"""
    series = await db.series.find_one({"id": series_id}, {"_id": 0})
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    return serialize_doc(series)

@router.put("/{series_id}")
async def update_series(series_id: str, data: SeriesUpdate, authorization: str = Header(None)):
    """Update a series"""
    user = await get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Check ownership
    series = await db.series.find_one({"id": series_id})
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    if series.get("userId") != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this series")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    await db.series.update_one({"id": series_id}, {"$set": update_data})
    
    updated_series = await db.series.find_one({"id": series_id}, {"_id": 0})
    return serialize_doc(updated_series)

@router.delete("/{series_id}")
async def delete_series(series_id: str, authorization: str = Header(None)):
    """Delete a series"""
    user = await get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Check ownership
    series = await db.series.find_one({"id": series_id})
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    if series.get("userId") != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this series")
    
    await db.series.delete_one({"id": series_id})
    return {"message": "Series deleted"}

@router.post("/{series_id}/lessons/{lesson_id}")
async def add_lesson_to_series(series_id: str, lesson_id: str, authorization: str = Header(None)):
    """Add a lesson to a series"""
    user = await get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    series = await db.series.find_one({"id": series_id})
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    if series.get("userId") != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    lesson_ids = series.get("lessonIds", [])
    if lesson_id not in lesson_ids:
        lesson_ids.append(lesson_id)
        await db.series.update_one(
            {"id": series_id}, 
            {"$set": {"lessonIds": lesson_ids, "updatedAt": datetime.now(timezone.utc).isoformat()}}
        )
    
    updated_series = await db.series.find_one({"id": series_id}, {"_id": 0})
    return serialize_doc(updated_series)

@router.delete("/{series_id}/lessons/{lesson_id}")
async def remove_lesson_from_series(series_id: str, lesson_id: str, authorization: str = Header(None)):
    """Remove a lesson from a series"""
    user = await get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    series = await db.series.find_one({"id": series_id})
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    if series.get("userId") != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    lesson_ids = series.get("lessonIds", [])
    if lesson_id in lesson_ids:
        lesson_ids.remove(lesson_id)
        await db.series.update_one(
            {"id": series_id}, 
            {"$set": {"lessonIds": lesson_ids, "updatedAt": datetime.now(timezone.utc).isoformat()}}
        )
    
    updated_series = await db.series.find_one({"id": series_id}, {"_id": 0})
    return serialize_doc(updated_series)

@router.put("/{series_id}/reorder")
async def reorder_lessons_in_series(series_id: str, data: LessonOrderUpdate, authorization: str = Header(None)):
    """Reorder lessons within a series"""
    user = await get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    series = await db.series.find_one({"id": series_id})
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    if series.get("userId") != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.series.update_one(
        {"id": series_id}, 
        {"$set": {"lessonIds": data.lessonIds, "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    updated_series = await db.series.find_one({"id": series_id}, {"_id": 0})
    return serialize_doc(updated_series)

@router.get("/{series_id}/lessons")
async def get_lessons_in_series(series_id: str, authorization: str = Header(None)):
    """Get all lessons in a series with full lesson data"""
    series = await db.series.find_one({"id": series_id}, {"_id": 0})
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    
    lesson_ids = series.get("lessonIds", [])
    if not lesson_ids:
        return []
    
    # Fetch lessons in order
    lessons = []
    for lid in lesson_ids:
        lesson = await db.lessons.find_one({"id": lid}, {"_id": 0})
        if lesson:
            lessons.append(serialize_doc(lesson))
    
    return lessons

@router.get("/stats/summary")
async def get_series_stats(authorization: str = Header(None)):
    """Get statistics about user's series"""
    user = await get_user_from_token(authorization)
    if not user:
        return {"total": 0, "totalLessons": 0, "themes": 0}
    
    series_list = await db.series.find({"userId": user["id"]}).to_list(100)
    
    total_lessons = sum(len(s.get("lessonIds", [])) for s in series_list)
    themes = set(s.get("theme", "") for s in series_list if s.get("theme"))
    
    return {
        "total": len(series_list),
        "totalLessons": total_lessons,
        "themes": len(themes)
    }
