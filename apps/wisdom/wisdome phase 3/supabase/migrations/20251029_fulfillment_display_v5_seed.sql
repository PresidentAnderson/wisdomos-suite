-- =====================================================
-- Fulfillment Display v5 — Seed Data
-- =====================================================
-- Areas, Dimensions, and baseline configuration
-- =====================================================

-- =====================================================
-- SEED: AREAS (16 canonical life dimensions)
-- =====================================================

INSERT INTO fd_area (code, name, emoji, color, weight_default, description) VALUES
('WRK', 'Work/Enterprise', '🧱', '#6B4EFF', 0.08, 'Professional work, business operations, and enterprise activities'),
('PUR', 'Purpose/Calling', '✨', '#FF7A59', 0.08, 'Life mission, calling, and deeper purpose alignment'),
('MUS', 'Music (Creative)', '🎵', '#2EC5B6', 0.06, 'Musical composition, production, and creative expression'),
('WRT', 'Writing (Creative)', '✍️', '#FFCE00', 0.06, 'Written creative works, manuscripts, and publications'),
('SPE', 'Public Speaking', '🎤', '#8855FF', 0.04, 'Public presentations, talks, and speaking engagements'),
('LRN', 'Learning & Growth', '📚', '#3FA9F5', 0.07, 'Continuous learning, skill development, and personal growth'),
('HLT', 'Health & Vitality', '🩺', '#E83F6F', 0.10, 'Physical health, fitness, nutrition, and vitality'),
('SPF', 'Spiritual Development', '🕊️', '#7CC576', 0.07, 'Spiritual practices, connection, and inner development'),
('FIN', 'Finance & Wealth Health', '💹', '#1F6FEB', 0.12, 'Financial security, wealth building, and fiscal health'),
('FAM', 'Family', '🏡', '#F97316', 0.09, 'Family relationships, boundaries, and rituals'),
('FRD', 'Friendship', '🤝', '#10B981', 0.06, 'Close friendships, reciprocity, and connection'),
('COM', 'Community', '🏘️', '#A855F7', 0.05, 'Community engagement, service, and belonging'),
('LAW', 'Law & Justice', '⚖️', '#111827', 0.04, 'Legal matters, justice pursuit, and compliance'),
('INT', 'Integrity & Recovery', '🧭', '#64748B', 0.04, 'Personal integrity, promise-keeping, and recovery'),
('FOR', 'Forgiveness & Reconciliation', '🤍', '#9CA3AF', 0.02, 'Forgiveness work, amends, and reconciliation'),
('AUT', 'Autobiography (Narrative)', '📖', '#0EA5E9', 0.02, 'Life narrative, story coherence, and meaning-making');

-- =====================================================
-- SEED: DIMENSIONS FOR EACH AREA
-- =====================================================

-- WRK — Work/Enterprise
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'WRK'), 'OPS_THROUGHPUT', 'Operations Throughput', 1.0, 'Volume and velocity of work completed'),
((SELECT id FROM fd_area WHERE code = 'WRK'), 'QUALITY', 'Quality of Delivery', 1.0, 'Excellence and craftsmanship in output'),
((SELECT id FROM fd_area WHERE code = 'WRK'), 'TRUST', 'Team/Partner Trust', 1.0, 'Relationship quality with collaborators'),
((SELECT id FROM fd_area WHERE code = 'WRK'), 'FOCUS_TIME', 'Focus Time Ratio', 1.0, 'Deep work vs. reactive work ratio'),
((SELECT id FROM fd_area WHERE code = 'WRK'), 'SYSTEMS', 'Systemization Progress', 1.0, 'Process automation and documentation');

-- PUR — Purpose/Calling
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'PUR'), 'MISSION_CLARITY', 'Mission Clarity', 1.0, 'Clarity on life purpose and calling'),
((SELECT id FROM fd_area WHERE code = 'PUR'), 'CONTRIBUTION_FELT', 'Contribution Felt', 1.0, 'Sense of meaningful impact'),
((SELECT id FROM fd_area WHERE code = 'PUR'), 'ENERGY_ALIGN', 'Energy Alignment', 1.0, 'Daily activities aligned with purpose'),
((SELECT id FROM fd_area WHERE code = 'PUR'), 'COURAGE', 'Courage (Hard Things)', 1.0, 'Willingness to ship challenging work');

