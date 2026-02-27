# Pydantic Models for API
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any

# ==================== AUTH MODELS ====================

class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserPreferences(BaseModel):
    bibleVersion: Optional[str] = "KJV"
    ministryRole: Optional[str] = None
    preferredAgeGroup: Optional[str] = None
    onboardingCompleted: bool = False

# ==================== LESSON MODELS ====================

class LessonCreate(BaseModel):
    title: str
    passage: str
    ageGroup: str
    duration: str
    format: str
    theme: str
    memoryVerseText: str
    memoryVerseReference: str
    objectives: List[str]
    sectionsJson: str
    materialsJson: str
    crossReferencesJson: Optional[str] = "[]"
    configJson: Optional[str] = "{}"
    description: Optional[str] = None

class GenerateLessonRequest(BaseModel):
    book: Optional[str] = None
    chapter: Optional[str] = None
    verse: Optional[str] = None
    topic: Optional[str] = None
    theme: Optional[str] = None
    ageGroup: str = "Elementary (6-10)"
    duration: str = "45 min"
    format: str = "Interactive"
    bibleVersion: Optional[str] = "KJV"
    language: Optional[str] = "English"  # Language for lesson generation
    includeActivities: bool = True
    includeCrafts: bool = True
    includeMemoryVerse: bool = True
    includeDiscussion: bool = True
    includePrayer: bool = True
    includeParentTakeHome: bool = True

# ==================== TEAM MODELS ====================

class TeamInvite(BaseModel):
    email: str
    role: str = "viewer"

class AcceptInvitation(BaseModel):
    token: str

# ==================== FEATURE MODELS ====================

class EmailLessonRequest(BaseModel):
    lessonId: str
    recipientEmail: EmailStr
    recipientName: Optional[str] = None
    scheduleFor: Optional[str] = None

class CurriculumPlanCreate(BaseModel):
    title: str
    description: Optional[str] = None
    startDate: str
    endDate: str
    ageGroup: str
    lessonIds: List[str] = []

class CurriculumPlanUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    ageGroup: Optional[str] = None
    lessonIds: Optional[List[str]] = None

class QuizGenerateRequest(BaseModel):
    lessonId: str
    questionCount: int = 5
    questionTypes: List[str] = ["multiple_choice", "true_false"]
    difficulty: str = "medium"
    # Optional fields for when lesson isn't in database
    lessonTitle: Optional[str] = None
    lessonPassage: Optional[str] = None
    lessonTheme: Optional[str] = None
    lessonAgeGroup: Optional[str] = None
    memoryVerse: Optional[str] = None
    lessonContent: Optional[str] = None

class SupplyListExtractRequest(BaseModel):
    lessonId: str

class ProgressUpdate(BaseModel):
    lessonId: str
    status: str
    completedSections: List[str] = []
    notes: Optional[str] = None

# ==================== CONTACT FORM MODEL ====================

class ContactFormRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    type: Optional[str] = "general"

# ==================== BIBLICAL MAP MODELS ====================

class BiblicalMapExtractRequest(BaseModel):
    lessonId: str
    lessonTitle: Optional[str] = None
    lessonPassage: Optional[str] = None
    lessonContent: Optional[str] = None

class BiblicalLocation(BaseModel):
    name: str
    modernName: str
    lat: float
    lng: float
    type: str
    period: str
    significance: str
    keyEvents: List[str]
    scriptureRefs: List[str]
    terrain: str

class LocationDistance(BaseModel):
    fromLoc: str = Field(alias="from")
    toLoc: str = Field(alias="to")
    miles: float
    context: str

class MapRegion(BaseModel):
    name: str
    centerLat: float
    centerLng: float
    zoomLevel: int

class BiblicalMapData(BaseModel):
    locations: List[BiblicalLocation]
    distances: List[LocationDistance]
    region: MapRegion

# ==================== SUBSCRIPTION MODELS ====================

class CheckoutRequest(BaseModel):
    planId: str
    originUrl: str

class SubscriptionResponse(BaseModel):
    id: str
    userId: str
    planId: str
    planName: str
    status: str
    lessonsUsed: int
    lessonsLimit: int
    currentPeriodEnd: str
    features: Dict[str, Any]

# ==================== EXPORT MODELS ====================

class ExportRequest(BaseModel):
    lessonId: str
    format: str = "pdf"

# ==================== PROMO CODE MODELS ====================

class PromoCodeValidate(BaseModel):
    code: str
    planId: str

class PromoCodeCreate(BaseModel):
    code: str
    discountPercent: int
    validUntil: str
    maxUses: int = 100
    applicablePlans: List[str] = []

# ==================== CALENDAR MODELS ====================

class CalendarSyncRequest(BaseModel):
    provider: str
    lessonId: Optional[str] = None
    curriculumId: Optional[str] = None

class CalendarEventCreate(BaseModel):
    title: str
    description: str
    startDateTime: str
    endDateTime: str
    provider: str
