# Routes package - exports all route modules
from .auth import router as auth_router
from .lessons import router as lessons_router
from .curriculum import router as curriculum_router
from .progress import router as progress_router
from .promo import router as promo_router
from .calendar import router as calendar_router
from .export import router as export_router
from .ai import router as ai_router
from .team import router as team_router
from .payments import router as payments_router
from .preferences import router as preferences_router
from .contact import router as contact_router
from .user import router as user_router
from .notifications import router as notifications_router
from .series import router as series_router
from .websocket import router as websocket_router

__all__ = [
    "auth_router",
    "lessons_router", 
    "curriculum_router",
    "progress_router",
    "promo_router",
    "calendar_router",
    "export_router",
    "ai_router",
    "team_router",
    "payments_router",
    "preferences_router",
    "contact_router",
    "user_router",
    "notifications_router",
    "series_router",
    "websocket_router"
]