-- MUS — Music (Creative)
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'MUS'), 'COMPOSITION', 'Composition Cadence', 1.0, 'Frequency and quality of new compositions'),
((SELECT id FROM fd_area WHERE code = 'MUS'), 'PRODUCTION', 'Production Pipeline', 1.0, 'Production workflow health'),
((SELECT id FROM fd_area WHERE code = 'MUS'), 'RELEASE', 'Release Velocity', 1.0, 'Publishing and distribution momentum'),
((SELECT id FROM fd_area WHERE code = 'MUS'), 'ENGAGEMENT', 'Audience Engagement', 1.0, 'Listener interaction and growth'),
((SELECT id FROM fd_area WHERE code = 'MUS'), 'IP_HYGIENE', 'IP/Metadata Hygiene', 1.0, 'Rights management and documentation');

-- WRT — Writing (Creative)
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'WRT'), 'DAILY_PAGES', 'Daily Pages', 1.0, 'Consistent writing practice'),
((SELECT id FROM fd_area WHERE code = 'WRT'), 'MANUSCRIPT', 'Manuscript Progress', 1.0, 'Long-form work advancement'),
((SELECT id FROM fd_area WHERE code = 'WRT'), 'EDITORIAL', 'Editorial Quality', 1.0, 'Editing and refinement rigor'),
((SELECT id FROM fd_area WHERE code = 'WRT'), 'PUBLICATION', 'Publication Cadence', 1.0, 'Publishing frequency and reach');

-- SPE — Public Speaking
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'SPE'), 'PIPELINE', 'Talk Pipeline', 1.0, 'Booked and completed engagements'),
((SELECT id FROM fd_area WHERE code = 'SPE'), 'REHEARSAL', 'Rehearsal Hours', 1.0, 'Preparation and practice time'),
((SELECT id FROM fd_area WHERE code = 'SPE'), 'FEEDBACK', 'Feedback NPS', 1.0, 'Audience satisfaction scores'),
((SELECT id FROM fd_area WHERE code = 'SPE'), 'CONTENT_REPO', 'Content Repository', 1.0, 'Talk materials organization');

-- LRN — Learning & Growth
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'LRN'), 'CURRICULUM', 'Curriculum Adherence', 1.0, 'Following structured learning paths'),
((SELECT id FROM fd_area WHERE code = 'LRN'), 'SKILLS_DEPTH', 'Skills Depth', 1.0, 'Mastery level in key competencies'),
((SELECT id FROM fd_area WHERE code = 'LRN'), 'TEACHING_BACK', 'Teaching-Back Frequency', 1.0, 'Knowledge sharing with others');

-- HLT — Health & Vitality
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'HLT'), 'SLEEP', 'Sleep Quality', 1.0, 'Sleep duration and restfulness'),
((SELECT id FROM fd_area WHERE code = 'HLT'), 'NUTRITION', 'Nutrition Compliance', 1.0, 'Dietary adherence and quality'),
((SELECT id FROM fd_area WHERE code = 'HLT'), 'MOVEMENT', 'Movement Minutes', 1.0, 'Physical activity and exercise'),
((SELECT id FROM fd_area WHERE code = 'HLT'), 'BIOMETRICS', 'Biometrics Trend', 1.0, 'Health markers trajectory');

-- SPF — Spiritual Development
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'SPF'), 'DISCOVERY', 'Discovery & Contemplation', 1.0, 'Spiritual exploration and reflection'),
((SELECT id FROM fd_area WHERE code = 'SPF'), 'CONNECTION', 'Sacred Connection', 1.0, 'Connection to meaningful places/objects'),
((SELECT id FROM fd_area WHERE code = 'SPF'), 'TRAVEL', 'Travel/New Lands', 1.0, 'Exposure to new spiritual contexts'),
((SELECT id FROM fd_area WHERE code = 'SPF'), 'PRACTICES', 'Practices Consistency', 1.0, 'Regular spiritual practices');

-- FIN — Finance & Wealth Health
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'FIN'), 'CASHFLOW', 'Cashflow Sufficiency', 1.0, 'Income vs. expenses health'),
((SELECT id FROM fd_area WHERE code = 'FIN'), 'RUNWAY', 'Savings Runway', 1.0, 'Months of financial security'),
((SELECT id FROM fd_area WHERE code = 'FIN'), 'TAX', 'Tax Compliance', 1.0, 'Tax obligations current status'),
((SELECT id FROM fd_area WHERE code = 'FIN'), 'STREAMS', 'Income Streams', 1.0, 'Diversity and stability of income');

