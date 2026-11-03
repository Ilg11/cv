# CVForge - AI Resume Builder & ATS Optimizer SaaS

B2C SaaS platform that empowers job seekers to build ATS-friendly resumes, import from LinkedIn, optimize against job descriptions using Claude 3.5 AI, and share live recruiter links.

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Lucide Icons
- **Backend & Auth**: Supabase (PostgreSQL + Auth + Row Level Security)
- **AI Engine**: Anthropic Claude 3.5 Haiku (`@anthropic-ai/sdk`)
- **Scraping**: Apify (`apify-client`)
- **PDF & Print**: Machine-readable ATS formats

## Getting Started

1. Clone or open this folder in terminal:
```bash
cd cv-app
```

2. Install dependencies:
```bash
npm install
```

3. Ensure `.env.local` is present with your credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `APIFY_API_TOKEN`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
