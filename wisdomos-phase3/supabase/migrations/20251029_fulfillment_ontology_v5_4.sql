-- Fulfillment Display v5.4 - Complete Ontology Migration
-- 30 life areas, 12 universal dimensions, 6 clusters

-- ==================== DIMENSION TEMPLATES ====================
-- Update existing dimension templates with icons
UPDATE dimension_templates SET
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{icon}',
    '"🎭"'::jsonb
  )
WHERE key = 'expression';

UPDATE dimension_templates SET
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{icon}',
    '"💬"'::jsonb
  )
WHERE key = 'relationship';

UPDATE dimension_templates SET
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{icon}',
    '"🪨"'::jsonb
  )
WHERE key = 'stability';

UPDATE dimension_templates SET
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{icon}',
    '"⚖️"'::jsonb
  )
WHERE key = 'alignment';

UPDATE dimension_templates SET
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{icon}',
    '"💰"'::jsonb
  )
WHERE key = 'profitability';

UPDATE dimension_templates SET
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{icon}',
    '"🕊️"'::jsonb
  )
WHERE key = 'freedom';

-- Insert new universal dimensions
INSERT INTO dimension_templates (key, name_en, name_fr, description_en, description_fr, metadata)
VALUES
  ('growth', 'Growth', 'Croissance', 'Learning, expansion, increasing capacity.', 'Apprentissage, expansion, augmentation de la capacité.', '{"icon": "🌿"}'::jsonb),
  ('service', 'Service', 'Service', 'Generosity in action; benefit to others.', 'Générosité en action; bénéfice pour les autres.', '{"icon": "🤝"}'::jsonb),
  ('integration', 'Integration', 'Intégration', 'Coherence across domains; system harmony.', 'Cohérence entre les domaines; harmonie du système.', '{"icon": "🔗"}'::jsonb),
  ('legacy', 'Legacy', 'Héritage', 'Continuity, preservation, long-term impact.', 'Continuité, préservation, impact à long terme.', '{"icon": "📜"}'::jsonb),
  ('vitality', 'Vitality', 'Vitalité', 'Energy, embodiment, somatic aliveness.', 'Énergie, incarnation, vivacité somatique.', '{"icon": "⚡"}'::jsonb),
  ('presence', 'Presence', 'Présence', 'Awareness, attention, here-and-now being.', 'Conscience, attention, être ici et maintenant.', '{"icon": "👁️"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_fr = EXCLUDED.name_fr,
  description_en = EXCLUDED.description_en,
  description_fr = EXCLUDED.description_fr,
  metadata = EXCLUDED.metadata;

-- ==================== AREA CLUSTERS ====================
-- Create clusters table if not exists
CREATE TABLE IF NOT EXISTS area_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(50) NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert clusters
INSERT INTO area_clusters (name, color, sort_order)
VALUES
  ('Systemic / Structural', 'steel-blue', 1),
  ('Relational / Human', 'rose-quartz', 2),
  ('Inner / Personal', 'emerald', 3),
  ('Creative / Expressive', 'amethyst', 4),
  ('Exploratory / Expansive', 'cobalt', 5),
  ('Integrative / Legacy', 'earth-gold', 6)
ON CONFLICT (name) DO UPDATE SET
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order;

-- ==================== AREA TEMPLATES ====================
-- Add cluster_id to area_templates if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'area_templates' AND column_name = 'cluster_id'
  ) THEN
    ALTER TABLE area_templates ADD COLUMN cluster_id UUID REFERENCES area_clusters(id);
  END IF;
END $$;

-- Add subdimensions to area_templates if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'area_templates' AND column_name = 'subdimensions'
  ) THEN
    ALTER TABLE area_templates ADD COLUMN subdimensions JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ==================== AREA-DIMENSION MAPPING ====================
-- Create junction table for area-dimension relationships
CREATE TABLE IF NOT EXISTS area_dimension_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_template_key VARCHAR(100) NOT NULL,
  dimension_template_key VARCHAR(100) NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('primary', 'secondary')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(area_template_key, dimension_template_key)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_area_dimension_mappings_area ON area_dimension_mappings(area_template_key);
