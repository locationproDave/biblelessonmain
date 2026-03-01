# Bible Lesson Planner - Product Requirements Document

## Overview
AI-powered Sunday school lesson planning tool that generates complete, Scripture-based lessons in minutes.

**Live URL**: biblelessonplanner.com
**Tech Stack**: Vite + React (Vercel) | FastAPI (Railway) | MongoDB Atlas

## Ownership
- David Conway: 75%
- Truman Conway: 25%

---

## Core Features (Implemented)

### Lesson Generation
- Multi-step wizard (Scripture → Audience → Customize → Generate)
- AI-powered lesson content via Claude API
- 20+ Bible translation support
- Age group targeting (Preschool → Adult)
- Customizable extras (memory verse, discussion, prayer, activities, crafts, take-home)
- Print-ready output

### User Management
- JWT authentication
- Stripe subscription integration
- Custom subscription plans (admin-assignable)
- Lesson history and saved lessons

### Admin Dashboard
- User analytics and management
- GA4/Clarity integration display
- Custom subscription assignment
- **NEW**: Team/Sales Rep management (frontend UI complete)

### Legal/Compliance
- Privacy Policy (`/privacy`)
- Terms of Service (`/terms`)
- EU ODR link in footer

---

## Sales & Commission Structure

### Base Commission
- 25% one-time on all subscriptions

### Volume Bonuses (Monthly)
- 10-19 signups: +$50
- 20-34 signups: +$150
- 35-49 signups: +$300
- 50+ signups: +$500 + 5% extra

### Profit Participation (12+ months)
- Tier 1: 1% revenue share
- Tier 2: 2% + 0.5% override on recruited reps
- Tier 3: 0.25-1% equity (exceptional performers)

---

## Changelog

### March 2026
- Added Privacy Policy and Terms of Service pages
- Added EU ODR link to footer
- Built Team management section in admin dashboard
- Fixed customize extras to default unselected
- Created sales commission structure document
- Created Buffer-compatible social media CSV (30 days)

### February 2026
- Migrated backend to Railway
- Migrated database to MongoDB Atlas
- Removed emergentintegrations dependency
- Implemented direct Claude, Stripe, Resend SDK integration
- Added GA4 analytics section to admin
- Added custom subscription assignment feature
- Created RSS feed for social media automation

---

## Roadmap

### P0 - Immediate
- [ ] Backend API for sales rep management
- [ ] Referral code tracking in signup flow
- [ ] Google Ads re-submission after legal pages deploy

### P1 - Short Term
- [ ] Organization pricing page
- [ ] Multi-seat license management
- [ ] Christian school mode (weekday scheduling, grade levels)

### P2 - Medium Term
- [ ] Mobile app completion
- [ ] Blog/articles section for SEO
- [ ] Quiz/test generation for schools
- [ ] Parent portal access

### P3 - Long Term
- [ ] Multi-school/district management
- [ ] Curriculum standardization tools
- [ ] Gradebook integration hooks
- [ ] API for third-party integrations

---

## Key Files Reference

### Frontend
- `/app/frontend/src/routes/generate.tsx` - Lesson generation wizard
- `/app/frontend/src/routes/admin/dashboard.tsx` - Admin dashboard with Team tab
- `/app/frontend/src/routes/privacy.tsx` - Privacy policy
- `/app/frontend/src/routes/terms.tsx` - Terms of service

### Backend
- `/app/backend/main.py` - FastAPI entry point
- `/app/backend/routes/admin.py` - Admin API endpoints
- `/app/backend/ai.py` - Claude integration
- `/app/backend/payments.py` - Stripe integration

### Business Documents
- `/app/artifacts/sales_commission_structure.md` - Full commission plan
- `/app/artifacts/seo_marketing_guide.md` - Marketing playbook
- `/app/artifacts/buffer_final.csv` - Social media content (needs images)
