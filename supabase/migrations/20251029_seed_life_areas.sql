-- =========================
-- Seed 13 Life Areas from Fulfillment Display
-- =========================
-- Created: 2025-10-29
-- Purpose: Populate default life areas with commitments and coaches
-- =========================

-- Seed 13 Life Areas
insert into public.areas (slug, name, commitment, attention_level)
values
  ('health-vitality', 'Health & Vitality', 'I am vibrant, energized, and physically capable', 5),
  ('intimate-partnership', 'Intimate Partnership', 'I am deeply connected, supportive, and growing with my partner', 5),
  ('family-relationships', 'Family & Relationships', 'I am present, loving, and available to my family', 4),
  ('career-purpose', 'Career & Purpose', 'I am making a meaningful impact through my work', 5),
  ('financial-abundance', 'Financial Abundance', 'I am financially secure and generous', 4),
  ('personal-growth', 'Personal Growth', 'I am continuously learning and evolving', 5),
  ('creativity-expression', 'Creativity & Expression', 'I am expressing myself authentically and creatively', 3),
  ('social-community', 'Social & Community', 'I am connected and contributing to my community', 3),
  ('physical-environment', 'Physical Environment', 'I am surrounded by beauty, order, and functionality', 4),
  ('recreation-fun', 'Recreation & Fun', 'I am playful, adventurous, and enjoying life', 3),
  ('spiritual-practice', 'Spiritual Practice', 'I am connected to something greater than myself', 4),
  ('contribution-legacy', 'Contribution & Legacy', 'I am building something that will outlast me', 5),
  ('rest-recovery', 'Rest & Recovery', 'I am rested, restored, and balanced', 3)
on conflict (slug) do nothing;

-- =========================
-- Seed Default Dimensions per Area
-- =========================

-- Health & Vitality
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['vitality', 'strength', 'flexibility', 'endurance', 'recovery']),
  unnest(array['Vitality', 'Strength', 'Flexibility', 'Endurance', 'Recovery']),
  1.0
from public.areas
where slug = 'health-vitality'
on conflict (area_id, key) do nothing;

-- Intimate Partnership
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['connection', 'intimacy', 'communication', 'support', 'growth']),
  unnest(array['Connection', 'Intimacy', 'Communication', 'Support', 'Growth']),
  1.0
from public.areas
where slug = 'intimate-partnership'
on conflict (area_id, key) do nothing;

-- Family & Relationships
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['presence', 'love', 'availability', 'boundaries', 'harmony']),
  unnest(array['Presence', 'Love', 'Availability', 'Boundaries', 'Harmony']),
  1.0
from public.areas
where slug = 'family-relationships'
on conflict (area_id, key) do nothing;

-- Career & Purpose
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['impact', 'fulfillment', 'growth', 'recognition', 'mastery']),
  unnest(array['Impact', 'Fulfillment', 'Growth', 'Recognition', 'Mastery']),
  1.0
from public.areas
where slug = 'career-purpose'
on conflict (area_id, key) do nothing;

-- Financial Abundance
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['security', 'abundance', 'generosity', 'clarity', 'freedom']),
  unnest(array['Security', 'Abundance', 'Generosity', 'Clarity', 'Freedom']),
  1.0
from public.areas
where slug = 'financial-abundance'
on conflict (area_id, key) do nothing;

-- Personal Growth
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['learning', 'evolution', 'awareness', 'curiosity', 'transformation']),
  unnest(array['Learning', 'Evolution', 'Awareness', 'Curiosity', 'Transformation']),
  1.0
from public.areas
where slug = 'personal-growth'
on conflict (area_id, key) do nothing;

-- Creativity & Expression
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['authenticity', 'creativity', 'expression', 'flow', 'inspiration']),
  unnest(array['Authenticity', 'Creativity', 'Expression', 'Flow', 'Inspiration']),
  1.0
from public.areas
where slug = 'creativity-expression'
on conflict (area_id, key) do nothing;

-- Social & Community
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['connection', 'contribution', 'belonging', 'reciprocity', 'impact']),
  unnest(array['Connection', 'Contribution', 'Belonging', 'Reciprocity', 'Impact']),
  1.0
from public.areas
where slug = 'social-community'
on conflict (area_id, key) do nothing;

-- Physical Environment
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['beauty', 'order', 'functionality', 'comfort', 'inspiration']),
  unnest(array['Beauty', 'Order', 'Functionality', 'Comfort', 'Inspiration']),
  1.0
from public.areas
where slug = 'physical-environment'
on conflict (area_id, key) do nothing;

-- Recreation & Fun
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['play', 'adventure', 'joy', 'spontaneity', 'variety']),
  unnest(array['Play', 'Adventure', 'Joy', 'Spontaneity', 'Variety']),
  1.0
from public.areas
where slug = 'recreation-fun'
on conflict (area_id, key) do nothing;

-- Spiritual Practice
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['connection', 'practice', 'faith', 'peace', 'transcendence']),
  unnest(array['Connection', 'Practice', 'Faith', 'Peace', 'Transcendence']),
  1.0
from public.areas
where slug = 'spiritual-practice'
on conflict (area_id, key) do nothing;

-- Contribution & Legacy
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['impact', 'legacy', 'vision', 'sustainability', 'inspiration']),
  unnest(array['Impact', 'Legacy', 'Vision', 'Sustainability', 'Inspiration']),
  1.0
from public.areas
where slug = 'contribution-legacy'
on conflict (area_id, key) do nothing;

-- Rest & Recovery
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['rest', 'restoration', 'balance', 'sleep', 'renewal']),
  unnest(array['Rest', 'Restoration', 'Balance', 'Sleep', 'Renewal']),
  1.0
from public.areas
where slug = 'rest-recovery'
on conflict (area_id, key) do nothing;

-- =========================
-- Create Coaches for All Areas
-- =========================

do $$
declare
  r record;
begin
  for r in select id, name, commitment from public.areas loop
    perform public.create_or_update_coach(
      r.id,
      r.name || ' Coach',
      format('
You are the %s Coach.
Operate from: "%s".

Framework:
- Use WE2: assess relational "state & condition" (capability, not feelings).
- Use WE3: "issue-free" living; reframe to: "This is what having what I want looks like now."

Modes:
- Immediate: Present moment awareness
- Structural: Patterns and systems
- Generative: Creating new possibilities
- Representational: Identity and narrative

Coaching Strategy:
- If score < 3 → Restoration Mode (requests/promises/boundaries)
- If score ≥ 4 → Play Mode (social experiments, speculation/inquiry)

Process:
- Log insights to autobiography when user approves
- Track dimension signals (0-5 scale)
- Use WE2 assessments for relationship capability
- Focus on fulfillment, not problem-solving

Your role is to guide, inquire, and support the user in living from their commitment while maintaining awareness of relational capability and generative possibilities.', r.name, r.commitment)
    );
  end loop;
end $$;

-- =========================
-- Sample Signals (Optional - for testing)
-- =========================

-- Uncomment to seed sample signals for last 30 days
/*
do $$
declare
  r record;
  d int;
  dim text;
begin
  for r in select id from public.areas loop
    for d in 0..29 loop
      -- Get random dimension for this area
      select key into dim from public.area_dimensions
      where area_id = r.id
      order by random()
      limit 1;

      -- Insert signal with random value 2-5
      insert into public.dim_signals (area_id, dimension_key, value, at)
      values (
        r.id,
        dim,
        2 + random() * 3,  -- Random value between 2 and 5
        now() - (d || ' days')::interval
      );
    end loop;
  end loop;
end $$;
*/