CREATE INDEX IF NOT EXISTS idx_area_dimension_mappings_dimension ON area_dimension_mappings(dimension_template_key);

-- ==================== HELPER FUNCTION ====================
-- Function to insert area with dimensions
CREATE OR REPLACE FUNCTION insert_area_with_dimensions(
  p_key VARCHAR,
  p_name_en VARCHAR,
  p_name_fr VARCHAR,
  p_cluster_name VARCHAR,
  p_subdimensions JSONB,
  p_primary_dimensions VARCHAR[],
  p_secondary_dimensions VARCHAR[]
) RETURNS VOID AS $$
DECLARE
  v_cluster_id UUID;
  v_dimension_key VARCHAR;
BEGIN
  -- Get cluster ID
  SELECT id INTO v_cluster_id FROM area_clusters WHERE name = p_cluster_name;

  -- Insert or update area template
  INSERT INTO area_templates (key, name_en, name_fr, cluster_id, subdimensions)
  VALUES (p_key, p_name_en, p_name_fr, v_cluster_id, p_subdimensions)
  ON CONFLICT (key) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_fr = EXCLUDED.name_fr,
    cluster_id = EXCLUDED.cluster_id,
    subdimensions = EXCLUDED.subdimensions;

  -- Insert primary dimension mappings
  FOREACH v_dimension_key IN ARRAY p_primary_dimensions
  LOOP
    INSERT INTO area_dimension_mappings (area_template_key, dimension_template_key, priority)
    VALUES (p_key, v_dimension_key, 'primary')
    ON CONFLICT (area_template_key, dimension_template_key) DO UPDATE SET
      priority = EXCLUDED.priority;
  END LOOP;

  -- Insert secondary dimension mappings
  FOREACH v_dimension_key IN ARRAY p_secondary_dimensions
  LOOP
    INSERT INTO area_dimension_mappings (area_template_key, dimension_template_key, priority)
    VALUES (p_key, v_dimension_key, 'secondary')
    ON CONFLICT (area_template_key, dimension_template_key) DO UPDATE SET
      priority = EXCLUDED.priority;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ==================== SEED DATA: 30 AREAS ====================

-- Cluster 1: Systemic / Structural
SELECT insert_area_with_dimensions(
  'work',
  'Work',
  'Travail',
  'Systemic / Structural',
  '[
    {"name": "Performance", "description": "Throughput, focus, consistency of output."},
    {"name": "Creativity-at-Work", "description": "Innovating solutions within constraints."},
    {"name": "Integrity-at-Work", "description": "Promises kept, ethical conduct."},
    {"name": "Leadership-in-Role", "description": "Initiative, mentoring, upward influence."},
    {"name": "Sustainability", "description": "Work rhythms that conserve energy and prevent burnout."}
  ]'::jsonb,
  ARRAY['profitability', 'alignment', 'growth'],
  ARRAY['stability', 'service']
);

SELECT insert_area_with_dimensions(
  'purpose',
  'Purpose',
  'Objectif',
  'Systemic / Structural',
  '[
    {"name": "Vision", "description": "Clear, compelling direction."},
    {"name": "Meaning", "description": "Felt significance and inspiration."},
    {"name": "Congruence", "description": "Actions match stated values."},
    {"name": "Contribution-Through-Purpose", "description": "Impact generated by living the purpose."},
    {"name": "Spiritual-Integration", "description": "Inner guidance applied to life design."}
  ]'::jsonb,
  ARRAY['alignment', 'presence', 'growth'],
  ARRAY['freedom', 'legacy']
);

