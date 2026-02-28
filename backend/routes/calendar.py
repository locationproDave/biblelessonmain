# Calendar Sync Routes with Google Calendar Integration
from fastapi import APIRouter, HTTPException, Header, Request
from fastapi.responses import RedirectResponse
from datetime import datetime, timezone
import uuid
import os
import json
import requests

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from models.schemas import CalendarSyncRequest, CalendarEventCreate
from services.database import db

router = APIRouter(prefix="/calendar", tags=["Calendar Sync"])

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CALENDAR_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CALENDAR_CLIENT_SECRET')
GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email'
]

# Calendar ID Configuration
# - 'primary': Uses the user's main Google Calendar (default)
# - Custom ID: e.g., 'abc123@group.calendar.google.com' for a specific calendar
# - Can be overridden per-user or use a shared site calendar
GOOGLE_CALENDAR_ID = os.environ.get('GOOGLE_CALENDAR_ID', 'primary')
GOOGLE_SHARED_CALENDAR_ID = os.environ.get('GOOGLE_SHARED_CALENDAR_ID')  # Optional shared site calendar

# Get the frontend URL for redirects
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://biblelessonplanner.com')
BACKEND_URL = os.environ.get('BACKEND_URL', 'https://biblelessonplanner.com')

def serialize_doc(doc: dict) -> dict:
    if doc is None:
        return None
    result = {k: v for k, v in doc.items() if k != '_id'}
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

def get_calendar_id(user: dict = None, use_shared: bool = False) -> str:
    """
    Get the appropriate calendar ID based on configuration:
    1. If use_shared=True and GOOGLE_SHARED_CALENDAR_ID is set, use shared calendar
    2. If user has a custom calendar_id preference, use that
    3. If GOOGLE_CALENDAR_ID env var is set (not 'primary'), use that
    4. Default to 'primary' (user's main calendar)
    """
    # Option 3: Shared site calendar
    if use_shared and GOOGLE_SHARED_CALENDAR_ID:
        return GOOGLE_SHARED_CALENDAR_ID
    
    # Option 2: User's custom calendar preference
    if user and user.get('google_calendar_id'):
        return user['google_calendar_id']
    
    # Option 1: Site-wide configured calendar or default to 'primary'
    return GOOGLE_CALENDAR_ID

async def get_current_user(token: str = None) -> dict:
    if not token:
        return None
    session = await db.sessions.find_one({"token": token})
    if not session:
        return None
    user = await db.users.find_one({"id": session["userId"]})
    return serialize_doc(user)

def get_google_flow(redirect_uri: str):
    """Create Google OAuth flow"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return None
    
    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri]
        }
    }
    
    flow = Flow.from_client_config(
        client_config,
        scopes=GOOGLE_SCOPES,
        redirect_uri=redirect_uri
    )
    return flow

async def get_google_credentials(user_id: str):
    """Get Google credentials for a user, refreshing if needed"""
    user = await db.users.find_one({"id": user_id})
    if not user or 'google_calendar_tokens' not in user:
        return None
    
    tokens = user['google_calendar_tokens']
    
    creds = Credentials(
        token=tokens.get('access_token'),
        refresh_token=tokens.get('refresh_token'),
        token_uri='https://oauth2.googleapis.com/token',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=GOOGLE_SCOPES
    )
    
    # Refresh if expired
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(GoogleRequest())
            # Update stored tokens
            await db.users.update_one(
                {"id": user_id},
                {"$set": {
                    "google_calendar_tokens.access_token": creds.token
                }}
            )
        except Exception as e:
            print(f"Error refreshing credentials: {e}")
            # Clear invalid tokens
            await db.users.update_one(
                {"id": user_id},
                {"$unset": {"google_calendar_tokens": ""}}
            )
            return None
    
    return creds

@router.get("/google/status")
async def get_google_calendar_status(authorization: str = Header(None)):
    """Check if Google Calendar is connected"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Check if credentials are configured
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return {
            "connected": False,
            "configured": False,
            "message": "Google Calendar integration requires GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET to be configured"
        }
    
    # Check if user has connected their calendar
    full_user = await db.users.find_one({"id": user['id']})
    if full_user and 'google_calendar_tokens' in full_user:
        return {
            "connected": True,
            "configured": True,
            "email": full_user.get('google_calendar_email', 'Connected')
        }
    
    return {
        "connected": False,
        "configured": True,
        "message": "Click 'Connect Google Calendar' to enable direct sync"
    }

