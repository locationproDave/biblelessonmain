# Bible Lesson Planner - Product Requirements Document

## Overview
Bible Lesson Planner is a web and mobile application that helps Sunday school teachers create engaging, scripture-based lesson plans. The application uses AI to generate comprehensive lesson content tailored to different age groups and formats.

## Architecture

### Web Frontend (Vite + React + TanStack Router)
- **Location:** `/app/frontend/`
- **Framework:** React with Vite
- **Routing:** TanStack Router (file-based)
- **UI Components:** Shadcn/UI + Tailwind CSS
- **State Management:** Zustand stores
- **Deployment:** Vercel (static hosting)

### Mobile App (React Native + Expo)
- **Location:** `/app/mobile/`
- **Framework:** React Native with Expo
- **Navigation:** Expo Router (file-based)
- **UI:** Custom components matching web design
- **Features:** Biometric auth, offline caching

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

### 6. Admin Dashboard (NEW - Feb 2026)
- Secure admin login with role-based access
- Analytics: users, lessons, revenue, active users
- Subscription plan breakdown visualization
- User management with search/pagination
- Admin credentials: hello@biblelessonplanner.com / Truman310

### 7. Mobile App (NEW - Feb 2026)
- Full React Native app replicating web functionality
- Screens: Home, Lessons, Create, Templates, Profile
- Lesson detail view with expandable sections
- Biometric authentication support
- Offline lesson caching

## File Structure

```
/app
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── routes/         # Page components (TanStack Router)
│   │   │   └── admin/      # Admin dashboard
│   │   ├── lib/            # Utilities, API, stores
│   │   └── hooks/          # Custom React hooks
│   ├── vercel.json         # Vercel deployment config
│   └── package.json
├── backend/
│   ├── routes/             # API route handlers
│   │   ├── admin.py        # Admin analytics endpoints
│   │   ├── auth.py         # Authentication
│   │   ├── ai.py           # AI generation
│   │   └── lessons.py      # Lesson CRUD
│   ├── models/             # Pydantic schemas
│   ├── services/           # Database, utilities
│   ├── server.py           # Main FastAPI app
│   └── requirements.txt
├── mobile/
│   ├── app/
│   │   ├── (auth)/         # Auth screens (landing, login, register)
│   │   ├── (tabs)/         # Main app tabs (home, lessons, create, etc)
│   │   ├── lesson/         # Lesson detail screen
│   │   └── _layout.tsx     # Root layout with auth
│   ├── src/
│   │   ├── components/     # Reusable mobile components
│   │   ├── contexts/       # Auth context
│   │   ├── lib/            # API client, storage, types
│   │   └── styles/         # Theme configuration
│   └── package.json
└── .vercelignore           # Excludes backend from Vercel build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/signin` - Login
- `GET /api/auth/session` - Get current session

### AI/Lessons
- `POST /api/ai/generate-lesson` - Generate new lesson
- `GET /api/lessons` - Get user's lessons
- `POST /api/lessons` - Save lesson
- `POST /api/lessons/{id}/favorite` - Toggle favorite

### Admin (Protected - Admin role required)
- `GET /api/admin/analytics` - Site analytics (users, lessons, revenue)
- `GET /api/admin/users` - Paginated user list
- `GET /api/admin/spending` - Revenue metrics
- `GET /api/admin/lessons-stats` - Lesson statistics
- `GET /api/admin/plan-breakdown` - Subscription distribution
- `POST /api/admin/set-admin/{user_id}` - Grant admin role
- `POST /api/admin/remove-admin/{user_id}` - Revoke admin role

### Other
- `GET /api/health` - Health check
- `POST /api/chatbot/chat` - Chatbot interaction
- `POST /api/contact` - Contact form

## Recent Changes (Feb 2026)

### Added Features
- ✅ Admin Dashboard with analytics, user management, revenue tracking
- ✅ React Native mobile app with full feature parity
- ✅ Biometric authentication for mobile
- ✅ Offline lesson caching

### Removed Features
- ❌ Spanish language support (i18n removed)
- ❌ Language selector in settings

### Bug Fixes
- Fixed 405 error on production (VITE_API_URL environment variable)
- Fixed AI tools (Map, Quiz) to work without database dependencies
- Fixed memory verse defaulting to false
- Fixed hero button widths
- Fixed pricing card alignment

## Deployment

### Vercel (Frontend)
1. Push to GitHub via "Save to Github"
2. Vercel auto-deploys from main branch
3. Environment variable `VITE_API_URL` must point to backend

### Backend
- Currently runs on Emergent preview environment
- For production: Would need separate hosting (Render, Railway, etc.)

### Mobile App
- Development: `cd /app/mobile && npx expo start`
- Build: Use EAS Build (`eas build`) for iOS/Android

## Known Limitations

1. **Backend Dependency:** Frontend relies on Emergent preview URL for API
2. **No Offline Mode:** Web requires internet for AI features
3. **Single Language:** English only (Spanish support removed)

## Future Considerations

- Dedicated backend hosting for production
- Real-time collaboration features
- Push notifications for mobile
- Offline lesson viewing on web
- Team collaboration features