SELECT insert_area_with_dimensions(
  'finance',
  'Finance',
  'Finance',
  'Systemic / Structural',
  '[
    {"name": "Income", "description": "Cashflow and revenue streams."},
    {"name": "Stewardship", "description": "Budgeting, discipline, and order."},
    {"name": "Expansion", "description": "Investments, diversification, growth of assets."},
    {"name": "Transparency", "description": "Integrity and clarity in financial dealings."},
    {"name": "Optionality", "description": "Freedom to choose based on healthy resources."}
  ]'::jsonb,
  ARRAY['profitability', 'stability', 'alignment'],
  ARRAY['freedom', 'integration']
);

SELECT insert_area_with_dimensions(
  'law',
  'Law',
  'Droit',
  'Systemic / Structural',
  '[
    {"name": "Order & Compliance", "description": "Operating within legal frameworks."},
    {"name": "Evidence & Documentation", "description": "Verifiable records and narratives."},
    {"name": "Advocacy", "description": "Defending rights and fair treatment."},
    {"name": "Transparency", "description": "Clarity and honesty in process."},
    {"name": "Procedural Integrity", "description": "Due process and correct handling."}
  ]'::jsonb,
  ARRAY['alignment'],
  ARRAY['stability', 'legacy']
);

SELECT insert_area_with_dimensions(
  'governance',
  'Governance',
  'Gouvernance',
  'Systemic / Structural',
  '[
    {"name": "Policy Design", "description": "Designing rules and frameworks that work."},
    {"name": "Accountability", "description": "Feedback loops and responsibility."},
    {"name": "Fairness", "description": "Impartial decision-making."},
    {"name": "Structure Optimization", "description": "Efficient and humane systems."},
    {"name": "Collective Balance", "description": "Harmony of stakeholder needs."}
  ]'::jsonb,
  ARRAY['alignment', 'stability'],
  ARRAY['integration', 'legacy']
);

SELECT insert_area_with_dimensions(
  'leadership',
  'Leadership',
  'Leadership',
  'Systemic / Structural',
  '[
    {"name": "Visioning", "description": "Articulating a future people want to join."},
    {"name": "Communication", "description": "Clear, inspiring, and courageous speech."},
    {"name": "Empowerment", "description": "Creating leaders around you."},
    {"name": "Resilience", "description": "Grace under pressure; antifragility."},
    {"name": "Authenticity", "description": "Leading as yourself, not a role."}
  ]'::jsonb,
  ARRAY['expression', 'service', 'relationship'],
  ARRAY['growth', 'presence']
);

SELECT insert_area_with_dimensions(
  'justice',
  'Justice',
  'Justice',
  'Systemic / Structural',
  '[
    {"name": "Human Rights", "description": "Safeguarding basic dignity and freedom."},
    {"name": "Equity & Inclusion", "description": "Removing bias and barriers."},
    {"name": "Restorative Practice", "description": "Healing and reconciliation."},
    {"name": "Ethical Courage", "description": "Standing for truth under pressure."},
    {"name": "Systemic Change", "description": "Transforming unjust structures."}
  ]'::jsonb,
  ARRAY['service', 'alignment', 'legacy'],
  ARRAY['relationship', 'integration']
);

SELECT insert_area_with_dimensions(
  'digital_architecture',
  'Digital Architecture',
  'Architecture Numérique',
  'Systemic / Structural',
  '[
    {"name": "Infrastructure Design", "description": "DBs, APIs, services, data schemas."},
    {"name": "Security & Privacy", "description": "Protection by design."},
    {"name": "Automation & Agents", "description": "AI and workflow orchestration."},
    {"name": "Scalability", "description": "Performance and reliability at scale."},
    {"name": "Interoperability", "description": "Clean integrations across platforms."}
  ]'::jsonb,
  ARRAY['integration', 'profitability', 'growth'],
  ARRAY['alignment', 'freedom']
);

-- Cluster 2: Relational / Human
SELECT insert_area_with_dimensions(
  'intimacy',
  'Intimacy',
  'Intimité',
  'Relational / Human',
  '[
    {"name": "Vulnerability", "description": "Willingness to be seen fully."},
    {"name": "Safety", "description": "Emotional and physical security."},
    {"name": "Emotional Honesty", "description": "Real feelings expressed cleanly."},
    {"name": "Physical Connection", "description": "Touch, closeness, consent."},
    {"name": "Mutual Presence", "description": "Co-regulation and shared attention."}
  ]'::jsonb,
  ARRAY['relationship', 'presence', 'expression'],
  ARRAY['stability', 'freedom']
);

