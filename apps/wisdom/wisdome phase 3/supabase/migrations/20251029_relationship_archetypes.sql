-- =====================================================
-- WisdomOS Relationship Archetypes Extension
-- =====================================================
-- Purpose: Partnership Program integration for journal entries
-- Version: 1.0
-- Date: 2025-10-29
-- =====================================================

-- =====================================================
-- 1. RELATIONSHIP ARCHETYPES ENUM
-- =====================================================

CREATE TYPE relationship_archetype AS ENUM (
  'mother_child',          -- To nurture and be nurtured
  'father_child',          -- To guide, structure, and be guided
  'sibling_playmate',      -- To explore, experiment, and co-create
  'admired_admiring'       -- To inspire and be inspired
);

CREATE TYPE archetype_expression AS ENUM (
  'shadow',                -- Unhealthy expression
  'transformational',      -- In transition
  'fulfilled'              -- Healthy expression
);

-- =====================================================
-- 2. RELATIONSHIP ARCHETYPE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_relationship_archetype (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core archetype data
  archetype relationship_archetype NOT NULL,

  -- Labels (bilingual)
  name_en VARCHAR(100) NOT NULL,
  name_es VARCHAR(100),

  -- Core need/drive
  core_need_en TEXT NOT NULL,
  core_need_es TEXT,

  -- Shadow expression
  shadow_expression_en TEXT NOT NULL,
  shadow_expression_es TEXT,

  -- Transformational pathway
  transformational_pathway_en TEXT NOT NULL,
  transformational_pathway_es TEXT,

  -- Fulfilled expression
  fulfilled_expression_en TEXT NOT NULL,
  fulfilled_expression_es TEXT,

  -- Integration question
  integration_question_en TEXT NOT NULL,
  integration_question_es TEXT,

  -- Visual metadata
  emoji VARCHAR(10) NOT NULL,
  color VARCHAR(7) NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. EXTEND fd_entry WITH ARCHETYPE
-- =====================================================

-- Add archetype columns to fd_entry
ALTER TABLE fd_entry ADD COLUMN IF NOT EXISTS relationship_archetype relationship_archetype;
ALTER TABLE fd_entry ADD COLUMN IF NOT EXISTS archetype_expression archetype_expression;
ALTER TABLE fd_entry ADD COLUMN IF NOT EXISTS archetype_confidence DECIMAL(3,2) DEFAULT 0.5;

-- Create index for archetype queries
CREATE INDEX IF NOT EXISTS idx_fd_entry_archetype ON fd_entry(relationship_archetype);
CREATE INDEX IF NOT EXISTS idx_fd_entry_expression ON fd_entry(archetype_expression);

-- =====================================================
-- 4. ARCHETYPE ANALYSIS LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_archetype_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to entry
  entry_id UUID NOT NULL REFERENCES fd_entry(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  -- Detected archetype
  archetype relationship_archetype NOT NULL,
  expression archetype_expression NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,

  -- Analysis metadata
  detected_keywords TEXT[],
  sentiment_polarity DECIMAL(3,2),  -- -1 to +1
  analysis_notes TEXT,

  -- Agent provenance
  analyzed_by VARCHAR(50) DEFAULT 'NarrativeAgent',

  -- Timestamps
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fd_archetype_analysis_entry ON fd_archetype_analysis(entry_id);
CREATE INDEX idx_fd_archetype_analysis_user ON fd_archetype_analysis(user_id);
CREATE INDEX idx_fd_archetype_analysis_archetype ON fd_archetype_analysis(archetype);

-- =====================================================
-- 5. SEED CANONICAL ARCHETYPES
-- =====================================================

INSERT INTO fd_relationship_archetype (
  archetype,
  name_en,
  name_es,
  core_need_en,
  core_need_es,
  shadow_expression_en,
  shadow_expression_es,
  transformational_pathway_en,
  transformational_pathway_es,
  fulfilled_expression_en,
  fulfilled_expression_es,
  integration_question_en,
  integration_question_es,
  emoji,
  color
) VALUES
(
  'mother_child',
  'Mother–Child',
  'Madre–Hijo',
  'To nurture and be nurtured. Safety, unconditional love, and care.',
  'Nutrir y ser nutrido. Seguridad, amor incondicional y cuidado.',
  'Over-caretaking, dependence, emotional fusion, rescuing others to feel needed.',
  'Sobreprotección, dependencia, fusión emocional, rescatar a otros para sentirse necesitado.',
  'From protection → empowerment. Learning to love without possession or control.',
  'De la protección → el empoderamiento. Aprender a amar sin posesión ni control.',
  'Co-creative care — mutual support without dependence. Compassion with boundaries.',
  'Cuidado co-creativo — apoyo mutuo sin dependencia. Compasión con límites.',
  'Can I love without rescuing?',
  '¿Puedo amar sin rescatar?',
  '🤱',
  '#F97316'
),
(
  'father_child',
  'Father–Child',
  'Padre–Hijo',
  'To guide, structure, and be guided. Strength, order, and trust.',
  'Guiar, estructurar y ser guiado. Fuerza, orden y confianza.',
  'Control, authoritarianism, rebellion, withdrawal of approval as punishment.',
  'Control, autoritarismo, rebeldía, retiro de aprobación como castigo.',
  'From authority → mentorship. Integrating discipline with empathy.',
  'De la autoridad → la mentoría. Integrar disciplina con empatía.',
  'Empowered leadership — structure that liberates, not limits. Wisdom with authority.',
  'Liderazgo empoderado — estructura que libera, no limita. Sabiduría con autoridad.',
  'Can I guide without controlling?',
  '¿Puedo guiar sin controlar?',
  '👨‍👦',
  '#1F6FEB'
),
(
  'sibling_playmate',
  'Sibling / Playmate',
  'Hermano / Compañero de Juego',
  'To explore, experiment, and co-create. Joy in equality and discovery.',
  'Explorar, experimentar y co-crear. Alegría en la igualdad y el descubrimiento.',
  'Competition, comparison, jealousy, or withdrawal into cynicism.',
  'Competencia, comparación, celos o retiro al cinismo.',
  'From rivalry → collaboration. Restoring the innocence of play as learning.',
  'De la rivalidad → la colaboración. Restaurar la inocencia del juego como aprendizaje.',
  'Authentic camaraderie — curiosity, humor, and shared discovery as a path to growth.',
  'Camaradería auténtica — curiosidad, humor y descubrimiento compartido como camino de crecimiento.',
  'Can I play without competing?',
  '¿Puedo jugar sin competir?',
  '🤝',
  '#10B981'
),
(
  'admired_admiring',
  'Admired / Admiring',
  'Admirado / Admirador',
  'To inspire and be inspired. Recognition of beauty, excellence, or virtue.',
  'Inspirar y ser inspirado. Reconocimiento de belleza, excelencia o virtud.',
  'Projection, idolization, envy, self-doubt, or disconnection from one''s own power.',
  'Proyección, idolatría, envidia, duda de sí mismo o desconexión del propio poder.',
  'From projection → reflection. Seeing the admired qualities as one''s own potential.',
  'De la proyección → la reflexión. Ver las cualidades admiradas como potencial propio.',
  'Mutual inspiration — relationships as mirrors for the highest self. Grace and gratitude.',
  'Inspiración mutua — relaciones como espejos del yo superior. Gracia y gratitud.',
  'Can I admire without losing myself?',
  '¿Puedo admirar sin perderme a mí mismo?',
  '✨',
  '#A855F7'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. FUNCTIONS: Archetype Analysis
-- =====================================================

-- Function: Get archetype distribution for user
CREATE OR REPLACE FUNCTION fn_fd_get_archetype_distribution(p_user_id UUID)
RETURNS TABLE (
  archetype relationship_archetype,
  expression archetype_expression,
  entry_count BIGINT,
  avg_confidence DECIMAL(3,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.relationship_archetype AS archetype,
    e.archetype_expression AS expression,
    COUNT(*) AS entry_count,
    AVG(e.archetype_confidence)::DECIMAL(3,2) AS avg_confidence
  FROM fd_entry e
  WHERE e.user_id = p_user_id
    AND e.relationship_archetype IS NOT NULL
  GROUP BY e.relationship_archetype, e.archetype_expression
  ORDER BY entry_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get archetype insights for period
CREATE OR REPLACE FUNCTION fn_fd_get_archetype_insights(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_dominant_archetype relationship_archetype;
  v_shadow_count INTEGER;
  v_fulfilled_count INTEGER;
BEGIN
  -- Get dominant archetype
  SELECT relationship_archetype
  INTO v_dominant_archetype
  FROM fd_entry
  WHERE user_id = p_user_id
    AND entry_date BETWEEN p_start_date AND p_end_date
    AND relationship_archetype IS NOT NULL
  GROUP BY relationship_archetype
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Count expressions
  SELECT
    COUNT(*) FILTER (WHERE archetype_expression = 'shadow'),
    COUNT(*) FILTER (WHERE archetype_expression = 'fulfilled')
  INTO v_shadow_count, v_fulfilled_count
  FROM fd_entry
  WHERE user_id = p_user_id
    AND entry_date BETWEEN p_start_date AND p_end_date;

  -- Build result
  v_result := jsonb_build_object(
    'dominant_archetype', v_dominant_archetype,
    'shadow_count', v_shadow_count,
    'fulfilled_count', v_fulfilled_count,
    'transformation_ratio',
      CASE
        WHEN (v_shadow_count + v_fulfilled_count) > 0
        THEN ROUND(v_fulfilled_count::DECIMAL / (v_shadow_count + v_fulfilled_count), 2)
        ELSE 0
      END
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE fd_archetype_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY fd_archetype_analysis_user_isolation ON fd_archetype_analysis
  FOR ALL
  USING (user_id = auth.uid());

-- =====================================================
-- 8. COMMENTS
-- =====================================================

COMMENT ON TABLE fd_relationship_archetype IS 'Partnership Program archetypes for relationship pattern analysis';
COMMENT ON TABLE fd_archetype_analysis IS 'Archetype detection log for journal entries';
COMMENT ON FUNCTION fn_fd_get_archetype_distribution IS 'Get archetype distribution for user';
COMMENT ON FUNCTION fn_fd_get_archetype_insights IS 'Get archetype insights for period with transformation ratio';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
