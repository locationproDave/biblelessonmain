# Help Chatbot Routes
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import anthropic

load_dotenv()

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

# Store chat sessions in memory (for simplicity)
# In production, you'd want to store this in a database
chat_sessions: dict = {}

# System message for the help assistant
SYSTEM_MESSAGE = """You are a friendly and helpful assistant for Bible Lesson Planner, a web application that helps Sunday school teachers, youth pastors, and educators create engaging Bible lessons.

Your role is to help users:
1. Navigate and use the website effectively
2. Understand features like lesson creation, templates, exporting, and offline mode
3. Troubleshoot common issues
4. Get the most out of the platform

Key features you should know about:
- **Create Lesson**: Users can create AI-powered Bible lessons by selecting a scripture passage, age group, duration, and customization options
- **Templates**: Pre-designed lesson templates for holidays (Christmas, Easter), parables, Old Testament heroes, and more
- **My Lessons**: Dashboard to view, search, filter, and manage saved lessons
- **Export/Print**: Export lessons as PDF or DOCX, or print directly (requires login)
- **Offline Mode**: Logged-in users can access lessons offline; changes sync when back online
- **Save Templates for Later**: When offline, users can save templates to use when back online
- **Settings**: Manage account, calendar integration, and offline data

Be concise, friendly, and helpful. Use simple language. If you don't know something specific about the app, suggest the user contact support or try the feature themselves.

Always be encouraging about Bible teaching and the important work users are doing!"""


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    response: str
    session_id: str


class SuggestedQuestion(BaseModel):
    id: str
    text: str
    category: str


# Predefined suggestions for quick help
SUGGESTED_QUESTIONS = [
    {"id": "1", "text": "How do I create a new lesson?", "category": "Getting Started"},
    {"id": "2", "text": "What are templates and how do I use them?", "category": "Templates"},
    {"id": "3", "text": "How do I export or print my lesson?", "category": "Export"},
    {"id": "4", "text": "How does offline mode work?", "category": "Offline"},
    {"id": "5", "text": "How do I save a lesson to favorites?", "category": "Lessons"},
    {"id": "6", "text": "What age groups are available?", "category": "Getting Started"},
    {"id": "7", "text": "How do I customize my lesson?", "category": "Getting Started"},
    {"id": "8", "text": "Can I edit a lesson after creating it?", "category": "Lessons"},
]


@router.get("/suggestions", response_model=List[SuggestedQuestion])
async def get_suggestions():
    """Get suggested questions for the chatbot"""
    return SUGGESTED_QUESTIONS


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message to the help chatbot"""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="Chatbot API key not configured")
    
    try:
        # Get or create chat session history
        if request.session_id not in chat_sessions:
            chat_sessions[request.session_id] = []
        
        # Add user message to history
        chat_sessions[request.session_id].append({
            "role": "user",
            "content": request.message
        })
        
        # Create Claude client and send message
        client = anthropic.Anthropic(api_key=api_key)
        
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_MESSAGE,
            messages=chat_sessions[request.session_id]
        )
        
        response_text = message.content[0].text
        
        # Add assistant response to history
        chat_sessions[request.session_id].append({
            "role": "assistant",
            "content": response_text
        })
        
        return ChatResponse(
            response=response_text,
            session_id=request.session_id
        )
        
    except Exception as e:
        print(f"[Chatbot] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get response: {str(e)}")


@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear a chat session"""
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    return {"message": "Session cleared"}