-- FAM — Family
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'FAM'), 'BOUNDARIES', 'Boundaries/Peace', 1.0, 'Healthy boundaries and emotional safety'),
((SELECT id FROM fd_area WHERE code = 'FAM'), 'CONTACT', 'Intentional Contact', 1.0, 'Quality family interactions'),
((SELECT id FROM fd_area WHERE code = 'FAM'), 'REPAIR', 'Repair Attempts', 1.0, 'Conflict resolution efforts'),
((SELECT id FROM fd_area WHERE code = 'FAM'), 'RITUALS', 'Shared Rituals', 1.0, 'Family traditions and ceremonies');

-- FRD — Friendship
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'FRD'), 'RECIPROCITY', 'Reciprocity', 1.0, 'Mutual give-and-take balance'),
((SELECT id FROM fd_area WHERE code = 'FRD'), 'RELIABILITY', 'Reliability', 1.0, 'Showing up for friends consistently'),
((SELECT id FROM fd_area WHERE code = 'FRD'), 'DEPTH', 'Depth of Disclosure', 1.0, 'Vulnerability and authentic sharing');

-- COM — Community
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'COM'), 'EVENTS', 'Events Hosted/Attended', 1.0, 'Community participation frequency'),
((SELECT id FROM fd_area WHERE code = 'COM'), 'SERVICE', 'Service Hours', 1.0, 'Volunteer and service contributions'),
((SELECT id FROM fd_area WHERE code = 'COM'), 'BELONGING', 'Belonging Score', 1.0, 'Sense of community connection');

-- LAW — Law & Justice
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'LAW'), 'CASE_MOMENTUM', 'Case Momentum', 1.0, 'Progress on active legal matters'),
((SELECT id FROM fd_area WHERE code = 'LAW'), 'EVIDENCE', 'Evidence Archive', 1.0, 'Documentation and evidence quality'),
((SELECT id FROM fd_area WHERE code = 'LAW'), 'COMPLIANCE', 'Compliance Status', 1.0, 'Legal obligations adherence'),
((SELECT id FROM fd_area WHERE code = 'LAW'), 'RISK_HEAT', 'Risk Heat', 1.0, 'Legal risk assessment');

-- INT — Integrity & Recovery
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'INT'), 'PROMISE_TRACKING', 'Promise Tracking', 1.0, 'Commitments logged and monitored'),
((SELECT id FROM fd_area WHERE code = 'INT'), 'CLEANUP', 'Cleanup Completed', 1.0, 'Broken promises addressed'),
((SELECT id FROM fd_area WHERE code = 'INT'), 'TRIGGER_HANDLING', 'Trigger Handling', 1.0, 'Emotional triggers managed'),
((SELECT id FROM fd_area WHERE code = 'INT'), 'HONESTY', 'Sober Honesty', 1.0, 'Radical self-honesty practice');

-- FOR — Forgiveness & Reconciliation
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'FOR'), 'REFLECTION', 'Reflection Frequency', 1.0, 'Regular forgiveness reflection'),
((SELECT id FROM fd_area WHERE code = 'FOR'), 'AMENDS', 'Letters/Acts of Amends', 1.0, 'Concrete reconciliation actions'),
((SELECT id FROM fd_area WHERE code = 'FOR'), 'RELIEF', 'Emotional Relief Trend', 1.0, 'Lessening of emotional burden');

-- AUT — Autobiography
INSERT INTO fd_dimension (area_id, code, name, weight_default, description) VALUES
((SELECT id FROM fd_area WHERE code = 'AUT'), 'CHAPTERS', 'Chapters Progressed', 1.0, 'Narrative structure development'),
((SELECT id FROM fd_area WHERE code = 'AUT'), 'SOURCES', 'Sources Linked', 1.0, 'Journal entries integrated'),
((SELECT id FROM fd_area WHERE code = 'AUT'), 'COHERENCE', 'Coherence Score', 1.0, 'Story clarity and flow');

-- =====================================================
-- SEED COMPLETE
-- =====================================================

-- Verify seed data
SELECT
  'Areas seeded: ' || COUNT(*) as status
FROM fd_area;

SELECT
  'Dimensions seeded: ' || COUNT(*) as status
FROM fd_dimension;