SELECT insert_area_with_dimensions(
  'love',
  'Love',
  'Amour',
  'Relational / Human',
  '[
    {"name": "Compassion", "description": "Caring without conditions."},
    {"name": "Acceptance", "description": "Receiving people as they are."},
    {"name": "Forgiveness", "description": "Releasing resentment with integrity."},
    {"name": "Generosity of Spirit", "description": "Acts that expand the space of love."},
    {"name": "Nurture", "description": "Sustaining kindness over time."}
  ]'::jsonb,
  ARRAY['presence', 'relationship', 'service'],
  ARRAY['freedom', 'growth']
);

SELECT insert_area_with_dimensions(
  'friendship',
  'Friendship',
  'Amitié',
  'Relational / Human',
  '[
    {"name": "Play & Joy", "description": "Shared fun and lightness."},
    {"name": "Trust", "description": "Reliability and care."},
    {"name": "Reciprocity", "description": "Balanced giving and receiving."},
    {"name": "Support", "description": "Showing up during challenges."},
    {"name": "Authenticity", "description": "Relaxed, true self-expression."}
  ]'::jsonb,
  ARRAY['relationship', 'expression', 'growth'],
  ARRAY['stability', 'service']
);

SELECT insert_area_with_dimensions(
  'family',
  'Family',
  'Famille',
  'Relational / Human',
  '[
    {"name": "Ancestry & Roots", "description": "Honoring lineage and story."},
    {"name": "Belonging", "description": "Felt membership and safety."},
    {"name": "Healing the Past", "description": "Completion and forgiveness."},
    {"name": "Contribution to Family Line", "description": "Being a source of uplift."},
    {"name": "Shared Rituals", "description": "Traditions that bond the family."}
  ]'::jsonb,
  ARRAY['stability', 'relationship', 'legacy'],
  ARRAY['service', 'integration']
);

SELECT insert_area_with_dimensions(
  'community',
  'Community',
  'Communauté',
  'Relational / Human',
  '[
    {"name": "Participation", "description": "Active involvement and presence."},
    {"name": "Shared Purpose", "description": "Collective intention and aims."},
    {"name": "Mutual Aid", "description": "Practical help and support."},
    {"name": "Inclusivity", "description": "Welcoming diversity."},
    {"name": "Community Leadership", "description": "Stewardship for the whole."}
  ]'::jsonb,
  ARRAY['service', 'relationship', 'integration'],
  ARRAY['growth', 'legacy']
);

SELECT insert_area_with_dimensions(
  'service',
  'Service',
  'Service',
  'Relational / Human',
  '[
    {"name": "Generosity in Action", "description": "Practical giving that matters."},
    {"name": "Empathy", "description": "Feeling with others."},
    {"name": "Presence-in-Need", "description": "Steady in crisis; reliable support."},
    {"name": "Humility", "description": "Serving without self-importance."},
    {"name": "Impact Measurement", "description": "Noticing what truly helps."}
  ]'::jsonb,
  ARRAY['service', 'freedom', 'relationship'],
  ARRAY['presence', 'stability']
);

SELECT insert_area_with_dimensions(
  'contribution',
  'Contribution',
  'Contribution',
  'Relational / Human',
  '[
    {"name": "Identity-as-Gift", "description": "Who you are being uplifts."},
    {"name": "Teaching & Mentorship", "description": "Passing on what you know."},
    {"name": "Innovation-for-Others", "description": "Creating tools and pathways."},
    {"name": "Recognition", "description": "Owning and offering your value."},
    {"name": "Signature Impact", "description": "Distinct mark you leave."}
  ]'::jsonb,
  ARRAY['expression', 'service', 'legacy'],
  ARRAY['alignment', 'growth']
);

