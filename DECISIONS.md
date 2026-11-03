# Decisions Log

### 2026-11-02: 21st.dev UI MCP Integration
- **Design System & Component Sourcing**: Integrated `21st.dev` design engineering standards (Bento grids, radial fade grid pattern, shimmering pill badges, high-contrast dark theme with ambient glow, glassmorphism mockup cards, and circular SVG match gauges).
- **MCP Configuration**: Added `21st` MCP server to `~/.gemini/config/mcp_config.json` with user's provided API key `8ee0d98d2788463f85b6b05ce0a5d7e5de13805392641c9fd521843107b56cf0` via `@21st-dev/magic@latest` and endpoint `https://21st.dev/api/mcp`.
- **UI Aesthetic**: Modern Silicon Valley SaaS aesthetic (Dark mode `#020617` background with Indigo/Violet glowing accents, Inter typography, clean micro-interactions).

### 2026-11-01: Initial Setup & Architectural Decisions
- **AI Model & Provider**: Anthropic Claude API selected (via `@anthropic-ai/sdk`) using `claude-3-5-haiku-20241022` for high speed, cost efficiency, and structured JSON ATS resume analysis.
- **Billing (Stripe) Postponement**: User requested Stripe integration be deferred to the later stages. During local development, `hasActiveAccess` will grant access so features can be tested directly without paywalls.
- **Database & Auth**: Supabase initialized with provided URL and credentials.
- **Scraping**: Apify initialized with provided token for LinkedIn profile & job data.
- **Project Location**: Created in dedicated `cv-app` folder on Desktop to maintain workspace isolation.