@router.get("/google/auth")
async def start_google_auth(authorization: str = Header(None)):
    """Start Google OAuth flow"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=400, 
            detail="Google Calendar credentials not configured. Please add GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET to your environment."
        )
    
    redirect_uri = f"{BACKEND_URL}/api/calendar/google/callback"
    flow = get_google_flow(redirect_uri)
    
    if not flow:
        raise HTTPException(status_code=400, detail="Could not initialize OAuth flow")
    
    # Generate authorization URL
    auth_url, state = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        include_granted_scopes='true'
    )
    
    # Store state with user token for callback verification
    await db.oauth_states.insert_one({
        "state": state,
        "user_token": token,
        "user_id": user['id'],
        "created_at": datetime.now(timezone.utc),
        "type": "google_calendar"
    })
    
    return {"authorization_url": auth_url, "state": state}

@router.get("/google/callback")
async def google_oauth_callback(code: str = None, state: str = None, error: str = None):
    """Handle Google OAuth callback"""
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/lessons?calendar_error={error}")
    
    if not code or not state:
        return RedirectResponse(f"{FRONTEND_URL}/lessons?calendar_error=missing_params")
    
    # Verify state
    state_doc = await db.oauth_states.find_one({"state": state, "type": "google_calendar"})
    if not state_doc:
        return RedirectResponse(f"{FRONTEND_URL}/lessons?calendar_error=invalid_state")
    
    user_id = state_doc['user_id']
    
    # Clean up state
    await db.oauth_states.delete_one({"state": state})
    
    try:
        # Exchange code for tokens directly (avoids scope mismatch issues)
        redirect_uri = f"{BACKEND_URL}/api/calendar/google/callback"
        token_response = requests.post(
            'https://oauth2.googleapis.com/token',
            data={
                'code': code,
                'client_id': GOOGLE_CLIENT_ID,
                'client_secret': GOOGLE_CLIENT_SECRET,
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code'
            }
        )
        
        if token_response.status_code != 200:
            error_data = token_response.json()
            print(f"Token exchange error: {error_data}")
            return RedirectResponse(f"{FRONTEND_URL}/lessons?calendar_error=token_exchange_failed")
        
        tokens = token_response.json()
        
        # Get user email
        user_info_response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {tokens["access_token"]}'}
        )
        
        google_email = None
        if user_info_response.status_code == 200:
            google_email = user_info_response.json().get('email')
        
        # Store tokens in user document
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "google_calendar_tokens": tokens,
                "google_calendar_email": google_email,
                "google_calendar_connected_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return RedirectResponse(f"{FRONTEND_URL}/lessons?calendar_connected=true")
        
    except Exception as e:
        print(f"OAuth callback error: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/lessons?calendar_error=callback_failed")

@router.post("/google/disconnect")
async def disconnect_google_calendar(authorization: str = Header(None)):
    """Disconnect Google Calendar"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    await db.users.update_one(
        {"id": user['id']},
        {"$unset": {
            "google_calendar_tokens": "",
            "google_calendar_email": "",
            "google_calendar_connected_at": ""
        }}
    )
    
    return {"success": True, "message": "Google Calendar disconnected"}

