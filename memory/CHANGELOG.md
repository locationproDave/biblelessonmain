# Bible Lesson Planner - Changelog

## 2026-02-16 (Session 7 - Current)

### New Features - COMPLETED

**A) Lesson Series/Collections Feature:**
- Backend API: Full CRUD operations for series (`/api/series`)
- Series stats endpoint (`/api/series/stats/summary`)
- Add/remove lessons from series (`/api/series/{id}/lessons/{lessonId}`)
- Reorder lessons within series
- Frontend: Series page connected to real MongoDB backend
- Stats display (Total Series, Lessons Organized, Unique Themes)
- Create Series modal with lesson selection
- Date formatting fixed

**B) Real-time Collaborative Editing (WebSocket):**
- WebSocket server at `/api/ws/lesson/{lessonId}`
- Presence updates (user joined/left)
- Typing indicators
- Section focus tracking
- Section locking when user is editing
- PresenceIndicator component with live connection status
- Active users display with avatars

**C) Mobile App Ready:**
- Mobile app properly configured with correct API URL
- Login, registration, and lesson viewing screens ready
- Biometric authentication support
- All API endpoints compatible with mobile client

### Bug Fixes
- Pricing page promo banner: Removed all animations
- Mobile web login: Fixed React render-time navigation error
- Series date formatting: Converted ISO strings to readable format

### Testing Results
- Backend: 100% (12/12 tests passed)
- Frontend: 100% - All features verified
- All TOOLS buttons working (Biblical Map, Quiz Generator, Supply List)
- Cross References and Memory Verse displaying correctly

---

## 2026-02-14 (Session 6)

### P0: Navigation Bar Refactor - COMPLETED
- Moved "Curriculum" link from main nav into "My Lessons" dropdown
- Added "Contact Us" to main navigation (positioned right of Pricing)
- "My Lessons" dropdown now contains: All Lessons, Series, Planner, Curriculum, Progress

### P1: Lesson Export (PDF/Word) - COMPLETED
- Implemented actual PDF generation using `fpdf2` library
- Implemented actual Word document generation using `python-docx` library
- Backend returns base64 encoded files for direct download
- Frontend updated to decode base64 and trigger file download
- Added emoji stripping for PDF compatibility
- Professional formatting with styled sections, memory verse box, and materials list

### P1: Promo Codes - COMPLETED
- Implemented promo code validation endpoint (`POST /api/promo/validate`)
- Seeded 4 promo codes on server startup:
  - WELCOME20: 20% off all plans
  - LAUNCH50: 50% off Starter plans only
  - MINISTRY25: 25% off church plans only
  - ANNUAL15: 15% off annual plans only
- Plan-specific restrictions working correctly
- Usage tracking with max uses and expiration dates

### P1: Calendar Sync (ICS) - COMPLETED
- ICS file generation endpoint (`POST /api/calendar/generate-ics`)
- Valid VCALENDAR/VEVENT format for universal calendar import
- Support for Google Calendar, Outlook, and Apple Calendar
- Frontend modal with date/time picker and provider selection

### P2: Backend Refactoring - PARTIALLY COMPLETED
- Created modular route files in `/app/backend/routes/`:
  - auth.py - Authentication routes
  - lessons.py - Lesson CRUD routes
  - curriculum.py - Curriculum planner routes
  - progress.py - Progress tracker routes
  - promo.py - Promo code routes
  - calendar.py - Calendar sync routes
  - export.py - PDF/Word export routes
- Database config in `/app/backend/services/database.py`
- Pydantic models in `/app/backend/models/schemas.py`
- Primary routes still in `server.py` (modular files ready for future migration)

### Testing Results
- Backend tests: 15/15 passed (100%)
- Frontend tests: All passed
- All features verified working

## 2026-02-14 (Session 5)
- Progress Tracker UI (`/progress`)
- PDF/Word Export UI shell
- Calendar Sync UI shell
- Subscription Usage Enforcement
- Promo Codes UI shell
- Backend refactoring structure created
- Navigation cleanup (removed search bar, My Lessons dropdown)

## 2026-02-14 (Session 4)
- Curriculum Planner Frontend UI (`/curriculum`)
- Contact Form Enhancement

## 2026-02-14 (Session 3)
- Search Feature
- Title & Branding Update
- Contact Us Page (`/contact`)
- About Us Page (`/about`)
- Footer Enhancement
- Pricing Page UI Improvements
- Planner Page UI Improvements

## 2026-02-14 (Session 2)
- Security fix for `/api/ai/extract-locations`
- Quiz Generation Frontend UI
- AI Supply List Frontend UI

## 2026-02-14 (Session 1)
- Biblical Map Visualization Feature
- Annual billing options
- UI improvements

## 2026-02-13
- Initial implementation of core features
- Authentication system with JWT
- AI-powered lesson generation with GPT-5.2
- Quiz generation endpoint
- Supply list extraction endpoint
- Curriculum planner CRUD
- Progress tracking system
- Email delivery with Resend
- Stripe subscription system
