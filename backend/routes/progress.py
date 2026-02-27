# Progress Tracker Routes
from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
import uuid

from models.schemas import ProgressUpdate
from services.database import db

router = APIRouter(prefix="/progress", tags=["Progress Tracker"])

@router.get("")
async def get_user_progress(authorization: str = Header(None)):
    """Get all progress records for the user"""
    if not authorization:
        return []
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return []
    
    progress = await db.progress.find({"userId": session["userId"]}, {"_id": 0}).to_list(1000)
    return progress

@router.get("/stats/summary")
async def get_progress_summary(authorization: str = Header(None)):
    """Get summary statistics for user progress"""
    if not authorization:
        return {"total": 0, "completed": 0, "inProgress": 0, "notStarted": 0}
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return {"total": 0, "completed": 0, "inProgress": 0, "notStarted": 0}
    
    all_progress = await db.progress.find({"userId": session["userId"]}, {"_id": 0}).to_list(1000)
    
    completed = sum(1 for p in all_progress if p.get("status") == "completed")
    in_progress = sum(1 for p in all_progress if p.get("status") == "in_progress")
    
    return {
        "total": len(all_progress),
        "completed": completed,
        "inProgress": in_progress,
        "notStarted": len(all_progress) - completed - in_progress,
        "completionRate": round((completed / len(all_progress) * 100) if all_progress else 0, 1)
    }

@router.get("/{lesson_id}")
async def get_lesson_progress(lesson_id: str, authorization: str = Header(None)):
    """Get progress for a specific lesson"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    progress = await db.progress.find_one(
        {"userId": session["userId"], "lessonId": lesson_id}, 
        {"_id": 0}
    )
    return progress or {"lessonId": lesson_id, "status": "not_started", "completedSections": []}

@router.post("")
async def update_progress(data: ProgressUpdate, authorization: str = Header(None)):
    """Update progress for a lesson"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    progress_data = {
        "userId": session["userId"],
        "lessonId": data.lessonId,
        "status": data.status,
        "completedSections": data.completedSections,
        "notes": data.notes,
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    existing = await db.progress.find_one({"userId": session["userId"], "lessonId": data.lessonId})
    
    if existing:
        await db.progress.update_one(
            {"userId": session["userId"], "lessonId": data.lessonId},
            {"$set": progress_data}
        )
    else:
        progress_data["id"] = str(uuid.uuid4())
        progress_data["createdAt"] = datetime.now(timezone.utc).isoformat()
        await db.progress.insert_one(progress_data)
    
    progress = await db.progress.find_one(
        {"userId": session["userId"], "lessonId": data.lessonId},
        {"_id": 0}
    )
    return progress
