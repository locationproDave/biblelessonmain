# Bible Lesson Planner - Product Requirements Document

## Overview
Bible Lesson Planner is a web and mobile application that helps Sunday school teachers create engaging, scripture-based lesson plans using AI.

## Production Architecture (February 2026)

### Hosting
| Component | Provider | URL |
|-----------|----------|-----|
| Frontend | Vercel | https://biblelessonplanner.com |
| Backend | Railway | https://biblelessonmain-production.up.railway.app |
| Database | MongoDB Atlas | bible-lesson-cluster |
| AI | Anthropic Claude | claude-sonnet-4-20250514 |
| Payments | Stripe | Live mode |
| Email | Resend | hello@biblelessonplanner.com |

### Environment Variables

**Railway (Backend):**
- `ANTHROPIC_API_KEY` - Claude AI
- `MONGO_URL` - MongoDB Atlas connection
- `DB_NAME` - bible_lesson_db
- `STRIPE_API_KEY` - Stripe live key
- `RESEND_API_KEY` - Resend email
- `SENDER_EMAIL` - hello@biblelessonplanner.com
- `CORS_ORIGINS` - https://biblelessonplanner.com

**Vercel (Frontend):**
- `VITE_API_URL` - https://biblelessonmain-production.up.railway.app/api

## Core Features

### 1. AI Lesson Generation
- Claude-powered lesson creation from Bible passages
- Customizable by age group, duration, format
- Includes memory verses, activities, teacher notes

### 2. Template Library
- Pre-built lesson templates
- Holiday and seasonal content

### 3. User Management
- Email/password authentication
- User profiles and preferences

### 4. Subscription Plans (Stripe)
- Free Trial: 3 lessons/month
- Starter: $9.99/month - 6 lessons
- Unlimited: $19.99/month - 100 lessons
- Church plans: $29.99 - $199.99/month

### 5. Admin Dashboard
- User analytics and management
- Subscription breakdown
- GA4/Clarity/Bing analytics integration

### 6. Mobile App (React Native)
- Scaffolded in `/app/mobile`
- Pending full implementation

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/signin`
- `GET /api/auth/session`

### AI/Lessons
- `POST /api/ai/generate-lesson`
- `GET /api/lessons`
- `POST /api/lessons`

### Payments
- `GET /api/pricing/plans`
- `POST /api/checkout/create-session`
- `POST /api/webhook/stripe`

### Admin
- `GET /api/admin/analytics`
- `GET /api/admin/users`

## File Structure
```
/app
├── frontend/           # React + Vite + TanStack Router
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   └── lib/
│   └── .env.example
├── backend/            # FastAPI + Python
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── server.py
│   └── .env.example
├── mobile/             # React Native + Expo (WIP)
└── memory/             # Documentation
```

## Completed (February 2026)

- ✅ Full web application
- ✅ AI lesson generation (Claude)
- ✅ Stripe payments (live)
- ✅ Admin dashboard with analytics
- ✅ GA4/Clarity integration
- ✅ Production deployment (Railway + Vercel)
- ✅ MongoDB Atlas database
- ✅ Webhook integration

## Pending

- ⏳ Mobile app implementation
- ⏳ Resend domain verification
- ⏳ Email marketing/newsletter
- ⏳ Social sharing features

## Monthly Costs (Estimated)

| Service | Cost |
|---------|------|
| Vercel | Free |
| Railway | ~$5-10/mo |
| MongoDB Atlas | Free (M0) |
| Claude API | ~$0.01/lesson |
| Stripe | 2.9% + $0.30/txn |
| Resend | Free tier |
