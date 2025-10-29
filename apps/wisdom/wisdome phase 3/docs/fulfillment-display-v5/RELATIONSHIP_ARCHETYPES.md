# Relationship Archetypes — Partnership Program Integration

**WisdomOS FD-v5 Enhancement: Relational Intelligence Layer**

---

## 🎯 Overview

The Relationship Archetype system extends Fulfillment Display v5 with **relational intelligence**, enabling journal entries to be categorized by the four canonical Partnership Program archetypes. This provides deep insight into relationship patterns, developmental dynamics, and transformational pathways.

---

## 🜂 The Four Archetypes

| Archetype | Emoji | Color | Core Need | Integration Question |
|-----------|-------|-------|-----------|---------------------|
| **Mother–Child** | 🤱 | #F97316 (Orange) | To nurture and be nurtured | *Can I love without rescuing?* |
| **Father–Child** | 👨‍👦 | #1F6FEB (Blue) | To guide and be guided | *Can I guide without controlling?* |
| **Sibling / Playmate** | 🤝 | #10B981 (Green) | To explore and co-create | *Can I play without competing?* |
| **Admired / Admiring** | ✨ | #A855F7 (Purple) | To inspire and be inspired | *Can I admire without losing myself?* |

---

## 📊 Archetype Structure

### Mother–Child

**Core Need**: Safety, unconditional love, and care

**Shadow Expression**:
- Over-caretaking
- Dependence
- Emotional fusion
- Rescuing others to feel needed

**Transformational Pathway**: From protection → empowerment. Learning to love without possession or control.

**Fulfilled Expression**: Co-creative care — mutual support without dependence. Compassion with boundaries.

### Father–Child

**Core Need**: Strength, order, and trust

**Shadow Expression**:
- Control
- Authoritarianism
- Rebellion
- Withdrawal of approval as punishment

**Transformational Pathway**: From authority → mentorship. Integrating discipline with empathy.

**Fulfilled Expression**: Empowered leadership — structure that liberates, not limits. Wisdom with authority.

### Sibling / Playmate

**Core Need**: Joy in equality and discovery

**Shadow Expression**:
- Competition
- Comparison
- Jealousy
- Withdrawal into cynicism

**Transformational Pathway**: From rivalry → collaboration. Restoring the innocence of play as learning.

**Fulfilled Expression**: Authentic camaraderie — curiosity, humor, and shared discovery as a path to growth.

### Admired / Admiring

**Core Need**: Recognition of beauty, excellence, or virtue

**Shadow Expression**:
- Projection
- Idolization
- Envy
- Self-doubt
- Disconnection from one's own power

**Transformational Pathway**: From projection → reflection. Seeing the admired qualities as one's own potential.

**Fulfilled Expression**: Mutual inspiration — relationships as mirrors for the highest self. Grace and gratitude.

---

## 🗄️ Database Schema

### New Tables

#### `fd_relationship_archetype`
Canonical archetype definitions (bilingual: EN/ES)

```sql
CREATE TABLE fd_relationship_archetype (
  id UUID PRIMARY KEY,
  archetype relationship_archetype NOT NULL,
  name_en VARCHAR(100),
  name_es VARCHAR(100),
  core_need_en TEXT,
  core_need_es TEXT,
  shadow_expression_en TEXT,
  shadow_expression_es TEXT,
  transformational_pathway_en TEXT,
  transformational_pathway_es TEXT,
  fulfilled_expression_en TEXT,
  fulfilled_expression_es TEXT,
  integration_question_en TEXT,
  integration_question_es TEXT,
  emoji VARCHAR(10),
  color VARCHAR(7)
);
```

#### `fd_archetype_analysis`
Archetype detection log for journal entries

```sql
CREATE TABLE fd_archetype_analysis (
  id UUID PRIMARY KEY,
  entry_id UUID REFERENCES fd_entry(id),
  user_id UUID NOT NULL,
  archetype relationship_archetype NOT NULL,
  expression archetype_expression NOT NULL,  -- shadow, transformational, fulfilled
  confidence DECIMAL(3,2),
  detected_keywords TEXT[],
  sentiment_polarity DECIMAL(3,2),
  analysis_notes TEXT,
  analyzed_by VARCHAR(50) DEFAULT 'NarrativeAgent',
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Extended Columns on `fd_entry`

```sql
ALTER TABLE fd_entry
  ADD COLUMN relationship_archetype relationship_archetype,
  ADD COLUMN archetype_expression archetype_expression,
  ADD COLUMN archetype_confidence DECIMAL(3,2) DEFAULT 0.5;
