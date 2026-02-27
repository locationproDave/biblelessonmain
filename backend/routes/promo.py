# Promo Code Routes
from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone

from models.schemas import PromoCodeValidate
from services.database import db

router = APIRouter(prefix="/promo", tags=["Promo Codes"])

def serialize_doc(doc: dict) -> dict:
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

@router.post("/validate")
async def validate_promo_code(data: PromoCodeValidate):
    """Validate a promo code"""
    promo = await db.promo_codes.find_one({
        "code": data.code.upper(),
        "active": True
    })
    
    if not promo:
        return {"valid": False, "message": "Invalid promo code"}
    
    # Check expiration
    if promo.get("validUntil"):
        expiry = datetime.fromisoformat(promo["validUntil"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expiry:
            return {"valid": False, "message": "Promo code has expired"}
    
    # Check max uses
    if promo.get("usedCount", 0) >= promo.get("maxUses", 100):
        return {"valid": False, "message": "Promo code has reached maximum uses"}
    
    # Check applicable plans
    applicable_plans = promo.get("applicablePlans", [])
    if applicable_plans and data.planId not in applicable_plans:
        return {"valid": False, "message": "Promo code not valid for this plan"}
    
    return {
        "valid": True,
        "code": promo["code"],
        "discountPercent": promo.get("discountPercent", 0),
        "message": f"{promo.get('discountPercent', 0)}% discount applied!"
    }

@router.post("/use")
async def use_promo_code(data: PromoCodeValidate, authorization: str = Header(None)):
    """Mark a promo code as used"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Increment usage count
    result = await db.promo_codes.update_one(
        {"code": data.code.upper(), "active": True},
        {
            "$inc": {"usedCount": 1},
            "$push": {"usedBy": {"userId": user["id"], "usedAt": datetime.now(timezone.utc).isoformat()}}
        }
    )
    
    return {"success": result.modified_count > 0}
