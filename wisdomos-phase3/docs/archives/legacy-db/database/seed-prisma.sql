-- WisdomOS Seed Data for Prisma Schema
-- Compatible with Prisma's UUID string format

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

-- === Sample Contacts with UUIDs ===
INSERT INTO contacts (id, first_name, last_name, email, phone_e164, notes, tags)
VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Djamel', 'Partner', 'djamel@example.com', NULL, 'Partner across intimacy, health, spirituality, sexuality', '{partner,core}'),
('550e8400-e29b-41d4-a716-446655440002', 'Michael', 'Smith', 'michael@example.com', NULL, 'Friend / operations reflection', '{friend,ops}'),
('550e8400-e29b-41d4-a716-446655440003', 'Zied', 'Johnson', 'zied@example.com', NULL, 'Tactical & design insight', '{friend,design}'),
('550e8400-e29b-41d4-a716-446655440004', 'Sarah', 'Therapist', 'sarah@therapy.com', NULL, 'Professional support: emotional & intimacy', '{professional,therapy}'),
('550e8400-e29b-41d4-a716-446655440005', 'John', 'Accountant', 'john@accounting.com', NULL, 'Finance advisor', '{professional,finance}'),
('550e8400-e29b-41d4-a716-446655440006', 'Bank', 'Advisor', 'advisor@bank.com', NULL, 'Banking support', '{professional,finance}'),
('550e8400-e29b-41d4-a716-446655440007', 'Legal', 'Support', 'legal@lawfirm.com', NULL, 'Dispute/legal support', '{professional,legal}')
ON CONFLICT (email) DO NOTHING;

-- === Link contacts to life areas ===

-- Djamel - Partner connected to multiple life areas
INSERT INTO contact_life_area_links (id, contact_id, life_area_id, role_label, frequency, weight, outcomes)
VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 4, 'partner', 'daily', 0.9, 'Presence, honesty, shared vision'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 2, 'partner', 'daily', 0.9, 'Meal/rest support & encouragement'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 6, 'partner', 'weekly', 0.7, 'Occasional spiritual dialogue'),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 11, 'partner', 'weekly', 0.8, 'Embodiment/erotic safety')
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- Michael - Operations support & friendship
INSERT INTO contact_life_area_links (id, contact_id, life_area_id, role_label, frequency, weight, outcomes)
VALUES
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 1, 'advisor', 'weekly', 0.6, 'Operations clarity & accountability'),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 8, 'friend', 'weekly', 0.7, 'Non-transactional support')
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- Professional relationships
INSERT INTO contact_life_area_links (id, contact_id, life_area_id, role_label, frequency, weight, outcomes)
VALUES
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 12, 'therapist', 'weekly', 0.8, 'Emotional clarity & processing'),
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005', 3, 'advisor', 'monthly', 0.6, 'Financial strategy & compliance'),
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440006', 3, 'advisor', 'quarterly', 0.5, 'Banking & investment guidance')
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- === Sample Interactions ===
INSERT INTO interactions (id, contact_id, life_area_id, channel, direction, subject, body_text, sentiment, sentiment_score, topics)
VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 4, 'meeting', 'internal', 'Morning check-in', 'Had a great conversation about our future plans', 'positive', 0.8, '{planning,future,relationship}'),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 1, 'call', 'internal', 'PVT Hostel strategy', 'Discussed new booking system improvements', 'positive', 0.7, '{business,strategy,pvthostel}'),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 12, 'meeting', 'internal', 'Therapy session', 'Worked through childhood patterns affecting current relationships', 'neutral', 0.5, '{therapy,healing,patterns}')
ON CONFLICT DO NOTHING;

-- === Sample Relationship Assessments ===
INSERT INTO relationship_assessments (id, contact_id, life_area_id, trust_score, communication, reliability, alignment, overall, notes)
VALUES
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 4, 9.5, 9.0, 9.5, 9.0, 9.2, 'Strong foundation, growing together'),
('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 1, 8.0, 8.5, 8.0, 7.5, 8.0, 'Reliable operational support'),
('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 12, 9.0, 9.5, 9.0, 8.5, 9.0, 'Excellent therapeutic alliance')
ON CONFLICT (contact_id, life_area_id, assessed_on) DO NOTHING;

-- === Sample Integration Configuration ===
INSERT INTO integrations (id, kind, status, external_app, settings)
VALUES
('950e8400-e29b-41d4-a716-446655440001', 'hubspot', 'connected', 'HubSpot CRM', '{"sync_enabled": true, "sync_interval": "hourly"}'::jsonb),
('950e8400-e29b-41d4-a716-446655440002', 'calendar', 'pending', 'Google Calendar', '{"calendars": []}'::jsonb)
ON CONFLICT DO NOTHING;