# AI Generation Routes
from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timezone
import uuid
import json
import logging
import os
import anthropic

from models.schemas import GenerateLessonRequest, QuizGenerateRequest, SupplyListExtractRequest, BiblicalMapExtractRequest
from services.database import db

router = APIRouter(prefix="/ai", tags=["AI Generation"])
logger = logging.getLogger(__name__)

# Anthropic Claude API Key
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')

# Add-ons Configuration (mirror from payments.py for feature checking)
ADD_ONS = {
    "quiz_generator": {
        "id": "quiz_generator",
        "name": "Biblical Map & Quiz Generator",
        "price": 1.99,
        "interval": "month",
        "description": "Unlock AI-powered Biblical Map Generator and Quiz Generator features",
        "features": ["quizGenerator"]
    }
}

# Plans that include quizGenerator feature
PLANS_WITH_QUIZ = ["unlimited", "unlimited_annual", "enterprise", "enterprise_annual"]

def serialize_doc(doc: dict) -> dict:
    if doc is None:
        return None
    result = {k: v for k, v in doc.items() if k != '_id'}
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

async def check_quiz_generator_access(token: str) -> dict:
    """Check if user has access to Quiz Generator feature"""
    if not token:
        return {"hasAccess": False, "reason": "not_authenticated"}
    
    session = await db.sessions.find_one({"token": token})
    if not session:
        return {"hasAccess": False, "reason": "invalid_session"}
    
    # Get subscription
    subscription = await db.subscriptions.find_one({"userId": session["userId"]})
    if not subscription:
        return {"hasAccess": False, "reason": "no_subscription", "upgradeRequired": True}
    
    plan_id = subscription.get("planId", "free")
    
    # Check if plan includes the feature
    if plan_id in PLANS_WITH_QUIZ:
        return {"hasAccess": True, "includedInPlan": True}
    
    # Check if user has the add-on
    user_add_ons = subscription.get("addOns", [])
    if "quiz_generator" in user_add_ons:
        return {"hasAccess": True, "addOn": "quiz_generator"}
    
    # Check if add-on can be purchased (org plans)
    is_org_plan = plan_id in ["team", "team_annual", "ministry", "ministry_annual"]
    if is_org_plan:
        return {
            "hasAccess": False,
            "reason": "add_on_required",
            "addOn": ADD_ONS["quiz_generator"],
            "canPurchase": True
        }
    
    # Individual starter plan - needs to upgrade to Unlimited
    return {
        "hasAccess": False,
        "reason": "upgrade_required",
        "upgradeRequired": True,
        "suggestedPlan": "unlimited"
    }

async def generate_with_ai(prompt: str, session_id: str = None) -> str:
    """Helper function to generate content with Claude AI"""
    if not ANTHROPIC_API_KEY:
        logger.warning("ANTHROPIC_API_KEY not configured, using fallback")
        return None
    
    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            system="You are a helpful Bible teacher assistant that creates engaging, scripture-based lessons for various age groups. Always respond with valid JSON only, no markdown formatting.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return message.content[0].text
    except Exception as e:
        logger.error(f"Claude AI generation error: {str(e)}")
        return None