```

---

## 🤖 NarrativeAgent Enhancement

The **NarrativeAgent** now includes archetype detection:

### Detection Pipeline

1. **Keyword Extraction**: Identify archetype signals
2. **Sentiment Analysis**: Determine shadow vs. fulfilled expression
3. **Confidence Scoring**: Based on keyword density and sentiment
4. **Classification**: Assign archetype + expression level

### Example Keywords

**Mother–Child (Shadow)**:
- "I always have to..."
- "They depend on me..."
- "I can't say no..."
- "They'll fall apart without me..."

**Mother–Child (Fulfilled)**:
- "We support each other..."
- "Compassionate boundaries..."
- "Mutual care..."

**Father–Child (Shadow)**:
- "I need to control..."
- "They won't listen..."
- "My way or..."

**Father–Child (Fulfilled)**:
- "Mentoring..."
- "Structure with freedom..."
- "Empowered leadership..."

**Sibling/Playmate (Shadow)**:
- "Why are they better..."
- "I have to win..."
- "Jealous of..."

**Sibling/Playmate (Fulfilled)**:
- "We laughed together..."
- "Co-creating..."
- "Playful collaboration..."

**Admired/Admiring (Shadow)**:
- "I could never..."
- "They're so perfect..."
- "I'm not enough..."

**Admired/Admiring (Fulfilled)**:
- "Inspired by their..."
- "Mutual admiration..."
- "Reflecting my potential..."

---

## 📈 Archetype Insights

### Distribution Query

```sql
SELECT * FROM fn_fd_get_archetype_distribution('user_id');
```

**Returns**:
```
archetype          | expression      | entry_count | avg_confidence
-------------------|-----------------|-------------|---------------
mother_child       | shadow          | 12          | 0.78
sibling_playmate   | fulfilled       | 8           | 0.85
father_child       | transformational| 5           | 0.62
```

### Period Insights

```sql
SELECT fn_fd_get_archetype_insights('user_id', '2025-10-01', '2025-10-31');
```

**Returns**:
```json
{
  "dominant_archetype": "mother_child",
  "shadow_count": 12,
  "fulfilled_count": 8,
  "transformation_ratio": 0.40
}
```

---

## 🎨 UI Integration

### Monthly Review Enhancement

**Archetype Distribution Donut Chart**:
- 🤱 Mother–Child: 30% (Orange)
- 👨‍👦 Father–Child: 20% (Blue)
- 🤝 Sibling/Playmate: 35% (Green)
- ✨ Admired/Admiring: 15% (Purple)

**Shadow → Fulfilled Ratio**:
- Progress bar: 40% fulfilled (target: 60%)

### Journal Entry Tagging

When writing entries, users can optionally tag with:
- Archetype (auto-suggested by NarrativeAgent)
- Expression level (shadow / transformational / fulfilled)

### Integration Questions Widget

Display the 4 integration questions as reflection prompts:
- "Can I love without rescuing?"
- "Can I guide without controlling?"
- "Can I play without competing?"
- "Can I admire without losing myself?"

---

## 🚀 Implementation Steps

### Phase 1: Database (Week 1)
- [x] Run `20251029_relationship_archetypes.sql` migration
- [ ] Seed canonical archetypes (done in migration)
- [ ] Test archetype queries

### Phase 2: Agent Enhancement (Week 2)
- [ ] Update NarrativeAgent with archetype detection
- [ ] Test detection accuracy on sample entries
- [ ] Tune keyword lists and confidence thresholds

### Phase 3: API (Week 3)
- [ ] `/fd/archetypes` - Get all archetypes
- [ ] `/fd/archetype-distribution` - User distribution
- [ ] `/fd/archetype-insights/:period` - Period insights

### Phase 4: UI (Week 4)
- [ ] Archetype distribution chart
- [ ] Integration questions widget
- [ ] Entry archetype tagging

---

## 📖 Usage Examples

### Auto-detect Archetype

```typescript
import { NarrativeAgent } from '@/packages/agents/specialists/narrative-agent';

const agent = new NarrativeAgent(supabaseUrl, supabaseKey);

const entry = {
  content: "I keep trying to fix everyone's problems. I can't say no when they need help, even though I'm exhausted.",
  user_id: "user123"
};

// NarrativeAgent detects:
// archetype: mother_child
// expression: shadow
// confidence: 0.85
// keywords: ["fix everyone", "can't say no", "exhausted"]
```

### Query Archetype Insights

```typescript
const insights = await supabase.rpc('fn_fd_get_archetype_insights', {
  p_user_id: 'user123',
  p_start_date: '2025-10-01',
  p_end_date: '2025-10-31'
});

console.log(insights);
// {
//   dominant_archetype: 'mother_child',
//   shadow_count: 12,
//   fulfilled_count: 8,
//   transformation_ratio: 0.40
// }
```

---

## 🧪 Testing

### Test Cases

1. **Shadow Mother–Child**: "I always rescue my partner when they struggle"
   - Expected: `mother_child`, `shadow`, confidence > 0.7

2. **Fulfilled Father–Child**: "I mentored my team with clear structure and empathy"
   - Expected: `father_child`, `fulfilled`, confidence > 0.7

3. **Shadow Sibling**: "I'm jealous of my colleague's success"
   - Expected: `sibling_playmate`, `shadow`, confidence > 0.7

4. **Fulfilled Admired**: "I'm inspired by their work and see it as a mirror for my potential"
   - Expected: `admired_admiring`, `fulfilled`, confidence > 0.8

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Detection Accuracy** | 75% | Precision/recall on labeled test set |
| **User Adoption** | 40% | Users tagging entries with archetypes |
| **Transformation Ratio** | 50% | Fulfilled / (Shadow + Fulfilled) after 90 days |
| **Insight Engagement** | 60% | Monthly review views of archetype distribution |

---

## 🔒 Privacy

- All archetype data is user-isolated (RLS enforced)
- Archetype labels are bilingual for cultural sensitivity
- Users can override or delete archetype classifications

---

## 🌍 Bilingual Support

All archetype data includes English and Spanish translations:
- `name_en` / `name_es`
- `core_need_en` / `core_need_es`
- `shadow_expression_en` / `shadow_expression_es`
- `transformational_pathway_en` / `transformational_pathway_es`
- `fulfilled_expression_en` / `fulfilled_expression_es`
- `integration_question_en` / `integration_question_es`

---

## 🎓 Partnership Program Integration

This system aligns with the **Wisdom Partnership Program curriculum**, enabling:
- Relational pattern awareness
- Shadow work tracking
- Transformation journey documentation
- Integration question reflection
- Developmental milestones

---

**Version**: 1.0
**Last Updated**: 2025-10-29
**Status**: Ready for Implementation

---

*"Every relationship mirrors a developmental journey. Every pattern reveals a path to wholeness."*
