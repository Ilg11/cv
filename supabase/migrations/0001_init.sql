create extension if not exists "pgcrypto";

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- 1) PROFILES (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text not null default 'active'
    check (subscription_status in ('none','trialing','active','past_due','canceled')),
  trial_end_date timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  past_due_since timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile when someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) RESUMES
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Untitled resume',
  template text not null default 'classic' check (template in ('classic','modern','compact')),
  source text not null default 'scratch' check (source in ('scratch','linkedin','pdf')),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index resumes_user_idx on public.resumes(user_id);
create trigger resumes_updated_at before update on public.resumes
  for each row execute function public.set_updated_at();

-- 3) SHARED LINKS
create table public.shared_links (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  company_name text,
  is_active boolean not null default true,
  view_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index shared_links_user_idx on public.shared_links(user_id);

-- 4) JOB ANALYSES (optimizer results)
create table public.job_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  job_url text,
  job_title text,
  job_company text,
  job_description text not null,
  ats_score integer check (ats_score between 0 and 100),
  missing_keywords jsonb not null default '[]'::jsonb,
  optimized_content jsonb,
  created_at timestamptz not null default now()
);
create index job_analyses_user_idx on public.job_analyses(user_id, created_at desc);

-- 5) USAGE EVENTS (rate limiting / cost control)
create table public.usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('linkedin_import','pdf_parse','job_scrape','ai_optimize','pdf_export')),
  created_at timestamptz not null default now()
);
create index usage_events_lookup_idx on public.usage_events(user_id, kind, created_at desc);

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.shared_links enable row level security;
alter table public.job_analyses enable row level security;
alter table public.usage_events enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "resumes_all_own" on public.resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "links_all_own" on public.shared_links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "analyses_select_own" on public.job_analyses
  for select using (auth.uid() = user_id);

create policy "usage_select_own" on public.usage_events
  for select using (auth.uid() = user_id);
