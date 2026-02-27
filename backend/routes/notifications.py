# Notification Routes for Bible Lesson Planner
from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Literal
from datetime import datetime, timezone
import uuid
import os

from services.database import db

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# Email configuration (using Resend if available)
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')

class NotificationCreate(BaseModel):
    type: Literal['lesson_shared', 'team_invite', 'lesson_edited', 'reminder', 'success', 'info', 'warning']
    title: str
    message: str
    recipientId: Optional[str] = None
    recipientEmail: Optional[EmailStr] = None
    lessonId: Optional[str] = None
    actionUrl: Optional[str] = None
    sendEmail: bool = True

class NotificationUpdate(BaseModel):
    read: Optional[bool] = None

class EmailPreferences(BaseModel):
    lessonShared: bool = True
    teamInvite: bool = True
    lessonEdited: bool = True
    reminders: bool = True

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

async def send_notification_email(notification: dict, recipient_email: str, recipient_name: str = ""):
    """Send email notification using Resend API"""
    if not RESEND_API_KEY:
        print(f"[Notifications] Email skipped - RESEND_API_KEY not configured")
        return False
    
    try:
        import requests
        
        # Map notification types to email subjects
        type_subjects = {
            'lesson_shared': f"📚 {notification['title']}",
            'team_invite': f"👥 {notification['title']}",
            'lesson_edited': f"✏️ {notification['title']}",
            'reminder': f"⏰ {notification['title']}",
            'success': f"✅ {notification['title']}",
            'info': f"ℹ️ {notification['title']}",
            'warning': f"⚠️ {notification['title']}",
        }
        
        subject = type_subjects.get(notification['type'], notification['title'])
        
        # Build HTML email
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
                .message {{ color: #374151; font-size: 16px; line-height: 1.6; }}
                .button {{ display: inline-block; margin-top: 24px; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }}
                .footer {{ padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Bible Lesson Planner</h1>
                </div>
                <div class="content">
                    <h2 style="color: #1f2937; margin-top: 0;">{notification['title']}</h2>
                    <p class="message">{notification['message']}</p>
                    {'<a href="' + notification.get('actionUrl', 'https://biblelessonplanner.com') + '" class="button">View Details</a>' if notification.get('actionUrl') else ''}
                </div>
                <div class="footer">
                    <p>Bible Lesson Planner - Rooted in Scripture</p>
                    <p>You received this email because of your notification preferences.</p>
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
                'to': [recipient_email],
                'subject': subject,
                'html': html_content
            }
        )
        
        if response.status_code in [200, 201]:
            print(f"[Notifications] Email sent to {recipient_email}")
            return True
        else:
            print(f"[Notifications] Email failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"[Notifications] Email error: {e}")
        return False

@router.get("")
async def get_notifications(authorization: str = Header(None), limit: int = 50):
    """Get notifications for the current user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    notifications = await db.notifications.find(
        {"recipientId": user['id']}
    ).sort("createdAt", -1).limit(limit).to_list(limit)
    
    return {
        "notifications": [serialize_doc(n) for n in notifications],
        "unreadCount": sum(1 for n in notifications if not n.get('read', False))
    }

@router.post("")
async def create_notification(
    data: NotificationCreate, 
    background_tasks: BackgroundTasks,
    authorization: str = Header(None)
):
    """Create a new notification"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    sender = await get_current_user(token)
    if not sender:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Find recipient
    recipient = None
    if data.recipientId:
        recipient = await db.users.find_one({"id": data.recipientId})
    elif data.recipientEmail:
        recipient = await db.users.find_one({"email": data.recipientEmail})
    
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Create notification
    notification = {
        "id": f"notif-{uuid.uuid4().hex[:12]}",
        "type": data.type,
        "title": data.title,
        "message": data.message,
        "recipientId": recipient['id'],
        "senderId": sender['id'],
        "senderName": sender.get('name', sender.get('email', 'Someone')),
        "lessonId": data.lessonId,
        "actionUrl": data.actionUrl,
        "read": False,
        "createdAt": datetime.now(timezone.utc),
    }
    
    await db.notifications.insert_one(notification)
    
    # Send email notification in background if enabled
    if data.sendEmail:
        # Check user's email preferences
        email_prefs = recipient.get('emailPreferences', {})
        should_send_email = True
        
        if data.type == 'lesson_shared' and not email_prefs.get('lessonShared', True):
            should_send_email = False
        elif data.type == 'team_invite' and not email_prefs.get('teamInvite', True):
            should_send_email = False
        elif data.type == 'lesson_edited' and not email_prefs.get('lessonEdited', True):
            should_send_email = False
        elif data.type == 'reminder' and not email_prefs.get('reminders', True):
            should_send_email = False
        
        if should_send_email:
            background_tasks.add_task(
                send_notification_email,
                serialize_doc(notification),
                recipient['email'],
                recipient.get('name', '')
            )
    
    return {"success": True, "notification": serialize_doc(notification)}

@router.patch("/{notification_id}")
async def update_notification(notification_id: str, data: NotificationUpdate, authorization: str = Header(None)):
    """Update a notification (mark as read)"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    update_data = {}
    if data.read is not None:
        update_data['read'] = data.read
    
    if update_data:
        await db.notifications.update_one(
            {"id": notification_id, "recipientId": user['id']},
            {"$set": update_data}
        )
    
    return {"success": True}

@router.post("/mark-all-read")
async def mark_all_read(authorization: str = Header(None)):
    """Mark all notifications as read"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    result = await db.notifications.update_many(
        {"recipientId": user['id'], "read": False},
        {"$set": {"read": True}}
    )
    
    return {"success": True, "updatedCount": result.modified_count}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, authorization: str = Header(None)):
    """Delete a notification"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    await db.notifications.delete_one({"id": notification_id, "recipientId": user['id']})
    
    return {"success": True}

@router.delete("")
async def clear_all_notifications(authorization: str = Header(None)):
    """Clear all notifications for the current user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    result = await db.notifications.delete_many({"recipientId": user['id']})
    
    return {"success": True, "deletedCount": result.deleted_count}

@router.get("/preferences")
async def get_email_preferences(authorization: str = Header(None)):
    """Get user's email notification preferences"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Default preferences if not set
    default_prefs = {
        "lessonShared": True,
        "teamInvite": True,
        "lessonEdited": True,
        "reminders": True,
    }
    
    user_prefs = user.get('emailPreferences', default_prefs)
    
    return {"preferences": {**default_prefs, **user_prefs}}

@router.put("/preferences")
async def update_email_preferences(data: EmailPreferences, authorization: str = Header(None)):
    """Update user's email notification preferences"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    await db.users.update_one(
        {"id": user['id']},
        {"$set": {"emailPreferences": data.model_dump()}}
    )
    
    return {"success": True, "preferences": data.model_dump()}