@router.post("/generate-lesson")
async def generate_lesson(request: GenerateLessonRequest):
    """Generate a Bible lesson using AI"""
    passage = ""
    if request.book:
        passage = request.book
        if request.chapter:
            passage += f" {request.chapter}"
            if request.verse:
                passage += f":{request.verse}"
    
    topic = request.topic or request.theme or "God's Love"
    
    prompt = f"""Create a detailed Bible lesson plan with the following specifications:
Scripture/Topic: {passage if passage else topic}
Age Group: {request.ageGroup}
Duration: {request.duration}
Format: {request.format}
Bible Version: {request.bibleVersion or 'KJV'}

Include these components based on settings:
- Activities: {request.includeActivities}
- Crafts: {request.includeCrafts}
- Memory Verse: {request.includeMemoryVerse}
- Discussion Questions: {request.includeDiscussion}
- Prayer Points: {request.includePrayer}
- Parent Take-Home: {request.includeParentTakeHome}

Return ONLY a valid JSON object (no markdown formatting) with this exact structure:
{{
    "title": "Engaging lesson title",
    "passage": "Scripture reference",
    "ageGroup": "{request.ageGroup}",
    "duration": "{request.duration}",
    "format": "{request.format}",
    "theme": "Main theme",
    "memoryVerse": {{
        "text": "Full verse text from {request.bibleVersion or 'KJV'}",
        "reference": "Book Chapter:Verse"
    }},
    "objectives": ["objective1", "objective2", "objective3"],
    "materialsNeeded": [
        {{"item": "item name", "category": "essential|activity|optional"}}
    ],
    "sections": [
        {{"title": "Section title", "duration": "X min", "icon": "emoji", "type": "opening|scripture|teaching|activity|discussion|craft|closing", "content": "Detailed content"}}
    ],
    "parentTakeHome": {{
        "summary": "Summary for parents",
        "memoryVerse": "reference",
        "discussionStarters": ["question1", "question2"],
        "familyActivity": "activity description",
        "weeklyChallenge": "challenge description"
    }},
    "crossReferences": [
        {{"reference": "Book Chapter:Verse", "text": "Relevant verse text"}}
    ],
    "teacherNotes": ["note1", "note2"],
    "description": "Brief lesson description"
}}"""

    ai_response = await generate_with_ai(prompt, f"lesson-{uuid.uuid4()}")
    
    if ai_response:
        try:
            cleaned_response = ai_response.strip()
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response.split("```")[1]
                if cleaned_response.startswith("json"):
                    cleaned_response = cleaned_response[4:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
            
            lesson_data = json.loads(cleaned_response.strip())
            return lesson_data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
    
    # Fallback to template if AI fails
    return {
        "title": f"{request.book or topic}: Bible Lesson",
        "passage": passage or "Selected Scripture",
        "ageGroup": request.ageGroup,
        "duration": request.duration,
        "format": request.format,
        "theme": topic,
        "memoryVerse": {
            "text": "The Lord is my shepherd; I shall not want.",
            "reference": "Psalm 23:1"
        },
        "objectives": [
            f"Understand the main message of {passage or topic}",
            "Apply biblical principles to daily life",
            "Memorize the key Scripture verse"
        ],
        "materialsNeeded": [
            {"item": "Bible", "category": "essential"},
            {"item": "Paper and crayons", "category": "activity"},
            {"item": "Whiteboard", "category": "optional"}
        ],
        "sections": [
            {"title": "Opening Prayer", "duration": "5 min", "icon": "🙏", "type": "opening", "content": "Begin with prayer, inviting God's presence into your time together."},
            {"title": "Scripture Reading", "duration": "10 min", "icon": "📖", "type": "scripture", "content": f"Read {passage or 'the selected passage'} together as a group."},
            {"title": "Teaching Time", "duration": "15 min", "icon": "📚", "type": "teaching", "content": "Explain the key themes and messages from the Scripture."},
            {"title": "Discussion Questions", "duration": "10 min", "icon": "💬", "type": "discussion", "content": "Engage students with thought-provoking questions about the passage."},
            {"title": "Closing Activity", "duration": "5 min", "icon": "🎮", "type": "activity", "content": "Wrap up with a memorable activity that reinforces the lesson."}
        ],
        "parentTakeHome": {
            "summary": f"Today we learned about {topic} from {passage or 'Scripture'}.",
            "memoryVerse": "Psalm 23:1",
            "discussionStarters": [
                "What did you learn about God today?",
                "How can we apply this lesson at home?",
                "What questions do you have about the Bible?"
            ],
            "familyActivity": "Read the passage together as a family this week.",
            "weeklyChallenge": "Practice the memory verse daily."
        },
        "crossReferences": [],
        "teacherNotes": [
            "Review the passage before class",
            "Prepare materials in advance",
            "Be ready for student questions"
        ],
        "description": f"A lesson about {topic} designed for {request.ageGroup} students."
    }

@router.post("/generate-quiz")
async def generate_quiz(request: QuizGenerateRequest, authorization: str = Header(None)):
    """Generate a quiz for a lesson using AI"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Check feature access for Quiz Generator
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    access = await check_quiz_generator_access(token)
    if not access.get("hasAccess"):
        raise HTTPException(
            status_code=403, 
            detail={
                "error": "feature_locked",
                "feature": "Quiz Generator",
                "reason": access.get("reason"),
                "upgradeRequired": access.get("upgradeRequired", False),
                "suggestedPlan": access.get("suggestedPlan"),
                "addOn": access.get("addOn"),
                "canPurchase": access.get("canPurchase", False)
            }
        )
    
    # Use content from request if provided, otherwise look up in database
    title = request.lessonTitle
    passage = request.lessonPassage
    theme = request.lessonTheme
    age_group = request.lessonAgeGroup
    memory_verse = request.memoryVerse
    
    if not title:
        lesson = await db.lessons.find_one({"id": request.lessonId}, {"_id": 0})
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found. Please provide lesson details.")
        
        title = lesson.get('title', 'Bible Lesson')
        passage = lesson.get('passage', 'Scripture')
        theme = lesson.get('theme', 'General')
        age_group = lesson.get('ageGroup', 'Elementary')
        memory_verse = f"{lesson.get('memoryVerseText', '')} - {lesson.get('memoryVerseReference', '')}"
    
    prompt = f"""Create a quiz for this Bible lesson:
    
Lesson Title: {title or 'Bible Lesson'}
Scripture: {passage or 'Scripture'}
Theme: {theme or 'General'}
Age Group: {age_group or 'Elementary'}
Memory Verse: {memory_verse or ''}

Generate {request.questionCount} quiz questions with difficulty level: {request.difficulty}
Question types to include: {', '.join(request.questionTypes)}

Return ONLY a valid JSON object (no markdown) with this structure:
{{
    "quizTitle": "Quiz title",
    "lessonId": "{request.lessonId}",
    "questions": [
        {{
            "id": "q1",
            "type": "multiple_choice|true_false|fill_blank|short_answer",
            "question": "Question text",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "A",
            "explanation": "Why this is correct",
            "difficulty": "easy|medium|hard",
            "points": 10
        }}
    ],
    "totalPoints": 100,
    "passingScore": 70
}}"""

    ai_response = await generate_with_ai(prompt, f"quiz-{request.lessonId}")
    
    if ai_response:
        try:
            cleaned_response = ai_response.strip()
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response.split("```")[1]
                if cleaned_response.startswith("json"):
                    cleaned_response = cleaned_response[4:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
            
            quiz_data = json.loads(cleaned_response.strip())
            quiz_data["id"] = str(uuid.uuid4())
            quiz_data["createdAt"] = datetime.now(timezone.utc).isoformat()
            
            await db.quizzes.insert_one(quiz_data.copy())
            quiz_data.pop("_id", None)
            return quiz_data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse quiz response: {e}")
    
    # Fallback quiz
    return {
        "id": str(uuid.uuid4()),
        "quizTitle": f"Quiz: {lesson.get('title', 'Bible Lesson')}",
        "lessonId": request.lessonId,
        "questions": [
            {
                "id": "q1",
                "type": "multiple_choice",
                "question": f"What is the main theme of {lesson.get('passage', 'this passage')}?",
                "options": [lesson.get('theme', 'Love'), "Fear", "Anger", "Sadness"],
                "correctAnswer": lesson.get('theme', 'Love'),
                "explanation": "This is the central theme of the lesson.",
                "difficulty": "easy",
                "points": 20
            }
        ],
        "totalPoints": 20,
        "passingScore": 70,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }

@router.post("/extract-supplies")
async def extract_supply_list(request: SupplyListExtractRequest, authorization: str = Header(None)):
    """Extract and organize supply list from a lesson using AI"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    lesson = await db.lessons.find_one({"id": request.lessonId}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    materials_json = lesson.get("materialsJson", "[]")
    if isinstance(materials_json, str):
        try:
            materials = json.loads(materials_json)
        except:
            materials = []
    else:
        materials = materials_json
    
    sections_json = lesson.get("sectionsJson", "[]")
    if isinstance(sections_json, str):
        try:
            sections = json.loads(sections_json)
        except:
            sections = []
    else:
        sections = sections_json
    
    prompt = f"""Analyze this Bible lesson and extract a comprehensive supply list:

Lesson Title: {lesson.get('title', 'Bible Lesson')}
Age Group: {lesson.get('ageGroup', 'Elementary')}
Current Materials Listed: {json.dumps(materials)}
Lesson Sections: {json.dumps(sections)}

Extract ALL supplies needed and organize them. Return ONLY valid JSON (no markdown):
{{
    "lessonId": "{request.lessonId}",
    "supplies": [
        {{
            "item": "Item name",
            "quantity": "Amount needed (e.g., '1 per student', '5 total')",
            "category": "essential|craft|activity|optional|technology",
            "notes": "Special instructions or alternatives",
            "estimatedCost": "$X.XX or 'Free'"
        }}
    ],
    "totalEstimatedCost": "$XX.XX",
    "prepTime": "X minutes",
    "shoppingList": ["Grouped items for shopping"],
    "substitutions": [
        {{"original": "Item", "alternative": "Substitute"}}
    ]
}}"""

    ai_response = await generate_with_ai(prompt, f"supplies-{request.lessonId}")
    
    if ai_response:
        try:
            cleaned_response = ai_response.strip()
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response.split("```")[1]
                if cleaned_response.startswith("json"):
                    cleaned_response = cleaned_response[4:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
            
            supply_data = json.loads(cleaned_response.strip())
            return supply_data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse supply list: {e}")
    
    # Fallback
    return {
        "lessonId": request.lessonId,
        "supplies": materials if materials else [
            {"item": "Bible", "quantity": "1 per student", "category": "essential", "notes": "Any translation", "estimatedCost": "Free"},
            {"item": "Paper", "quantity": "5 sheets per student", "category": "activity", "notes": "White or colored", "estimatedCost": "$2.00"},
            {"item": "Crayons/Markers", "quantity": "1 set per table", "category": "craft", "notes": "Washable preferred", "estimatedCost": "$5.00"}
        ],
        "totalEstimatedCost": "$7.00",
        "prepTime": "15 minutes",
        "shoppingList": ["Paper", "Crayons/Markers"],
        "substitutions": [
            {"original": "Crayons", "alternative": "Colored pencils"}
        ]
    }

@router.post("/extract-locations")
async def extract_biblical_locations(request: BiblicalMapExtractRequest, authorization: str = Header(None)):
    """Extract biblical geographic locations from a lesson using AI"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Check feature access for Biblical Map Generator
    access = await check_quiz_generator_access(token)
    if not access.get("hasAccess"):
        raise HTTPException(
            status_code=403, 
            detail={
                "error": "feature_locked",
                "feature": "Biblical Map Generator",
                "reason": access.get("reason"),
                "upgradeRequired": access.get("upgradeRequired", False),
                "suggestedPlan": access.get("suggestedPlan"),
                "addOn": access.get("addOn"),
                "canPurchase": access.get("canPurchase", False)
            }
        )
    
    # Use content from request if provided, otherwise look up in database
    title = request.lessonTitle
    passage = request.lessonPassage
    lesson_content = request.lessonContent
    
    # If no content provided in request, try to look up from database
    if not title and not lesson_content:
        lesson = await db.lessons.find_one({"id": request.lessonId}, {"_id": 0})
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found. Please provide lessonTitle and lessonContent.")
        
        title = lesson.get("title", "Bible Lesson")
        passage = lesson.get("passage", "")
        
        sections_json = lesson.get("sectionsJson", "[]")
        if isinstance(sections_json, str):
            try:
                sections = json.loads(sections_json)
            except:
                sections = []
        else:
            sections = sections_json
        
        lesson_content = "\n\n".join([
            f"{s.get('title', '')}: {s.get('content', '')}" 
            for s in sections if isinstance(s, dict)
        ])
    
    # Ensure we have some content to analyze
    if not lesson_content:
        lesson_content = f"{title or 'Bible Lesson'} - {passage or 'Scripture passage'}"
    
    system_prompt = """You are a biblical geography expert. Analyze Bible lesson content and extract geographic locations. Return ONLY valid JSON with no markdown formatting."""

    user_prompt = f"""Analyze this Bible lesson and extract ALL geographic locations:

Lesson Title: {title}
Scripture Passage: {passage}
Lesson Content: {lesson_content[:4000]}

Return JSON with this structure:
{{
    "locations": [
        {{
            "name": "biblical-era name",
            "modernName": "modern equivalent",
            "lat": number,
            "lng": number,
            "type": "city|region|river|sea|mountain|desert|landmark",
            "period": "biblical period",
            "significance": "1-2 sentence summary",
            "keyEvents": ["event1", "event2"],
            "scriptureRefs": ["ref1", "ref2"],
            "terrain": "terrain description"
        }}
    ],
    "distances": [
        {{
            "from": "location name",
            "to": "location name",
            "miles": number,
            "context": "biblical context"
        }}
    ],
    "region": {{
        "name": "primary region name",
        "centerLat": number,
        "centerLng": number,
        "zoomLevel": number
    }}
}}"""

    prompt = f"{system_prompt}\n\n{user_prompt}"
    ai_response = await generate_with_ai(prompt, f"map-{request.lessonId}")
    
    if ai_response:
        try:
            cleaned_response = ai_response.strip()
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response.split("```")[1]
                if cleaned_response.startswith("json"):
                    cleaned_response = cleaned_response[4:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
            
            map_data = json.loads(cleaned_response.strip())
            
            await db.biblical_maps.update_one(
                {"lessonId": request.lessonId},
                {"$set": {
                    "lessonId": request.lessonId,
                    "data": map_data,
                    "updatedAt": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
            
            return map_data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse map data: {e}")
    
    # Fallback
    return {
        "locations": [
            {
                "name": "Jerusalem",
                "modernName": "Jerusalem, Israel",
                "lat": 31.7683,
                "lng": 35.2137,
                "type": "city",
                "period": "All Biblical Periods",
                "significance": "The holy city, center of Jewish worship.",
                "keyEvents": ["David's capital", "Solomon's Temple", "Jesus' crucifixion"],
                "scriptureRefs": ["Psalm 122:1-2", "Matthew 21:1", "Acts 2:1-4"],
                "terrain": "Mountainous"
            }
        ],
        "distances": [],
        "region": {
            "name": "Holy Land",
            "centerLat": 31.5,
            "centerLng": 35.5,
            "zoomLevel": 6
        }
    }

@router.get("/map-data/{lessonId}")
async def get_cached_map_data(lessonId: str, authorization: str = Header(None)):
    """Get cached biblical map data for a lesson"""
    cached = await db.biblical_maps.find_one({"lessonId": lessonId}, {"_id": 0})
    if cached and "data" in cached:
        return cached["data"]
    return None

@router.get("/quizzes/{lesson_id}")
async def get_lesson_quizzes(lesson_id: str):
    """Get all quizzes for a lesson"""
    quizzes = await db.quizzes.find({"lessonId": lesson_id}, {"_id": 0}).to_list(100)
    return quizzes
