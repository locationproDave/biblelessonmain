# Team Management Routes
from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
import uuid
from typing import Optional

from models.schemas import TeamInvite, AcceptInvitation
from services.database import db

router = APIRouter(prefix="/team", tags=["Team Management"])

def serialize_doc(doc: dict) -> dict:
    if doc is None:
        return None
    result = {k: v for k, v in doc.items() if k != '_id'}
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

def generate_token() -> str:
    import secrets
    return secrets.token_urlsafe(32)

@router.get("/members")
async def get_team_members(authorization: str = Header(None)):
    if not authorization:
        return []
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return []
    members = await db.team_members.find({"ownerId": session["userId"]}, {"_id": 0}).to_list(100)
    return members

@router.get("/invitations")
async def get_team_invitations(authorization: str = Header(None), status: Optional[str] = None):
    if not authorization:
        return []
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return []
    query = {"ownerId": session["userId"]}
    if status:
        query["status"] = status
    invitations = await db.invitations.find(query, {"_id": 0}).to_list(100)
    return invitations

@router.get("/my-teams")
async def get_my_teams(authorization: str = Header(None)):
    if not authorization:
        return []
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return []
    teams = await db.team_members.find({"userId": session["userId"]}, {"_id": 0}).to_list(100)
    return teams

@router.post("/invite")
async def invite_member(data: TeamInvite, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    invitation = {
        "id": str(uuid.uuid4()),
        "ownerId": session["userId"],
        "email": data.email.lower(),
        "role": data.role,
        "status": "pending",
        "token": generate_token(),
        "invitedAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.invitations.insert_one(invitation)
    return serialize_doc(invitation)

@router.post("/accept-invitation")
async def accept_invitation(data: AcceptInvitation, authorization: str = Header(None)):
    invitation = await db.invitations.find_one({"token": data.token})
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if invitation["status"] != "pending":
        raise HTTPException(status_code=400, detail="Invitation already processed")
    
    user_id = None
    if authorization:
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        session = await db.sessions.find_one({"token": token})
        if session:
            user_id = session["userId"]
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Must be logged in to accept invitation")
    
    member = {
        "id": str(uuid.uuid4()),
        "ownerId": invitation["ownerId"],
        "userId": user_id,
        "email": invitation["email"],
        "role": invitation["role"],
        "joinedAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.team_members.insert_one(member)
    
    await db.invitations.update_one(
        {"id": invitation["id"]},
        {"$set": {"status": "accepted", "acceptedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    return serialize_doc(member)

@router.delete("/members/{member_id}")
async def revoke_member(member_id: str, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    result = await db.team_members.delete_one({"id": member_id, "ownerId": session["userId"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member removed"}

@router.delete("/invitations/{invitation_id}")
async def cancel_invitation(invitation_id: str, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    result = await db.invitations.delete_one({"id": invitation_id, "ownerId": session["userId"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return {"message": "Invitation cancelled"}
