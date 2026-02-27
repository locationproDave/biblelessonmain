# User Preferences Routes
from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
import uuid

from services.database import db

router = APIRouter(prefix="/preferences", tags=["Preferences"])

@router.get("")
async def get_preferences(authorization: str = Header(None)):
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return None
    prefs = await db.preferences.find_one({"userId": session["userId"]}, {"_id": 0})
    return prefs

@router.get("/bible-version")
async def get_bible_version(authorization: str = Header(None)):
    if not authorization:
        return {"bibleVersion": "KJV"}
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return {"bibleVersion": "KJV"}
    prefs = await db.preferences.find_one({"userId": session["userId"]})
    return {"bibleVersion": prefs.get("bibleVersion", "KJV") if prefs else "KJV"}

@router.put("/bible-version")
async def set_bible_version(data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    await db.preferences.update_one(
        {"userId": session["userId"]},
        {"$set": {"bibleVersion": data.get("bibleVersion", "KJV")}},
        upsert=True
    )
    prefs = await db.preferences.find_one({"userId": session["userId"]}, {"_id": 0})
    return prefs

@router.get("/onboarding-status")
async def get_onboarding_status(authorization: str = Header(None)):
    if not authorization:
        return {"completed": False}
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return {"completed": False}
    prefs = await db.preferences.find_one({"userId": session["userId"]})
    return {"completed": prefs.get("onboardingCompleted", False) if prefs else False}

@router.post("/complete-onboarding")
async def complete_onboarding(data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    update_data = {
        "onboardingCompleted": True,
        "bibleVersion": data.get("bibleVersion", "KJV"),
    }
    if data.get("ministryRole"):
        update_data["ministryRole"] = data["ministryRole"]
    if data.get("preferredAgeGroup"):
        update_data["preferredAgeGroup"] = data["preferredAgeGroup"]
    
    await db.preferences.update_one(
        {"userId": session["userId"]},
        {"$set": update_data},
        upsert=True
    )
    prefs = await db.preferences.find_one({"userId": session["userId"]}, {"_id": 0})
    return prefs