@router.post("/google/create-event")
async def create_google_calendar_event(data: CalendarEventCreate, authorization: str = Header(None)):
    """Create an event directly in Google Calendar
    
    Supports three calendar modes:
    1. Primary (default): User's main Google Calendar
    2. Custom: Site-wide configured calendar via GOOGLE_CALENDAR_ID
    3. Shared: Optional shared site calendar via GOOGLE_SHARED_CALENDAR_ID
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get credentials
    creds = await get_google_credentials(user['id'])
    if not creds:
        raise HTTPException(
            status_code=400, 
            detail="Google Calendar not connected. Please connect your Google Calendar first."
        )
    
    try:
        # Build Calendar service
        service = build('calendar', 'v3', credentials=creds)
        
        # Get the appropriate calendar ID
        calendar_id = get_calendar_id(user)
        
        # Create event
        event = {
            'summary': data.title,
            'description': data.description,
            'start': {
                'dateTime': data.startDateTime,
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': data.endDateTime,
                'timeZone': 'UTC',
            },
            'reminders': {
                'useDefault': True,
            },
        }
        
        created_event = service.events().insert(calendarId=calendar_id, body=event).execute()
        
        # Also add to shared calendar if configured
        shared_event = None
        if GOOGLE_SHARED_CALENDAR_ID and calendar_id != GOOGLE_SHARED_CALENDAR_ID:
            try:
                shared_event = service.events().insert(
                    calendarId=GOOGLE_SHARED_CALENDAR_ID, 
                    body=event
                ).execute()
            except Exception as shared_err:
                print(f"Could not add to shared calendar: {shared_err}")
        
        return {
            "success": True,
            "event": {
                "id": created_event.get('id'),
                "htmlLink": created_event.get('htmlLink'),
                "summary": created_event.get('summary'),
                "start": created_event.get('start'),
                "end": created_event.get('end')
            },
            "shared_event": {
                "id": shared_event.get('id'),
                "htmlLink": shared_event.get('htmlLink')
            } if shared_event else None,
            "calendar_id": calendar_id,
            "message": "Event created successfully in Google Calendar"
        }
        
    except Exception as e:
        print(f"Google Calendar API error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create calendar event: {str(e)}")

@router.get("/google/events")
async def get_google_calendar_events(authorization: str = Header(None)):
    """Get upcoming events from Google Calendar"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    creds = await get_google_credentials(user['id'])
    if not creds:
        raise HTTPException(status_code=400, detail="Google Calendar not connected")
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        
        # Get the appropriate calendar ID
        calendar_id = get_calendar_id(user)
        
        # Get next 10 events
        now = datetime.now(timezone.utc).isoformat()
        events_result = service.events().list(
            calendarId=calendar_id,
            timeMin=now,
            maxResults=10,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        return {
            "events": [
                {
                    "id": event.get('id'),
                    "summary": event.get('summary'),
                    "start": event.get('start'),
                    "end": event.get('end'),
                    "htmlLink": event.get('htmlLink')
                }
                for event in events
            ]
        }
        
    except Exception as e:
        print(f"Error fetching events: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch calendar events")

@router.get("/google/calendars")
async def list_google_calendars(authorization: str = Header(None)):
    """List all calendars available to the user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    creds = await get_google_credentials(user['id'])
    if not creds:
        raise HTTPException(status_code=400, detail="Google Calendar not connected")
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        
        # List all calendars
        calendar_list = service.calendarList().list().execute()
        calendars = calendar_list.get('items', [])
        
        return {
            "calendars": [
                {
                    "id": cal.get('id'),
                    "summary": cal.get('summary'),
                    "description": cal.get('description'),
                    "primary": cal.get('primary', False),
                    "backgroundColor": cal.get('backgroundColor'),
                    "accessRole": cal.get('accessRole')
                }
                for cal in calendars
            ],
            "current_calendar_id": get_calendar_id(user),
            "shared_calendar_id": GOOGLE_SHARED_CALENDAR_ID
        }
        
    except Exception as e:
        print(f"Error listing calendars: {e}")
        raise HTTPException(status_code=500, detail="Failed to list calendars")

@router.get("/config")
async def get_calendar_config(authorization: str = Header(None)):
    """Get current calendar configuration"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {
        "site_calendar_id": GOOGLE_CALENDAR_ID,
        "shared_calendar_id": GOOGLE_SHARED_CALENDAR_ID,
        "user_calendar_id": user.get('google_calendar_id'),
        "effective_calendar_id": get_calendar_id(user),
        "google_connected": bool(user.get('google_calendar_tokens')),
        "google_email": user.get('google_calendar_email')
    }

