-- WisdomOS Seed Data
-- Initialize life areas and sample contacts aligned with Fulfillment Display

-- === Life Areas (13 areas from Fulfillment Display) ===
INSERT INTO life_areas (id, name, description) VALUES
(1, 'Work & Purpose', 'PVT Hostel, Meta-Agent, JSF, StudioNYNE'),
(2, 'Health', 'Recovery, vitality, mobility'),
(3, 'Finance', 'Wealth strategy, clean records'),
(4, 'Intimacy & Love', 'Deep connection and partnership'),
(5, 'Time & Energy Management', 'Focus blocks, pacing'),
(6, 'Spiritual Alignment', 'Inner guidance, sacred silence'),
(7, 'Creativity & Expression', 'Writing, design, media'),
(8, 'Friendship & Community', 'Non-transactional support'),
(9, 'Learning & Growth', 'Tech, systems, systems thinking'),
(10, 'Home & Environment', 'Comfort, order'),
(11, 'Sexuality', 'Exploration, embodiment'),
(12, 'Emotional Regulation & Inner Child', 'Reparenting, clarity'),
(13, 'Legacy & Archives', 'Preservation & access to body of work')
ON CONFLICT (id) DO NOTHING;

-- === Sample Contacts ===
INSERT INTO contacts (first_name, last_name, email, phone_e164, notes, tags)
VALUES
('Djamel', '', 'djamel@example.com', NULL, 'Partner across intimacy, health, spirituality, sexuality', '{partner,core}'),
('Michael', 'Smith', 'michael@example.com', NULL, 'Friend / operations reflection', '{friend,ops}'),
('Zied', 'Johnson', 'zied@example.com', NULL, 'Tactical & design insight', '{friend,design}'),
('Sarah', 'Therapist', 'sarah@therapy.com', NULL, 'Professional support: emotional & intimacy', '{professional,therapy}'),
('John', 'Accountant', 'john@accounting.com', NULL, 'Finance advisor', '{professional,finance}'),
('Bank', 'Advisor', 'advisor@bank.com', NULL, 'Banking support', '{professional,finance}'),
('Legal', 'Support', 'legal@lawfirm.com', NULL, 'Dispute/legal support', '{professional,legal}')
ON CONFLICT (email) DO NOTHING
RETURNING id, first_name, last_name;

-- === Link contacts to life areas ===

-- Djamel - Partner connected to multiple life areas
INSERT INTO contact_life_area_links (contact_id, life_area_id, role_label, frequency, weight, outcomes)
SELECT c.id, la.id, 'partner', 'daily', 0.9,
CASE la.id
  WHEN 4 THEN 'Presence, honesty, shared vision'
  WHEN 2 THEN 'Meal/rest support & encouragement'
  WHEN 6 THEN 'Occasional spiritual dialogue'
  WHEN 11 THEN 'Embodiment/erotic safety'
END
FROM contacts c
JOIN life_areas la ON la.id IN (2, 4, 6, 11)
WHERE c.first_name = 'Djamel'
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- Michael - Operations support & friendship
INSERT INTO contact_life_area_links (contact_id, life_area_id, role_label, frequency, weight, outcomes)
SELECT c.id, la.id, 'ops support', 'weekly', 0.6,
CASE la.id 
  WHEN 1 THEN 'Tasks & ops reflection' 
  WHEN 8 THEN 'Friendship balance' 
END
FROM contacts c 
JOIN life_areas la ON la.id IN (1, 8)
WHERE c.first_name = 'Michael'
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- Zied - Design & tactical support
INSERT INTO contact_life_area_links (contact_id, life_area_id, role_label, frequency, weight, outcomes)
SELECT c.id, la.id, 'design insight', 'weekly', 0.5, 'Tactical/design input'
FROM contacts c 
JOIN life_areas la ON la.id IN (1, 8)
WHERE c.first_name = 'Zied'
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- Therapist - Emotional & intimacy support
INSERT INTO contact_life_area_links (contact_id, life_area_id, role_label, frequency, weight, outcomes)
SELECT c.id, la.id, 'therapist', 'weekly', 0.7,
CASE la.id 
  WHEN 12 THEN 'Reparenting/clarity' 
  WHEN 4 THEN 'Intimacy unpacking' 
END
FROM contacts c 
JOIN life_areas la ON la.id IN (12, 4)
WHERE c.first_name = 'Sarah'
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- Financial professionals
INSERT INTO contact_life_area_links (contact_id, life_area_id, role_label, frequency, weight, outcomes)
SELECT c.id, 3, 'accountant', 'monthly', 0.6, 'Planning & clean records'
FROM contacts c 
WHERE c.first_name = 'John'
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

