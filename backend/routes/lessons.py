# Lessons Routes
from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
import uuid
from typing import Optional

from models.schemas import LessonCreate
from services.database import db

router = APIRouter(prefix="/lessons", tags=["Lessons"])

def serialize_doc(doc: dict) -> dict:
    """Remove MongoDB _id and convert datetimes"""
    if doc is None:
        return None
    result = {k: v for k, v in doc.items() if k != '_id'}
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

async def get_current_user(token: str = None) -> dict:
    if not token:
        return None
    session = await db.sessions.find_one({"token": token})
    if not session:
        return None
    user = await db.users.find_one({"id": session["userId"]})
    return serialize_doc(user)

async def check_subscription_limit(user_id: str) -> dict:
    """Check if user has reached their lesson limit"""
    subscription = await db.subscriptions.find_one({"userId": user_id})
    
    plan_limits = {
        "free": 3,
        "starter": 25,
        "professional": 100,
        "ministry": 999999
    }
    
    if not subscription:
        plan_id = "free"
        limit = plan_limits["free"]
    else:
        plan_id = subscription.get("planId", "free")
        limit = plan_limits.get(plan_id, 3)
    
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    lessons_count = await db.lessons.count_documents({
        "userId": user_id,
        "createdAt": {"$gte": month_start.isoformat()}
    })
    
    return {
        "allowed": lessons_count < limit,
        "used": lessons_count,
        "limit": limit,
        "planId": plan_id,
        "remaining": max(0, limit - lessons_count)
    }

@router.get("/search")
async def search_lessons(q: str):
    """Search lessons by title, passage, or topic"""
    if len(q) < 2:
        return []
    
    cursor = db.lessons.find({
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"passage": {"$regex": q, "$options": "i"}},
            {"topic": {"$regex": q, "$options": "i"}},
            {"theme": {"$regex": q, "$options": "i"}}
        ]
    }, {"_id": 0}).limit(10)
    
    lessons = await cursor.to_list(length=10)
    return lessons

@router.get("")
async def get_lessons(ageGroup: Optional[str] = None, favorite: Optional[str] = None):
    query = {}
    if ageGroup:
        query["ageGroup"] = ageGroup
    if favorite == "true":
        query["favorite"] = True
    
    lessons = await db.lessons.find(query, {"_id": 0}).to_list(1000)
    return lessons

@router.get("/{lesson_id}")
async def get_lesson(lesson_id: str):
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.post("")
async def create_lesson(data: LessonCreate, authorization: str = Header(None)):
    lesson_id = str(uuid.uuid4())
    user_id = None
    
    if authorization:
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        session = await db.sessions.find_one({"token": token})
        if session:
            user_id = session["userId"]
            
            # Check subscription limit before creating lesson
            limit_check = await check_subscription_limit(user_id)
            if not limit_check["allowed"]:
                raise HTTPException(
                    status_code=403, 
                    detail=f"Lesson limit reached. You've used {limit_check['used']}/{limit_check['limit']} lessons this month. Upgrade your plan to create more."
                )
    
    lesson = {
        "id": lesson_id,
        "userId": user_id,
        **data.model_dump(),
        "favorite": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.lessons.insert_one(lesson)
    return serialize_doc(lesson)

@router.put("/{lesson_id}")
async def update_lesson(lesson_id: str, data: dict):
    result = await db.lessons.update_one({"id": lesson_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lesson not found")
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    return lesson

@router.delete("/{lesson_id}")
async def delete_lesson(lesson_id: str):
    result = await db.lessons.delete_one({"id": lesson_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"message": "Deleted"}

@router.post("/{lesson_id}/favorite")
async def toggle_favorite(lesson_id: str):
    lesson = await db.lessons.find_one({"id": lesson_id})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    new_favorite = not lesson.get("favorite", False)
    await db.lessons.update_one({"id": lesson_id}, {"$set": {"favorite": new_favorite}})
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    return lesson
