"""
Bible Lesson Planner API - Main Server
Refactored to use modular routing structure
"""
from fastapi import FastAPI
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(
    title="Bible Lesson Planner API",
    description="AI-powered Bible lesson planning for Sunday School teachers",
    version="2.0.0"
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS middleware - must be added before routes
# Note: allow_credentials=True with allow_origins=["*"] is invalid per CORS spec
# Mobile browsers strictly enforce this, causing login failures
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include all routers
from routes import (
    auth_router,
    lessons_router,
    curriculum_router,
    progress_router,
    promo_router,
    calendar_router,
    export_router,
    ai_router,
    team_router,
    payments_router,
    preferences_router,
    contact_router,
    user_router,
    notifications_router,
    series_router,
    websocket_router
)
from routes.admin import router as admin_router
from routes.chatbot import router as chatbot_router

# Include all routers with /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(lessons_router, prefix="/api")
app.include_router(curriculum_router, prefix="/api")
app.include_router(progress_router, prefix="/api")
app.include_router(promo_router, prefix="/api")
app.include_router(calendar_router, prefix="/api")
app.include_router(export_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(team_router, prefix="/api")
app.include_router(payments_router, prefix="/api")
app.include_router(preferences_router, prefix="/api")
app.include_router(contact_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(series_router, prefix="/api")
app.include_router(websocket_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(chatbot_router, prefix="/api")

# Health check endpoint for Kubernetes
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "bible-lesson-planner-api"}

# Email delivery route (kept separate for legacy compatibility)
from fastapi import Header, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from services.database import db
import asyncio
import json

class EmailLessonRequest(BaseModel):
    lessonId: str
    recipientEmail: EmailStr
    recipientName: Optional[str] = None
    scheduleFor: Optional[str] = None

try:
    import resend
    resend.api_key = os.environ.get('RESEND_API_KEY')
    SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
except ImportError:
    resend = None
    SENDER_EMAIL = None

@app.post("/api/email/send-lesson")
async def send_lesson_email(request: EmailLessonRequest, authorization: str = Header(None)):
    """Send a lesson via email"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    lesson = await db.lessons.find_one({"id": request.lessonId}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Parse sections
    if isinstance(lesson.get("sectionsJson"), str):
        try:
            sections = json.loads(lesson.get("sectionsJson", "[]"))
        except:
            sections = []
    else:
        sections = lesson.get("sectionsJson", [])
    
    sections_html = ""
    for section in sections:
        if isinstance(section, dict):
            sections_html += f"""
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 8px 0; color: #1E3A5F;">{section.get('icon', '📖')} {section.get('title', 'Section')}</h3>
                    <p style="margin: 0 0 5px 0; color: #6B7280; font-size: 12px;">Duration: {section.get('duration', 'N/A')}</p>
                    <p style="margin: 0; color: #374151;">{section.get('content', '')}</p>
                </td>
            </tr>
            """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{lesson.get('title', 'Bible Lesson')}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f8fc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <tr>
                <td style="background: linear-gradient(135deg, #1E3A5F 0%, #D4A017 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">{lesson.get('title', 'Bible Lesson')}</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">📖 {lesson.get('passage', 'Scripture')}</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 25px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                        <tr>
                            <td style="background-color: #EBF5FF; padding: 15px; border-radius: 8px;">
                                <p style="margin: 0; font-size: 14px;"><strong>Age Group:</strong> {lesson.get('ageGroup', 'All Ages')}</p>
                                <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Duration:</strong> {lesson.get('duration', '45 min')}</p>
                                <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Theme:</strong> {lesson.get('theme', 'Gods Love')}</p>
                            </td>
                        </tr>
                    </table>
                    
                    <h2 style="color: #1E3A5F; border-bottom: 2px solid #D4A017; padding-bottom: 10px;">Memory Verse</h2>
                    <blockquote style="background-color: #FEF3C7; padding: 15px; border-left: 4px solid #D4A017; margin: 0 0 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; font-style: italic; color: #374151;">"{lesson.get('memoryVerseText', 'The Lord is my shepherd.')}"</p>
                        <p style="margin: 5px 0 0 0; font-weight: bold; color: #1E3A5F;">— {lesson.get('memoryVerseReference', 'Psalm 23:1')}</p>
                    </blockquote>
                    
                    <h2 style="color: #1E3A5F; border-bottom: 2px solid #D4A017; padding-bottom: 10px;">Lesson Sections</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        {sections_html}
                    </table>
                </td>
            </tr>
            <tr>
                <td style="background-color: #F5F8FC; padding: 20px; text-align: center;">
                    <p style="margin: 0; color: #6B7280; font-size: 12px;">Generated by Bible Lesson Planner</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    if not resend or not resend.api_key:
        raise HTTPException(status_code=500, detail="Email service not configured")
    
    params = {
        "from": SENDER_EMAIL,
        "to": [request.recipientEmail],
        "subject": f"📖 {lesson.get('title', 'Bible Lesson')} - {lesson.get('passage', 'Lesson')}",
        "html": html_content
    }
    
    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        
        await db.email_logs.insert_one({
            "lessonId": request.lessonId,
            "recipientEmail": request.recipientEmail,
            "status": "sent",
            "emailId": email.get("id"),
        })
        
        return {
            "status": "success",
            "message": f"Lesson sent to {request.recipientEmail}",
            "emailId": email.get("id")
        }
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# Coupon validation routes (for backwards compatibility)
from pydantic import BaseModel as PydanticBaseModel
from datetime import datetime, timezone

class CouponValidate(PydanticBaseModel):
    code: str

@app.post("/api/coupons/validate")
async def validate_coupon(data: CouponValidate):
    """Validate a coupon code"""
    code_upper = data.code.upper().strip()
    
    coupon = await db.coupons.find_one({"code": code_upper})
    
    if not coupon:
        return {"valid": False, "message": "Invalid coupon code"}
    
    if not coupon.get("is_active", True):
        return {"valid": False, "message": "This coupon is no longer active"}
    
    if coupon.get("valid_until"):
        try:
            expiry = datetime.fromisoformat(coupon["valid_until"].replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > expiry:
                return {"valid": False, "message": "This coupon has expired"}
        except:
            pass
    
    if coupon.get("max_uses"):
        if coupon.get("times_used", 0) >= coupon["max_uses"]:
            return {"valid": False, "message": "This coupon has reached its usage limit"}
    
    return {
        "valid": True,
        "code": code_upper,
        "discount_type": coupon.get("discount_type", "free_trial"),
        "discount_value": coupon.get("discount_value", 0),
        "description": coupon.get("description", ""),
        "message": "Coupon applied successfully!"
    }

@app.post("/api/coupons/use")
async def use_coupon(data: CouponValidate, authorization: str = Header(None)):
    """Mark a coupon as used"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    code_upper = data.code.upper().strip()
    
    result = await db.coupons.update_one(
        {"code": code_upper},
        {"$inc": {"times_used": 1}}
    )
    
    return {"success": result.modified_count > 0}

# Health check endpoint
@app.get("/api/health")
async def api_health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "2.0.0"}

# Root redirect
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Bible Lesson Planner API v2.0.0", "docs": "/docs"}

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database collections and sample data"""
    logger.info("Starting Bible Lesson Planner API v2.0.0")
    
    # Start the analytics scheduler
    from services.analytics_scheduler import start_scheduler
    start_scheduler()
    logger.info("Analytics scheduler started")
    
    # Ensure admin user exists with proper role and password
    import hashlib
    admin_email = "hello@biblelessonplanner.com"
    admin_password_hash = hashlib.sha256("Truman310".encode()).hexdigest()
    
    existing_admin = await db.users.find_one({"email": admin_email})
    if existing_admin:
        # Update to ensure admin role and password
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"role": "admin", "passwordHash": admin_password_hash}}
        )
        # Also ensure admin has onboarding completed
        admin_prefs = await db.preferences.find_one({"userId": existing_admin["id"]})
        if admin_prefs:
            await db.preferences.update_one(
                {"userId": existing_admin["id"]},
                {"$set": {"onboardingCompleted": True}}
            )
        else:
            import uuid
            await db.preferences.insert_one({
                "id": str(uuid.uuid4()),
                "userId": existing_admin["id"],
                "bibleVersion": "KJV",
                "onboardingCompleted": True,
            })
        logger.info(f"Updated admin user: {admin_email}")
    else:
        # Create admin user if not exists
        import uuid
        admin_id = str(uuid.uuid4())
        await db.users.insert_one({
            "id": admin_id,
            "email": admin_email,
            "name": "Admin",
            "passwordHash": admin_password_hash,
            "role": "admin",
            "createdAt": datetime.now(timezone.utc).isoformat(),
        })
        # Also create preferences with onboarding completed
        await db.preferences.insert_one({
            "id": str(uuid.uuid4()),
            "userId": admin_id,
            "bibleVersion": "KJV",
            "onboardingCompleted": True,
        })
        logger.info(f"Created admin user: {admin_email}")
    
    # Create sample coupons if needed
    try:
        existing = await db.coupons.find_one({"code": "BIBLE2026"})
        if not existing:
            await db.coupons.insert_one({
                "code": "BIBLE2026",
                "discount_type": "free_trial",
                "discount_value": 0,
                "description": "Free trial access",
                "is_active": True,
                "times_used": 0
            })
            logger.info("Created BIBLE2026 coupon")
    except Exception as e:
        logger.error(f"Error creating coupons: {e}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    from services.database import client
    from services.analytics_scheduler import stop_scheduler
    
    # Stop the analytics scheduler
    stop_scheduler()
    
    client.close()
    logger.info("Database connection closed")
