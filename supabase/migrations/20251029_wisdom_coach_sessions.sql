-- Phoenix Wisdom Coach - Voice Recording & AI Analysis System
-- Database schema for storing coaching sessions with AI-powered insights

-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- Coaching sessions table
create table if not exists public.wisdom_coach_sessions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- User info
  user_id uuid references auth.users(id) on delete cascade not null,
  tenant_id text references public."Tenant"(id) on delete cascade,

  -- Recording data
  audio_url text,
  duration_seconds integer,

  -- Transcription
  transcript text,

  -- AI Analysis
  tags text[],
  sentiment jsonb, -- {overall: 'positive'|'neutral'|'negative', scores: {...}}
  themes jsonb, -- extracted themes and topics
  insights text, -- GPT-generated insights
  coach_response text, -- AI coach's personalized response

  -- Embeddings for semantic search
  embedding vector(1536),

  -- Metadata
  metadata jsonb default '{}'::jsonb,

  -- Indexes
  index(user_id),
  index(created_at desc)
);

-- Enable RLS
alter table public.wisdom_coach_sessions enable row level security;

-- RLS Policies
create policy "Users can view their own sessions"
  on public.wisdom_coach_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.wisdom_coach_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on public.wisdom_coach_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on public.wisdom_coach_sessions for delete
  using (auth.uid() = user_id);

-- Auto-update timestamp trigger
create or replace function public.handle_wisdom_coach_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_wisdom_coach_session_updated
  before update on public.wisdom_coach_sessions
  for each row execute function public.handle_wisdom_coach_updated_at();

-- Indexes for performance
create index idx_wisdom_coach_sessions_user_id on public.wisdom_coach_sessions(user_id);
create index idx_wisdom_coach_sessions_created_at on public.wisdom_coach_sessions(created_at desc);
create index idx_wisdom_coach_sessions_tags on public.wisdom_coach_sessions using gin(tags);

-- Comments for documentation
comment on table public.wisdom_coach_sessions is 'Stores Phoenix Wisdom Coach voice sessions with AI analysis';
comment on column public.wisdom_coach_sessions.transcript is 'Whisper API transcription of voice recording';
comment on column public.wisdom_coach_sessions.sentiment is 'GPT-analyzed emotional sentiment';
comment on column public.wisdom_coach_sessions.themes is 'Extracted themes and topics from reflection';
comment on column public.wisdom_coach_sessions.insights is 'AI-generated insights and observations';
comment on column public.wisdom_coach_sessions.coach_response is 'Personalized coaching response';
comment on column public.wisdom_coach_sessions.embedding is 'Vector embedding for semantic search';
