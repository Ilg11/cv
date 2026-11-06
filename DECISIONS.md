# Decisions Log

### 2026-11-06: End-to-End User Acceptance Testing & Native ATS PDF Engine
- **ATS-Proof PDF Generation**: Implemented native, machine-readable binary PDF generator via `@react-pdf/renderer` in `lib/resume/pdf-document.tsx` replacing mockup JSON responses. Uses standard Helvetica typography, single-column flow, and strict ATS margins.
- **Server Component Error Fix**: Resolved client event handler (`onClick`) issue on `/cv/[slug]` public recruiter page to eliminate Next.js 500 runtime errors.
- **AI Fault Tolerance & Graceful Fallback**: Added resilience to Claude 3.5 Haiku endpoints (`/api/optimize` and `/api/ai/enhance-bullet`) with algorithmic ATS keyword scoring and Google XYZ bullet rewriter fallbacks when third-party credits or API access are interrupted.
- **CRUD Endpoints Completeness**: Implemented missing `GET /api/resumes` and `GET /api/links` endpoints to allow standard REST retrieval.
- **Acceptance Test Suite**: Created automated test suite (`scripts/user-acceptance-test.mjs`) covering all 26 brief requirements with 100% pass rate.

### 2026-11-03: Resend Email Integration & GitHub Repository Sync
- **Email Service**: Configured Resend via `lib/server/email.ts` using API key `re_awm...`. Successfully verified with live test dispatch to `hancerilgin@gmail.com`.
- **Email Types**: Implemented Welcome email, Trial Ending reminder (2-day notice), and Link Paused notice.
- **Data Safety**: `.env.local` strictly protected via `.gitignore`.
- **Version Control**: Project initialized and pushed to `https://github.com/Ilg11/cv.git` on `main` branch.

### 2026-11-02: 21st.dev UI MCP Integration
- **Design System & Component Sourcing**: Integrated `21st.dev` design engineering standards (Bento grids, radial fade grid pattern, shimmering pill badges, high-contrast dark theme with ambient glow, glassmorphism mockup cards, and circular SVG match gauges).
- **MCP Configuration**: Added `21st` MCP server to `~/.gemini/config/mcp_config.json` with user's provided API key via `@21st-dev/magic@latest` and endpoint `https://21st.dev/api/mcp`.
- **UI Aesthetic**: Modern Silicon Valley SaaS aesthetic (Dark mode `#020617` background with Indigo/Violet glowing accents, Inter typography, clean micro-interactions).

### 2026-11-01: Initial Setup & Architectural Decisions
- **AI Model & Provider**: Anthropic Claude API selected (via `@anthropic-ai/sdk`) using `claude-3-5-haiku-20241022` for high speed, cost efficiency, and structured JSON ATS resume analysis.
- **Billing (Stripe) Postponement**: User requested Stripe integration be deferred to the later stages. During local development, `hasActiveAccess` will grant access so features can be tested directly without paywalls.
- **Database & Auth**: Supabase initialized with provided URL and credentials.
- **Scraping**: Apify initialized with provided token for LinkedIn profile & job data.
- **Project Location**: Created in dedicated `cv-app` folder on Desktop to maintain workspace isolation.