INSERT INTO contact_life_area_links (contact_id, life_area_id, role_label, frequency, weight, outcomes)
SELECT c.id, 3, 'bank advisor', 'quarterly', 0.4, 'Cashflow options'
FROM contacts c 
WHERE c.first_name = 'Bank'
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

INSERT INTO contact_life_area_links (contact_id, life_area_id, role_label, frequency, weight, outcomes)
SELECT c.id, 3, 'legal support', 'as-needed', 0.3, 'Dispute resolution'
FROM contacts c 
WHERE c.first_name = 'Legal'
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- === Sample Interactions ===

-- WhatsApp message with Djamel
INSERT INTO interactions (
  contact_id, life_area_id, occurred_at, channel, direction,
  subject, body_text, sentiment, sentiment_score, topics, meta
)
SELECT c.id, 4, now() - interval '1 day', 'whatsapp', 'inbound',
       'Evening check-in',
       'Hey love, how was your day? Thinking about our weekend plans.',
       'positive', 0.65,
       ARRAY['connection', 'check-in', 'planning'],
       jsonb_build_object('source', 'whatsapp', 'thread_id', 'wa_abc123')
FROM contacts c 
WHERE c.first_name = 'Djamel';

-- Call with Michael about operations
INSERT INTO interactions (
  contact_id, life_area_id, occurred_at, channel, direction,
  subject, body_text, sentiment, sentiment_score, topics, meta
)
SELECT c.id, 1, now() - interval '3 days', 'call', 'outbound',
       'Weekly ops sync',
       'Discussed project timeline and resource allocation',
       'neutral', 0.5,
       ARRAY['operations', 'planning', 'resources'],
       jsonb_build_object('duration_minutes', 45)
FROM contacts c 
WHERE c.first_name = 'Michael';

-- === Sample Relationship Assessments ===

-- Assessment for Djamel
INSERT INTO relationship_assessments
(contact_id, life_area_id, assessed_on, trust_score, communication, reliability, alignment, overall, notes)
SELECT c.id, 4, CURRENT_DATE - interval '7 days', 4.5, 4.0, 4.0, 4.8, 4.3, 
       'Post-weekend reflection: Strong connection, working on communication patterns'
FROM contacts c 
WHERE c.first_name = 'Djamel';

-- Assessment for Michael
INSERT INTO relationship_assessments
(contact_id, life_area_id, assessed_on, trust_score, communication, reliability, alignment, overall, notes)
SELECT c.id, 1, CURRENT_DATE - interval '7 days', 4.0, 3.5, 4.5, 3.8, 4.0,
       'Reliable ops support, could improve communication frequency'
FROM contacts c 
WHERE c.first_name = 'Michael';

-- === Sample Autobiography Entries ===

-- Create demo user
DO $$
DECLARE
  demo_user_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  -- 1990 - Birth year
  INSERT INTO autobiography_entries (
    user_id, year, title, narrative, meaning, insight, commitment,
    life_areas, tags, emotional_charge, category, completion_status
  ) VALUES (
    demo_user_id, 1990,
    'The Beginning of My Journey',
    'This was the year everything began. A new form of organized energy came into being.',
    'Every beginning contains all future possibilities',
    'I was born complete, not lacking anything',
    'Honor my original nature',
    ARRAY['Spiritual Alignment', 'Legacy & Archives'],
    ARRAY['birth', 'beginning', 'potential'],
    5.0, 'milestone', 'complete'
  );

  -- 2010 - Career turning point
  INSERT INTO autobiography_entries (
    user_id, year, title, narrative, meaning, insight, commitment,
    life_areas, tags, emotional_charge, category, completion_status
  ) VALUES (
    demo_user_id, 2010,
    'Finding My Purpose',
    'Left traditional employment to pursue entrepreneurial vision. Started first business.',
    'True security comes from following your calling',
    'Fear of failure is less dangerous than not trying',
    'Trust the process even when the path is unclear',
    ARRAY['Work & Purpose', 'Finance', 'Learning & Growth'],
    ARRAY['career', 'risk', 'entrepreneurship'],
    4.5, 'milestone', 'complete'
  );

  -- 2020 - Relationship milestone
  INSERT INTO autobiography_entries (
    user_id, year, title, narrative, meaning, insight, commitment,
    life_areas, tags, emotional_charge, category, completion_status,
    earliest_occurrence
  ) VALUES (
    demo_user_id, 2020,
    'Opening to Love',
    'Met Djamel and began the journey of deep partnership.',
    'Love requires vulnerability and courage',
    'Partnership amplifies both growth and healing',
    'Show up fully, even when afraid',
    ARRAY['Intimacy & Love', 'Emotional Regulation & Inner Child'],
    ARRAY['love', 'partnership', 'vulnerability'],
    5.0, 'relationship', 'complete',
    '{"year": 2015, "description": "First attempted to open up in previous relationship"}'::jsonb
  );
END $$;