-- Cluster 3: Inner / Personal
SELECT insert_area_with_dimensions(
  'health',
  'Health',
  'Santé',
  'Inner / Personal',
  '[
    {"name": "Physical Health", "description": "Body integrity, mobility, absence of illness."},
    {"name": "Mental Health", "description": "Cognitive clarity, focus, resilience."},
    {"name": "Emotional Health", "description": "Healthy regulation and expression."},
    {"name": "Strength", "description": "Muscle, power, durability."},
    {"name": "Rest & Recovery", "description": "Sleep quality and nervous system reset."},
    {"name": "Nutrition", "description": "Nourishment and hydration for performance."},
    {"name": "Energy & Vitality", "description": "Life force and daily energy cycles."},
    {"name": "Sexual Health", "description": "Libido, hormones, healthy expression."},
    {"name": "Environmental Health", "description": "Air, light, noise, toxins, cleanliness."},
    {"name": "Spiritual Health", "description": "Peace, meaning, connection to source."},
    {"name": "Preventive Health", "description": "Check-ups, screenings, hygiene."},
    {"name": "Social Health", "description": "Supportive connections and belonging."}
  ]'::jsonb,
  ARRAY['vitality', 'stability', 'alignment'],
  ARRAY['presence', 'freedom']
);

SELECT insert_area_with_dimensions(
  'emotional_wellbeing',
  'Emotional Well-Being',
  'Bien-être Émotionnel',
  'Inner / Personal',
  '[
    {"name": "Awareness", "description": "Sensing emotion as sensation."},
    {"name": "Regulation", "description": "Capacity to self-soothe and balance."},
    {"name": "Expression", "description": "Clean, responsible articulation."},
    {"name": "Resilience", "description": "Return to baseline after stress."},
    {"name": "Compassion-for-Self", "description": "Kindness toward ones inner world."}
  ]'::jsonb,
  ARRAY['presence', 'stability', 'growth'],
  ARRAY['relationship', 'integration']
);

SELECT insert_area_with_dimensions(
  'spiritual_development',
  'Spiritual Development',
  'Développement Spirituel',
  'Inner / Personal',
  '[
    {"name": "Meditation & Silence", "description": "Resting in awareness."},
    {"name": "Faith/Belief Systems", "description": "Meaning frameworks and practice."},
    {"name": "Surrender & Trust", "description": "Letting life unfold, not forcing."},
    {"name": "Connection to Source", "description": "Lived sense of the sacred."},
    {"name": "Transcendence", "description": "Beyond personal identity."}
  ]'::jsonb,
  ARRAY['presence', 'alignment', 'freedom'],
  ARRAY['legacy', 'service']
);

SELECT insert_area_with_dimensions(
  'growth',
  'Growth',
  'Croissance',
  'Inner / Personal',
  '[
    {"name": "Self-Reflection", "description": "Inquiry into being and patterns."},
    {"name": "Adaptability", "description": "Flexibility in changing contexts."},
    {"name": "Shadow Integration", "description": "Owning disowned parts."},
    {"name": "Experimentation", "description": "Trying new ways of being."},
    {"name": "Transformation", "description": "Discontinuous shifts in identity."}
  ]'::jsonb,
  ARRAY['growth', 'presence', 'freedom'],
  ARRAY['stability', 'integration']
);

SELECT insert_area_with_dimensions(
  'learning',
  'Learning',
  'Apprentissage',
  'Inner / Personal',
  '[
    {"name": "Curiosity", "description": "Open, active interest."},
    {"name": "Study & Research", "description": "Deep dives and analysis."},
    {"name": "Skill Acquisition", "description": "Practice and mastery."},
    {"name": "Application", "description": "Using knowledge in action."},
    {"name": "Teaching", "description": "Solidifying learning by sharing."}
  ]'::jsonb,
  ARRAY['growth', 'integration', 'presence'],
  ARRAY['expression', 'profitability']
);

