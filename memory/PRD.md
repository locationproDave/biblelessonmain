# Bible Lesson Planner - Product Requirements Document

## Overview
Bible Lesson Planner is a web application that helps Sunday school teachers create engaging, scripture-based lesson plans. The application uses AI to generate comprehensive lesson content tailored to different age groups and formats.

## Architecture

### Frontend (Vite + React + TanStack Router)
- **Location:** `/app/frontend/`
- **Framework:** React with Vite
- **Routing:** TanStack Router (file-based)
- **UI Components:** Shadcn/UI + Tailwind CSS
- **State Management:** Zustand stores
- **Deployment:** Vercel (static hosting)

### Backend (FastAPI + MongoDB)
- **Location:** `/app/backend/`
- **Framework:** FastAPI
- **Database:** MongoDB
- **AI Integration:** OpenAI via Emergent LLM Key
- **Deployment:** Emergent preview environment

### Key Environment Variables (Vercel)
```
VITE_API_URL=https://admin-portal-401.preview.emergentagent.com/api
```

## Core Features

### 1. Lesson Generation
- AI-powered lesson creation from Bible passages or topics
- Customizable by age group, duration, and format
- Includes memory verses, activities, teacher notes, parent take-home

### 2. Template Library
- Pre-built lesson templates for holidays and common passages
- Quick-start options for teachers

### 3. Lesson Management
- Save, edit, and organize lessons
- Favorite lessons for quick access
- Export to PDF

### 4. User Features
- Authentication (login/register)
- User profiles
- Subscription plans (Stripe integration)

### 5. AI Tools
- Chatbot for help and questions
- Biblical map quizzes
- Quiz generator

## File Structure

```
/app
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── routes/         # Page components (TanStack Router)
│   │   ├── lib/            # Utilities, API, stores
│   │   ├── hooks/          # Custom React hooks
│   │   └── i18n.tsx        # Translation system (English only)
│   ├── vercel.json         # Vercel deployment config
│   └── package.json
├── backend/
│   ├── routes/             # API route handlers
│   ├── models/             # Pydantic schemas
│   ├── services/           # Database, utilities
│   ├── server.py           # Main FastAPI app
│   └── requirements.txt
└── .vercelignore           # Excludes backend from Vercel build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/session` - Get current session

### AI/Lessons
- `POST /api/ai/generate-lesson` - Generate new lesson
- `GET /api/lessons` - Get user's lessons
- `POST /api/lessons` - Save lesson

### Other
- `GET /api/health` - Health check
- `POST /api/chatbot/chat` - Chatbot interaction
- `POST /api/contact` - Contact form

## Recent Changes (Feb 2026)

### Removed Features
- ❌ Spanish language support (i18n removed)
- ❌ Language selector in settings
- ❌ Bilingual template translations

### Cleanup Performed
- Removed `lesson-templates-i18n.ts` (Spanish template data)
- Removed `test_i18n_ai_generation.py` (obsolete test)
- Simplified i18n.tsx to English-only
- Cleaned up all `language === 'es'` conditionals
- Fixed duplicate `health_check` function
- Removed orphaned `=2.0.0` file

## Deployment

### Vercel (Frontend)
1. Push to GitHub via "Save to Github"
2. Vercel auto-deploys from main branch
3. Environment variable `VITE_API_URL` must point to backend

### Backend
- Currently runs on Emergent preview environment
- For production: Would need separate hosting (Render, Railway, etc.)

## Known Limitations

1. **Backend Dependency:** Frontend relies on Emergent preview URL for API
2. **No Offline Mode:** Requires internet connection for AI features
3. **Single Language:** English only (Spanish support removed)

## Future Considerations

- Dedicated backend hosting for production
- Offline lesson viewing
- Team collaboration features
- Real-time notifications
- Analytics dashboard
