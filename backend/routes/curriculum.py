# Curriculum Routes
from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
import uuid

from models.schemas import CurriculumPlanCreate, CurriculumPlanUpdate
from services.database import db

router = APIRouter(prefix="/curriculum", tags=["Curriculum Planner"])

def serialize_doc(doc: dict) -> dict:
    """Remove MongoDB _id and convert datetimes"""
    if doc is None:
        return None
    result = {k: v for k, v in doc.items() if k != '_id'}
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

@router.get("")
async def get_curriculum_plans(authorization: str = Header(None)):
    """Get all curriculum plans for the user"""
    if not authorization:
        return []
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return []
    
    plans = await db.curriculum_plans.find({"userId": session["userId"]}, {"_id": 0}).to_list(100)
    return plans

@router.post("")
async def create_curriculum_plan(data: CurriculumPlanCreate, authorization: str = Header(None)):
    """Create a new curriculum plan"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    plan = {
        "id": str(uuid.uuid4()),
        "userId": session["userId"],
        **data.model_dump(),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.curriculum_plans.insert_one(plan)
    return serialize_doc(plan)

@router.get("/{plan_id}")
async def get_curriculum_plan(plan_id: str):
    """Get a specific curriculum plan"""
    plan = await db.curriculum_plans.find_one({"id": plan_id}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Curriculum plan not found")
    return plan

@router.put("/{plan_id}")
async def update_curriculum_plan(plan_id: str, data: CurriculumPlanUpdate, authorization: str = Header(None)):
    """Update a curriculum plan"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.curriculum_plans.update_one({"id": plan_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Curriculum plan not found")
    
    plan = await db.curriculum_plans.find_one({"id": plan_id}, {"_id": 0})
    return plan

@router.delete("/{plan_id}")
async def delete_curriculum_plan(plan_id: str, authorization: str = Header(None)):
    """Delete a curriculum plan"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    result = await db.curriculum_plans.delete_one({"id": plan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Curriculum plan not found")
    return {"message": "Deleted"}