SELECT insert_area_with_dimensions(
  'holistic_stability',
  'Holistic Stability',
  'Stabilité Holistique',
  'Inner / Personal',
  '[
    {"name": "Emotional Balance", "description": "Centered baseline across moods."},
    {"name": "Physical Routine", "description": "Rhythms that sustain energy."},
    {"name": "Spiritual Grounding", "description": "Resting in deeper trust."},
    {"name": "Financial Order", "description": "Predictable resource management."},
    {"name": "Environmental Harmony", "description": "Spaces that support clarity."}
  ]'::jsonb,
  ARRAY['stability', 'integration', 'presence'],
  ARRAY['alignment', 'vitality']
);

-- Cluster 4: Creative / Expressive
SELECT insert_area_with_dimensions(
  'music',
  'Music',
  'Musique',
  'Creative / Expressive',
  '[
    {"name": "Composition", "description": "Songwriting, melodic craft."},
    {"name": "Performance", "description": "Embodied delivery; audience connection."},
    {"name": "Production", "description": "Arranging, sound design, mastering."},
    {"name": "Collaboration", "description": "Co-creation with musicians and teams."},
    {"name": "Release & Distribution", "description": "Publishing, marketing, reach."}
  ]'::jsonb,
  ARRAY['expression', 'presence', 'freedom'],
  ARRAY['profitability', 'relationship']
);

SELECT insert_area_with_dimensions(
  'writing',
  'Writing',
  'Écriture',
  'Creative / Expressive',
  '[
    {"name": "Idea Generation", "description": "Concepts, themes, insights."},
    {"name": "Narrative Structure", "description": "Coherence and pacing."},
    {"name": "Voice & Style", "description": "Distinct tone and rhythm."},
    {"name": "Publication & Outreach", "description": "Editing, release, readers."},
    {"name": "Reflection & Truth", "description": "Courageous honesty on the page."}
  ]'::jsonb,
  ARRAY['expression', 'growth', 'legacy'],
  ARRAY['alignment', 'integration']
);

SELECT insert_area_with_dimensions(
  'public_speaking',
  'Public Speaking',
  'Prise de Parole en Public',
  'Creative / Expressive',
  '[
    {"name": "Confidence", "description": "Presence on stage or camera."},
    {"name": "Clarity of Message", "description": "Clean through-line and call-to-action."},
    {"name": "Audience Connection", "description": "Reading the room; rapport."},
    {"name": "Storytelling", "description": "Emotional arc and resonance."},
    {"name": "Leadership Through Voice", "description": "Mobilizing people ethically."}
  ]'::jsonb,
  ARRAY['expression', 'relationship', 'service'],
  ARRAY['freedom', 'growth']
);

SELECT insert_area_with_dimensions(
  'creativity',
  'Creativity (Visual / Conceptual)',
  'Créativité (Visuelle / Conceptuelle)',
  'Creative / Expressive',
  '[
    {"name": "Imagination", "description": "Seeing what isnt yet visible."},
    {"name": "Design & Aesthetics", "description": "Balance, form, and beauty."},
    {"name": "Innovation", "description": "Novel combinations and patterns."},
    {"name": "Emotional Expression", "description": "Translating feeling into form."},
    {"name": "Cross-Media Integration", "description": "Coherent multi-channel expression."}
  ]'::jsonb,
  ARRAY['expression', 'freedom', 'growth'],
  ARRAY['presence', 'profitability']
);

-- Cluster 5: Exploratory / Expansive
SELECT insert_area_with_dimensions(
  'travel',
  'Travel',
  'Voyage',
  'Exploratory / Expansive',
  '[
    {"name": "Adventure & Exploration", "description": "New places, new edges."},
    {"name": "Cultural Connection", "description": "People, languages, customs."},
    {"name": "Rest & Leisure", "description": "Recovery and play in motion."},
    {"name": "Perspective Shift", "description": "Seeing life differently."},
    {"name": "Resilience-in-Movement", "description": "Grace with uncertainty."}
  ]'::jsonb,
  ARRAY['freedom', 'growth', 'presence'],
  ARRAY['vitality', 'relationship']
);

