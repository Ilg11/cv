# Project Brief: AI Resume Builder & ATS Optimizer SaaS

## 1. Executive Summary
CVForge is a high-conversion, B2C SaaS platform built for ambitious job seekers. It empowers candidates to:
1. Build clean, ATS-compliant resumes using 3 proven recruiter formats (Classic, Modern, Compact).
2. Sync complete career history in 1 click from public LinkedIn profile URLs via Apify.
3. Perform deep ATS gap analysis against any target job posting (LinkedIn URL or text) using Anthropic Claude 3.5 Haiku.
4. Generate and share trackable recruiter web links (`cvforge.com/cv/[slug]`) with view count telemetry and link lock-in.
5. Export machine-readable, ATS-proof PDFs and standard portable JSON data.

---

## 2. Business Model & Pricing
- **Price:** $99 per year (Single annual plan).
- **Free Trial:** 7 days 100% free with credit card up front. Automatic conversion on Day 7 unless canceled.
- **Refund Policy:** 14-day money-back satisfaction guarantee on first annual payment.
- **Data Guarantee:** Lapsed or canceled users can always export their data as JSON at any time (`/api/export/json`).

---

## 3. The Growth Engine: "Link Lock-in"
Candidates attach their unique web link (`/cv/candidate-name-4k2x`) to job applications and LinkedIn messages:
- **Active Subscription / Trial:** Recruiter visits the link and sees the full, interactive ATS-formatted resume. View counts are incremented.
- **Lapsed Access / Canceled:** When the trial or subscription ends, the link pauses and displays a polite, neutral notice:
  > *"This resume is currently unavailable. The owner may have paused or ended their active sharing access."*
  (No upsell is shown to recruiters; the owner is motivated to maintain an active subscription so their live applications keep working).

---

## 4. Tech Stack & Infrastructure

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) + TypeScript | Full-stack React framework with server components and edge middleware. |
| **Design System** | Tailwind CSS + shadcn/ui + 21st.dev | High-contrast dark theme, Bento grids, radial fade grid pattern, SVG meters. |
| **Database & Auth** | Supabase (PostgreSQL + Auth + RLS) | User authentication, row-level security isolation, and relational tables. |
| **AI Intelligence** | Anthropic Claude 3.5 Haiku | Fast, structured JSON ATS scoring, keyword extraction, and bullet rewriting. |
| **Scraping Engine** | Apify (`apify-client`) | LinkedIn profile scraper, LinkedIn job posting scraper, PDF resume parser. |
| **Transactional Email** | Resend API | Welcome emails, trial ending reminders (2-day notice), link paused notifications. |
| **Version Control** | GitHub (`https://github.com/Ilg11/cv.git`) | Continuous delivery and deployment. |

---

## 5. System Architecture & Routes

### Core Pages
- `/`: 21st.dev high-conversion marketing landing page with interactive ATS demo.
- `/dashboard`: Candidate command center (Resumes list, metric cards, create dialog, actions).
- `/resumes/[id]`: Dual-pane editor with live preview, autosave, AI bullet enhancer wand, and A4/Letter switcher.
- `/resumes/[id]/optimize`: AI ATS Optimizer (LinkedIn job URL auto-fetch with Apify, 0-100 score gauge, before/after diffs).
- `/cv/[slug]`: Public recruiter view with view counter and neutral paywall gate.
- `/billing`: Membership status, trial countdown, JSON export, and account deletion.
- `/login` & `/register`: Instant password authentication without friction.
- `/terms`, `/privacy`, `/refunds`: Legal documentation.

### Backend API Endpoints
- `POST /api/auth/register`: Auto-confirming registration endpoint.
- `GET /api/auth/me`: Current authenticated user and profile state.
- `GET /api/resumes` & `POST /api/resumes`: Resume CRUD operations.
- `GET / PUT / DELETE /api/resumes/[id]`: Single resume operations.
- `POST /api/resumes/[id]/duplicate`: Instant resume cloner for custom job targeting.
- `POST /api/import/linkedin`: Apify LinkedIn profile extractor.
- `POST /api/import/pdf`: Multi-page PDF resume parser.
- `POST /api/scrape/job`: Apify LinkedIn job details extractor.
- `POST /api/optimize`: Claude 3.5 Haiku ATS match scoring and suggestion engine.
- `POST /api/ai/enhance-bullet`: Google XYZ formula bullet point enhancer.
- `POST /api/links` & `PATCH /api/links`: Shareable recruiter link generator.
- `GET /api/export/json`: Complete career data export.
- `POST /api/account/delete`: GDPR/KVKK compliant cascade account removal.

---

## 6. Database Schema (Supabase)
1. `public.profiles`: 1:1 with `auth.users`, holds subscription and access fields.
2. `public.resumes`: Stored CVs with title, template (`classic`, `modern`, `compact`), and JSONB content.
3. `public.shared_links`: Unique slugs, view tracking, and recruiter company tags.
4. `public.job_analyses`: Saved ATS analysis scores, keyword breakdowns, and recommendations.
5. `public.usage_events`: Rate limiting and abuse prevention (24-hour sliding window).

---

## 7. AI & ATS Optimization Rules
1. **Zero Fabrication:** The AI never invents false employers, titles, dates, certifications, or imaginary metrics.
2. **Standard XYZ Structure:** Bullet points follow *"Accomplished [X] as measured by [Y] by doing [Z]"*.
3. **Structured Outputs:** Strict Zod schema validation on all model responses.
4. **Prompt Injection Defense:** Job descriptions and candidate text are treated purely as inert data.
