# Auth Routes
from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from datetime import datetime, timezone
import hashlib
import secrets
import uuid
import os
import requests
import logging

from models.schemas import UserCreate, UserLogin
from services.database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Email configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
ADMIN_EMAIL = "hello@biblelessonplanner.com"

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

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

def send_new_user_notification_email(user_name: str, user_email: str):
    """Send email notification to admin when a new user signs up"""
    logger.info(f"[Auth] Attempting to send new user notification for {user_email}")
    if not RESEND_API_KEY:
        logger.warning(f"[Auth] Email skipped - RESEND_API_KEY not configured")
        return False
    
    try:
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 24px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 24px; }}
                .content {{ padding: 32px; }}
                .user-info {{ background: #fef3c7; border-radius: 12px; padding: 20px; margin: 16px 0; }}
                .footer {{ padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New User Signup!</h1>
                </div>
                <div class="content">
                    <h2 style="color: #1f2937; margin-top: 0;">A new user has joined Bible Lesson Planner</h2>
                    <div class="user-info">
                        <p style="margin: 0;"><strong>Name:</strong> {user_name}</p>
                        <p style="margin: 8px 0 0 0;"><strong>Email:</strong> {user_email}</p>
                        <p style="margin: 8px 0 0 0;"><strong>Signed up at:</strong> {datetime.now(timezone.utc).strftime('%B %d, %Y at %I:%M %p UTC')}</p>
                    </div>
                    <p style="color: #6b7280;">This notification was sent because a new user registered on your platform.</p>
                </div>
                <div class="footer">
                    <p>Bible Lesson Planner - Rooted in Scripture</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        response = requests.post(
            'https://api.resend.com/emails',
            headers={
                'Authorization': f'Bearer {RESEND_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'from': 'Bible Lesson Planner <onboarding@resend.dev>',
                'to': [ADMIN_EMAIL],
                'subject': f'New User Signup: {user_name}',
                'html': html_content
            }
        )
        
        if response.status_code in [200, 201]:
            logger.info(f"[Auth] New user notification sent to {ADMIN_EMAIL}")
            return True
        else:
            logger.error(f"[Auth] Email failed: {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"[Auth] Email error: {e}")
        return False

@router.post("/signup")
async def signup(data: UserCreate, background_tasks: BackgroundTasks):
    # Check if user exists
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": data.email.lower(),
        "name": data.name,
        "passwordHash": hash_password(data.password),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    
    # Create session
    token = generate_token()
    await db.sessions.insert_one({
        "token": token,
        "userId": user_id,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    })
    
    # Create default preferences
    await db.preferences.insert_one({
        "id": str(uuid.uuid4()),
        "userId": user_id,
        "bibleVersion": "KJV",
        "onboardingCompleted": False,
    })
    
    # Send new user notification email in background
    background_tasks.add_task(send_new_user_notification_email, data.name, data.email.lower())
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": data.email.lower(),
            "name": data.name,
            "role": "user",
        }
    }

@router.post("/signin")
async def signin(data: UserLogin):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or user.get("passwordHash") != hash_password(data.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    token = generate_token()
    await db.sessions.insert_one({
        "token": token,
        "userId": user["id"],
        "createdAt": datetime.now(timezone.utc).isoformat(),
    })
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name"),
            "role": user.get("role", "user"),
        }
    }

@router.get("/session")
async def get_session(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "")
    session = await db.sessions.find_one({"token": token})
    if not session:
        return None
    user = await db.users.find_one({"id": session["userId"]})
    if not user:
        return None
    return {
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name"),
            "role": user.get("role", "user"),
        }
    }