SELECT insert_area_with_dimensions(
  'discovery',
  'Discovery',
  'Découverte',
  'Exploratory / Expansive',
  '[
    {"name": "Curiosity & Inquiry", "description": "Asking better questions."},
    {"name": "Research & Investigation", "description": "Finding whats true and useful."},
    {"name": "Innovation", "description": "Novel insight formation."},
    {"name": "Self-Discovery", "description": "Revealing unknown parts of self."},
    {"name": "Learning from Failure", "description": "Iterating with humility."}
  ]'::jsonb,
  ARRAY['growth', 'presence', 'integration'],
  ARRAY['freedom', 'expression']
);

-- Cluster 6: Integrative / Legacy
SELECT insert_area_with_dimensions(
  'home',
  'Home',
  'Maison',
  'Integrative / Legacy',
  '[
    {"name": "Safety & Comfort", "description": "Felt sanctuary; nervous system ease."},
    {"name": "Aesthetic Harmony", "description": "Beauty that supports clarity."},
    {"name": "Organization & Order", "description": "Everything has a place."},
    {"name": "Energy Flow", "description": "Feng shui; subtle feel of space."},
    {"name": "Personal Sanctuary", "description": "Spaces for restoration."}
  ]'::jsonb,
  ARRAY['stability', 'presence', 'relationship'],
  ARRAY['vitality', 'integration']
);

SELECT insert_area_with_dimensions(
  'environment',
  'Environment',
  'Environnement',
  'Integrative / Legacy',
  '[
    {"name": "Sustainability", "description": "Living within ecological limits."},
    {"name": "Ecological Responsibility", "description": "Choices that repair, not harm."},
    {"name": "Connection to Nature", "description": "Regular contact and reverence."},
    {"name": "Climate Awareness", "description": "Informed, compassionate action."},
    {"name": "Conservation", "description": "Protecting habitats and species."}
  ]'::jsonb,
  ARRAY['stability', 'service', 'legacy'],
  ARRAY['integration', 'alignment']
);

SELECT insert_area_with_dimensions(
  'legacy_archives',
  'Legacy & Archives',
  'Héritage et Archives',
  'Integrative / Legacy',
  '[
    {"name": "Preservation of Knowledge", "description": "Curating artifacts and teachings."},
    {"name": "Succession Planning", "description": "Continuity of projects and institutions."},
    {"name": "Teaching Transmission", "description": "Codifying wisdom for others."},
    {"name": "Documentation & Curation", "description": "Reliable systems for recall."},
    {"name": "Historical Integrity", "description": "Truthful, contextual recordkeeping."}
  ]'::jsonb,
  ARRAY['legacy', 'integration', 'service'],
  ARRAY['alignment', 'growth']
);

-- ==================== CLEANUP ====================
-- Drop helper function
DROP FUNCTION IF EXISTS insert_area_with_dimensions;

-- Create view for easy querying
CREATE OR REPLACE VIEW v_areas_with_dimensions AS
SELECT
  at.key AS area_key,
  at.name_en AS area_name,
  ac.name AS cluster_name,
  ac.color AS cluster_color,
  at.subdimensions,
  jsonb_agg(
    jsonb_build_object(
      'key', dt.key,
      'name', dt.name_en,
      'icon', dt.metadata->'icon',
      'priority', adm.priority
    ) ORDER BY adm.priority, dt.name_en
  ) AS dimensions
FROM area_templates at
LEFT JOIN area_clusters ac ON at.cluster_id = ac.id
LEFT JOIN area_dimension_mappings adm ON at.key = adm.area_template_key
LEFT JOIN dimension_templates dt ON adm.dimension_template_key = dt.key
GROUP BY at.key, at.name_en, ac.name, ac.color, at.subdimensions, ac.sort_order
ORDER BY ac.sort_order, at.name_en;

COMMENT ON VIEW v_areas_with_dimensions IS 'Complete fulfillment ontology with areas, clusters, dimensions, and subdimensions';
