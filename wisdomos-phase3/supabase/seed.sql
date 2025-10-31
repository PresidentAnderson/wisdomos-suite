-- =====================================================
-- SEED DATA FOR WISDOMOS DEMO
-- =====================================================

-- Create demo user (this would normally be handled by Supabase Auth)
-- For development/demo purposes, we'll create a demo user profile

-- Demo Life Areas with sample data
DO $$
DECLARE
    demo_user_id UUID := 'demo-user-id'::UUID;
    life_area_id UUID;
BEGIN
    -- Create or update demo user profile
    INSERT INTO user_profiles (user_id, display_name, bio, onboarding_completed)
    VALUES (
        demo_user_id,
        'Demo User',
        'Welcome to WisdomOS! This is your demo account to explore all features.',
        TRUE
    )
    ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        onboarding_completed = EXCLUDED.onboarding_completed;

    -- Sample Journal Entries
    INSERT INTO journals (user_id, content, tags, upset_detected, ai_reframe) VALUES
    (demo_user_id, 'Started my morning meditation today. Feeling more centered and focused.', ARRAY['meditation', 'morning'], FALSE, NULL),
    (demo_user_id, 'Had a difficult conversation with my partner about our future plans. Feeling uncertain.', ARRAY['relationship', 'communication'], TRUE, 'This uncertainty might be an opportunity to deepen our connection by exploring our shared values and dreams together.'),
    (demo_user_id, 'Completed my first week of the new exercise routine. Feeling stronger already!', ARRAY['fitness', 'achievement'], FALSE, NULL),
    (demo_user_id, 'Struggling with work-life balance lately. Feeling overwhelmed with all the projects.', ARRAY['work', 'stress'], TRUE, 'This feeling of overwhelm is a signal that I need to prioritize and set better boundaries. Each project is a chance to practice focused attention.'),
    (demo_user_id, 'Had an amazing creative breakthrough on my art project today. The vision is becoming clear.', ARRAY['creativity', 'art', 'breakthrough'], FALSE, NULL);

    -- Sample Assessments
    INSERT INTO assessments (user_id, type, questions, responses, score, insights) VALUES
    (demo_user_id, 'life_satisfaction', 
     '[{"question": "How satisfied are you with your relationships?", "type": "scale", "min": 1, "max": 10}]',
     '{"relationships": 8, "health": 7, "career": 6, "creativity": 9}',
     75,
     'Your creativity score is particularly high, suggesting this is a key strength area. Consider how you can integrate more creative expression into other life areas.'
    );

    -- Sample Contacts
    INSERT INTO contacts (user_id, name, relationship, email, notes, tags) VALUES
    (demo_user_id, 'Alex Johnson', 'Close Friend', 'alex@example.com', 'Met in college, shares interest in meditation and personal growth', ARRAY['friend', 'meditation']),
    (demo_user_id, 'Dr. Sarah Chen', 'Therapist', 'sarah.chen@therapy.com', 'Specializes in mindfulness-based therapy', ARRAY['professional', 'therapy']),
    (demo_user_id, 'Maria Rodriguez', 'Mentor', 'maria@mentorship.org', 'Business mentor, helped with career transitions', ARRAY['mentor', 'business']);

    -- Sample Priority Items
    INSERT INTO priority_items (user_id, title, description, priority, status, due_date) VALUES
    (demo_user_id, 'Complete Meditation Course', 'Finish the 8-week mindfulness course I started', 'HIGH', 'IN_PROGRESS', NOW() + INTERVAL '2 weeks'),
    (demo_user_id, 'Plan Weekend Retreat', 'Organize a personal retreat for reflection and planning', 'MEDIUM', 'PENDING', NOW() + INTERVAL '1 month'),
    (demo_user_id, 'Update Resume', 'Refresh resume with recent accomplishments', 'MEDIUM', 'PENDING', NOW() + INTERVAL '3 weeks');

    -- Sample Upset Inquiry
    INSERT INTO upset_inquiries (user_id, title, situation, feelings, thoughts, reframes, actions, status) VALUES
    (demo_user_id, 
     'Conflict with Coworker',
     'Had a disagreement with a colleague during the team meeting about project priorities',
     '["frustrated", "misunderstood", "defensive"]',
     '["They don''t value my input", "I should have spoken up sooner", "Maybe I came across too aggressive"]',
     '["This conflict might reveal different perspectives that could strengthen our approach", "My colleague might be under pressure I''m not aware of"]',
     '["Schedule a one-on-one conversation", "Ask about their concerns and constraints", "Find common ground on project goals"]',
     'IN_PROGRESS'
    );

END $$;