@router.post("/config/user-calendar")
async def set_user_calendar(calendar_id: str, authorization: str = Header(None)):
    """Set user's preferred calendar ID"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Update user's calendar preference
    await db.users.update_one(
        {"id": user['id']},
        {"$set": {"google_calendar_id": calendar_id}}
    )
    
    return {
        "success": True,
        "calendar_id": calendar_id,
        "message": f"Calendar preference updated to {calendar_id}"
    }

# Keep existing ICS generation endpoints

@router.get("/auth-url/{provider}")
async def get_calendar_auth_url(provider: str, authorization: str = Header(None)):
    """Get OAuth URL for calendar provider"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # For Google, use the new OAuth flow
    if provider == "google":
        return await start_google_auth(authorization)
    
    # For other providers, return instructions
    oauth_urls = {
        "outlook": "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps",
        "apple": "https://developer.apple.com/account/resources/identifiers"
    }
    
    if provider not in oauth_urls:
        raise HTTPException(status_code=400, detail="Invalid provider")
    
    return {
        "provider": provider,
        "status": "setup_required",
        "message": f"Calendar sync with {provider.title()} requires OAuth app setup",
        "setupUrl": oauth_urls[provider],
        "instructions": [
            f"1. Visit {oauth_urls[provider]} to create an OAuth app",
            "2. Add the OAuth credentials to your environment",
            "3. Complete the connection in settings"
        ]
    }

@router.post("/generate-ics")
async def generate_ics_file(data: CalendarEventCreate, authorization: str = Header(None)):
    """Generate an ICS file for any calendar app"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Generate ICS content
    uid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    start = datetime.fromisoformat(data.startDateTime.replace("Z", "+00:00")).strftime("%Y%m%dT%H%M%SZ")
    end = datetime.fromisoformat(data.endDateTime.replace("Z", "+00:00")).strftime("%Y%m%dT%H%M%SZ")
    
    # Escape special characters in description
    description = data.description.replace("\n", "\\n").replace(",", "\\,").replace(";", "\\;")
    
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Bible Lesson Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:{uid}
DTSTAMP:{now}
DTSTART:{start}
DTEND:{end}
SUMMARY:{data.title}
DESCRIPTION:{description}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR"""
    
    return {
        "success": True,
        "icsContent": ics_content,
        "filename": f"lesson-{uid[:8]}.ics"
    }

@router.post("/sync-lesson")
async def sync_lesson_to_calendar(data: CalendarSyncRequest, authorization: str = Header(None)):
    """Generate calendar event data for a lesson"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if data.lessonId:
        lesson = await db.lessons.find_one({"id": data.lessonId})
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        # Parse duration to minutes
        duration_str = lesson.get("duration", "45 min")
        duration_mins = int(''.join(filter(str.isdigit, duration_str)) or 45)
        
        return {
            "event": {
                "title": f"Bible Lesson: {lesson.get('title', 'Untitled')}",
                "description": f"Passage: {lesson.get('passage', 'N/A')}\nAge Group: {lesson.get('ageGroup', 'N/A')}\nMemory Verse: {lesson.get('memoryVerseText', '')}",
                "durationMinutes": duration_mins,
                "lesson": {
                    "id": lesson["id"],
                    "title": lesson.get("title"),
                    "passage": lesson.get("passage")
                }
            },
            "provider": data.provider,
            "instructions": f"Set your preferred date/time and add to {data.provider.title()} Calendar"
        }
    
    if data.curriculumId:
        curriculum = await db.curriculum_plans.find_one({"id": data.curriculumId})
        if not curriculum:
            raise HTTPException(status_code=404, detail="Curriculum not found")
        
        # Get all lessons in curriculum
        events = []
        lesson_ids = curriculum.get("lessonIds", [])
        for lesson_id in lesson_ids:
            lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
            if lesson:
                events.append({
                    "title": f"Bible Lesson: {lesson.get('title', 'Untitled')}",
                    "description": lesson.get('passage', 'N/A'),
                    "durationMinutes": 45,
                    "lessonId": lesson_id
                })
        
        return {
            "curriculum": {
                "id": curriculum["id"],
                "title": curriculum.get("title"),
                "startDate": curriculum.get("startDate"),
                "endDate": curriculum.get("endDate")
            },
            "events": events,
            "provider": data.provider
        }
    
    raise HTTPException(status_code=400, detail="Either lessonId or curriculumId is required")