-- Sample Contribution Display
INSERT INTO contribution_displays (user_id, title, description, entries, feedback, visibility) VALUES
('demo-user-id'::UUID,
 'My Growth Journey',
 'Documenting my personal development over the past year',
 '[
   {
     "id": "1",
     "date": "2024-01-15",
     "title": "Started Daily Meditation",
     "description": "Committed to 20 minutes of meditation each morning",
     "category": "Spiritual Growth",
     "impact": "Increased focus and emotional regulation"
   },
   {
     "id": "2", 
     "date": "2024-03-10",
     "title": "Completed Communication Workshop",
     "description": "Learned nonviolent communication techniques",
     "category": "Relationship Skills",
     "impact": "Better conflict resolution with family and friends"
   },
   {
     "id": "3",
     "date": "2024-06-05", 
     "title": "Launched Creative Project",
     "description": "Started a community art initiative",
     "category": "Creative Expression",
     "impact": "Brought together 20+ local artists"
   }
 ]'::jsonb,
 '[
   {
     "author": "Alex Johnson",
     "date": "2024-07-01",
     "feedback": "Incredible to see your growth! Your meditation practice really shows in how centered you''ve become."
   }
 ]'::jsonb,
 'circles'
);

-- Sample Autobiography
INSERT INTO autobiographies (user_id, events, future_visions, cultural_context) VALUES
('demo-user-id'::UUID,
 '[
   {
     "id": "1",
     "year": "1995",
     "age": 5,
     "title": "First Art Class",
     "description": "Discovered my love for drawing in kindergarten art class",
     "category": "Creative Awakening",
     "significance": "This was when I first realized I could create something beautiful"
   },
   {
     "id": "2",
     "year": "2010", 
     "age": 20,
     "title": "College Meditation Group",
     "description": "Joined a weekly meditation group that changed my perspective on life",
     "category": "Spiritual Growth",
     "significance": "Learned that peace comes from within"
   },
   {
     "id": "3",
     "year": "2020",
     "age": 30,
     "title": "Career Transition",
     "description": "Left corporate job to pursue meaningful work in community development",
     "category": "Professional Growth",
     "significance": "Aligned my work with my values for the first time"
   }
 ]'::jsonb,
 '[
   {
     "decade": "2030s",
     "age_range": "40-50",
     "vision": "Leading a creative community center that combines art, wellness, and personal growth",
     "themes": ["creative leadership", "community building", "holistic wellness"]
   },
   {
     "decade": "2040s", 
     "age_range": "50-60",
     "vision": "Writing and teaching about the integration of creativity and spirituality",
     "themes": ["wisdom sharing", "mentoring", "creative expression"]
   }
 ]'::jsonb,
 '{
   "cultural_background": "Mixed heritage with strong emphasis on community and creativity",
   "family_values": ["compassion", "creativity", "service to others"],
   "influences": ["Eastern philosophy", "Indigenous wisdom", "Modern psychology"]
 }'::jsonb
);

-- Create demo badges if badges table exists
INSERT INTO badges (name, description, category, criteria, points) VALUES
('First Journal Entry', 'Created your first journal entry', 'journaling', '{"type": "journal_created", "count": 1}', 10),
('Meditation Streak', 'Meditated for 7 consecutive days', 'wellness', '{"type": "meditation_streak", "days": 7}', 25),
('Upset Inquiry Master', 'Completed 5 upset inquiries', 'growth', '{"type": "upset_inquiry_completed", "count": 5}', 50),
('Life Area Champion', 'Improved all life area scores by 10 points', 'overall', '{"type": "life_area_improvement", "improvement": 10}', 100),
('Community Contributor', 'Shared contribution display publicly', 'community', '{"type": "contribution_shared", "visibility": "public"}', 30)
ON CONFLICT (name) DO NOTHING;

-- Award some demo badges to demo user
INSERT INTO user_badges (user_id, badge_id, progress) 
SELECT 'demo-user-id'::UUID, id, '{"completed": true}'::jsonb
FROM badges 
WHERE name IN ('First Journal Entry', 'Meditation Streak')
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Sample Analytics Events
INSERT INTO analytics_events (user_id, event_type, properties) VALUES
('demo-user-id'::UUID, 'journal_entry_created', '{"word_count": 120, "tags": ["meditation", "morning"]}'::jsonb),
('demo-user-id'::UUID, 'assessment_completed', '{"type": "life_satisfaction", "score": 75}'::jsonb),
('demo-user-id'::UUID, 'life_area_updated', '{"area": "Spiritual Path", "new_score": 85}'::jsonb),
('demo-user-id'::UUID, 'contribution_shared', '{"visibility": "circles", "entry_count": 3}'::jsonb);

-- Sample Notifications
INSERT INTO notifications (user_id, type, title, message, metadata) VALUES
('demo-user-id'::UUID, 'welcome', 'Welcome to WisdomOS!', 'Start your journey by exploring your life areas and creating your first journal entry.', '{"action": "explore", "target": "dashboard"}'::jsonb),
('demo-user-id'::UUID, 'achievement', 'Badge Earned!', 'Congratulations! You earned the "First Journal Entry" badge.', '{"badge": "First Journal Entry", "points": 10}'::jsonb),
('demo-user-id'::UUID, 'reminder', 'Daily Reflection', 'Take a moment to reflect on your day and update your journal.', '{"reminder_type": "daily_journal"}'::jsonb);