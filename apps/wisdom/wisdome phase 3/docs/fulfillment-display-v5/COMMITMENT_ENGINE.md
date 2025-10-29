# WisdomOS Commitment Engine — Architectural Specification

**"Commitments Spawn Fulfilment" — Computational Doctrine**

---

## Foundational Principle

> **Every commitment (a declared intention with follow-through potential) is the seed of a new Area of Fulfilment.**

- A **commitment** expresses **will**
- A **fulfilment area** expresses **structure**
- The **agentic bridge** between both is the **Commitment Engine**

WisdomOS dynamically creates, weights, and retires fulfilment areas based on the evolving commitment log.

---

## Table of Contents

1. [Agent Logic Overview](#1-agent-logic-overview)
2. [Commitment Definition](#2-commitment-definition)
3. [CommitmentAgent Specification](#3-commitmentagent-specification)
4. [AreaGenerator Specification](#4-areagenerator-specification)
5. [Hierarchy & Propagation](#5-hierarchy--propagation)
6. [Temporal Anchoring (1975-2100)](#6-temporal-anchoring-1975-2100)
7. [Agent Interplay Diagram](#7-agent-interplay-diagram)
8. [Autonomy Rules](#8-autonomy-rules-for-agents)
9. [Implementation Pseudocode](#9-implementation-pseudocode)
10. [API Endpoints](#10-api-endpoints)
11. [UI Integration](#11-ui-integration)
12. [Testing & Validation](#12-testing--validation)

---

## 1. Agent Logic Overview

| Agent | Function | Trigger |
|-------|----------|---------|
| **CommitmentAgent** | Detects commitments from journal entries, conversations, or system actions | On entry save or speech transcript upload |
| **AreaGenerator** | Creates or updates Fulfilment Area records from commitments | On CommitmentAgent output |
| **FulfilmentAgent** | Monitors fulfilment metrics across all live Areas | Daily + Monthly |
| **NarrativeAgent** | Links commitments to chapters (Autobiography) | After Area stabilization |
| **IntegrityAgent** | Ensures commitments are honored or cleanly released | Weekly |

---

## 2. Commitment Definition

### Data Structure

```typescript
interface Commitment {
  id: string; // UUID
  user_id: string;
  tenant_id: string;

  // Core
  statement: string; // "I commit to expanding PVT Hostel Academy into Latin America by 2026"
  summary: string; // AI-generated short form
  date: Date;
  source: 'journal' | 'voice' | 'import' | 'system';
  status: 'active' | 'completed' | 'released' | 'archived';

  // NLP Analysis
  confidence: number; // 0-1 NLP certainty
  intent_verbs: string[]; // ['commit', 'will', 'expand']
  entities: {
    subjects: string[]; // ['PVT Hostel Academy', 'Latin America']
    projects: string[];
    people: string[];
    domains: string[]; // ['Work', 'Purpose', 'Learning']
  };

  // Temporal
  start_date: Date;
  projected_end: Date; // Auto = +5 years (editable)
  active_era: string; // "Era of Expansion 2025–2030"

  // Relationships
  linked_area_id?: string;
  linked_chapter_id?: string;
  parent_commitment_id?: string;

  // Tracking
  progress_ratio: number; // 0-1 derived from area.score
  last_reviewed_at: Date;

  // Metadata
  tags: string[];
  notes_md?: string;
  created_at: Date;
  updated_at: Date;
  archived_at?: Date;
}
```

---

## 3. CommitmentAgent Specification

### Purpose
Detect commitments from natural language (journal entries, conversations, transcripts).

### Classification Pipeline

```typescript
class CommitmentAgent {
  /**
   * Step 1: NLP Parsing
   * Detect verbs of intention
   */
  detectIntentVerbs(text: string): string[] {
    const intentPatterns = [
      /\b(commit|will|plan|aim|intend|promise|vow|dedicate|resolve)\b/gi,
      /\b(going to|shall|determined to|set out to)\b/gi,
    ];

    const verbs: string[] = [];
    intentPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) verbs.push(...matches);
    });

    return verbs.map(v => v.toLowerCase());
  }

  /**
   * Step 2: Entity Extraction
   * Extract subjects, projects, domains
   */
  async extractEntities(text: string): Promise<CommitmentEntities> {
    // Use OpenAI/Anthropic for NER (Named Entity Recognition)
    const prompt = `
Extract commitment entities from this text:
"${text}"

Return JSON:
{
  "subjects": ["PVT Hostel Academy", "Latin America"],
  "projects": ["Academy Expansion"],
  "people": ["team", "partners"],
  "domains": ["Work", "Purpose", "Learning"]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Step 3: Confidence Scoring
   * Determine certainty of commitment detection
   */
  calculateConfidence(
    intentVerbs: string[],
    entities: CommitmentEntities,
    text: string
  ): number {
    let confidence = 0.0;

    // Has intent verb?
    if (intentVerbs.length > 0) confidence += 0.3;

    // Has strong verb? (commit, promise, vow)
    if (intentVerbs.some(v => ['commit', 'promise', 'vow'].includes(v))) {
      confidence += 0.2;
    }

    // Has specific entities?
    if (entities.subjects.length > 0) confidence += 0.2;
    if (entities.projects.length > 0) confidence += 0.15;

    // Has time frame?
    if (/\b(by|before|within|until|in)\s+\d{4}\b/i.test(text)) {
      confidence += 0.15;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Step 4: Commitment Detection (Main)
   */
  async detectCommitments(entry: JournalEntry): Promise<Commitment[]> {
    const text = entry.content_md;
    const commitments: Commitment[] = [];

    // Parse for intent verbs
    const intentVerbs = this.detectIntentVerbs(text);
    if (intentVerbs.length === 0) return []; // No commitment detected

    // Extract entities
    const entities = await this.extractEntities(text);

    // Calculate confidence
    const confidence = this.calculateConfidence(intentVerbs, entities, text);

    // If confidence >= 0.4, create commitment
    if (confidence >= 0.4) {
      const commitment: Commitment = {
        id: uuid(),
        user_id: entry.user_id,
        tenant_id: entry.tenant_id,
        statement: text,
        summary: await this.generateSummary(text),
        date: entry.date,
        source: 'journal',
        status: 'active',
        confidence,
        intent_verbs: intentVerbs,
        entities,
        start_date: entry.date,
        projected_end: this.calculateProjectedEnd(text, entry.date),
        active_era: null, // Auto-assigned by trigger
        progress_ratio: 0.0,
        tags: entities.domains,
        created_at: new Date(),
        updated_at: new Date(),
      };

      commitments.push(commitment);
    }

    return commitments;
  }

  /**
   * Generate short summary of commitment
   */
  async generateSummary(statement: string): Promise<string> {
    const prompt = `Summarize this commitment in 3-5 words:\n"${statement}"`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 20,
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * Calculate projected end date
   */
  calculateProjectedEnd(text: string, startDate: Date): Date {
    // Look for explicit timeframe
    const yearMatch = text.match(/\b(by|before|within|until|in)\s+(\d{4})\b/i);
    if (yearMatch) {
      const year = parseInt(yearMatch[2]);
      return new Date(year, 11, 31); // End of that year
    }

    // Default: +5 years
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 5);
    return endDate;
  }
}
```

---

## 4. AreaGenerator Specification

### Purpose
Transform commitments into Fulfilment Areas with dimensions.

### Area Creation Rules

```typescript
class AreaGenerator {
  /**
   * Step 1: Check for existing semantic cluster
   */
  async findSimilarArea(
    commitment: Commitment,
    userId: string
  ): Promise<Area | null> {
    // Get all existing areas for user
    const existingAreas = await db.fd_area.findMany({
      where: { user_id: userId, is_active: true },
    });

    // Calculate semantic similarity (cosine similarity)
    for (const area of existingAreas) {
      const similarity = await this.calculateSimilarity(
        commitment.statement,
        area.description || area.name
      );

      if (similarity > 0.8) {
        return area; // Update existing area
      }
    }

    return null; // Create new area
  }

  /**
   * Step 2: Generate Area from Commitment
   */
  async generateArea(commitment: Commitment): Promise<Area> {
    const code = `CMT_${this.hashCommitment(commitment.id)}`;
    const name = commitment.summary;
    const emoji = this.assignEmoji(commitment.entities.domains);
    const color = this.assignColor(commitment.entities.domains);

    const area: Area = {
      id: uuid(),
      code,
      name,
      emoji,
      color,
      weight_default: 0.09, // Adjustable in quarterly review
      is_active: true,
      is_auto_generated: true,
      origin_commitment_id: commitment.id,
      description: commitment.statement,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return area;
  }

  /**
   * Step 3: Generate Dimensions from Commitment
   */
  async generateDimensions(
    commitment: Commitment,
    area: Area
  ): Promise<Dimension[]> {
    // Extract sub-goals from statement
    const prompt = `
Extract 3-5 measurable sub-goals from this commitment:
"${commitment.statement}"

Return JSON array of objects with:
{
  "title": "Market Research",
  "description": "Investigate target markets in Latin America",
  "score": 0
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const subGoals = JSON.parse(response.choices[0].message.content).subgoals;

    const dimensions: Dimension[] = subGoals.map((goal: any, index: number) => ({
      id: uuid(),
      area_id: area.id,
      code: this.generateDimensionCode(goal.title),
      name: goal.title,
      weight_default: 1.0 / subGoals.length,
      description: goal.description,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    return dimensions;
  }

  /**
   * Step 4: Main Generation Pipeline
   */
  async spawnAreaFromCommitment(commitment: Commitment): Promise<{
    area: Area;
    dimensions: Dimension[];
    isNew: boolean;
  }> {
    // Check for existing similar area
    const existingArea = await this.findSimilarArea(
      commitment,
      commitment.user_id
    );

    if (existingArea) {
      // Update existing area
      await db.fd_area.update({
        where: { id: existingArea.id },
        data: {
          last_activity_at: new Date(),
          description: `${existingArea.description}\n\nRelated: ${commitment.statement}`,
        },
      });

      // Link commitment to area
      await db.fd_commitment_link.create({
        data: {
          commitment_id: commitment.id,
          area_id: existingArea.id,
          relation_strength: 0.9,
        },
      });

      return {
        area: existingArea,
        dimensions: [], // Existing dimensions unchanged
        isNew: false,
      };
    }

    // Create new area
    const newArea = await this.generateArea(commitment);
    await db.fd_area.create({ data: newArea });

    // Generate dimensions
    const dimensions = await this.generateDimensions(commitment, newArea);
    for (const dimension of dimensions) {
      await db.fd_dimension.create({ data: dimension });
    }

    // Link commitment to area
    await db.fd_commitment.update({
      where: { id: commitment.id },
      data: { linked_area_id: newArea.id },
    });

    await db.fd_commitment_link.create({
      data: {
        commitment_id: commitment.id,
        area_id: newArea.id,
        relation_strength: 1.0,
      },
    });

    return {
      area: newArea,
      dimensions,
      isNew: true,
    };
  }

  /**
   * Utility: Assign emoji based on domains
   */
  assignEmoji(domains: string[]): string {
    const emojiMap: Record<string, string> = {
      Work: '🧱',
      Purpose: '✨',
      Creative: '🎨',
      Learning: '📚',
      Health: '🩺',
      Finance: '💹',
      Family: '🏡',
      Friendship: '🤝',
      Community: '🏘️',
      Justice: '⚖️',
      Spiritual: '🕊️',
    };

    for (const domain of domains) {
      if (emojiMap[domain]) return emojiMap[domain];
    }

    return '🎯'; // Default: target/goal
  }

  /**
   * Utility: Assign color based on domains
   */
  assignColor(domains: string[]): string {
    const colorMap: Record<string, string> = {
      Work: '#6B4EFF',
      Purpose: '#FF7A59',
      Creative: '#2EC5B6',
      Learning: '#3FA9F5',
      Health: '#E83F6F',
      Finance: '#1F6FEB',
      Family: '#F97316',
      Friendship: '#10B981',
      Community: '#A855F7',
      Justice: '#111827',
      Spiritual: '#7CC576',
    };

    for (const domain of domains) {
      if (colorMap[domain]) return colorMap[domain];
    }

    return '#64748B'; // Default: neutral gray
  }

  /**
   * Utility: Hash commitment ID to short code
   */
  hashCommitment(commitmentId: string): string {
    // Simple hash: take first 8 chars of UUID
    return commitmentId.substring(0, 8).toUpperCase();
  }

  /**
   * Utility: Generate dimension code from title
   */
  generateDimensionCode(title: string): string {
    return title
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .substring(0, 20);
  }

  /**
   * Utility: Calculate semantic similarity (cosine)
   */
  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    // Use OpenAI embeddings API
    const embedding1 = await this.getEmbedding(text1);
    const embedding2 = await this.getEmbedding(text2);

    return this.cosineSimilarity(embedding1, embedding2);
  }

  async getEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  }

  cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (magnitudeA * magnitudeB);
  }
}
```

---

## 5. Hierarchy & Propagation

### Recursive Expansion

| Level | Source | Result |
|-------|--------|--------|
| **Commitment** | Atomic intention | → Spawns Area |
| **Area** | Structured goal cluster | → Spawns Dimensions |
| **Dimensions** | Measurable aspects | → Spawns Actions |
| **Actions** | Daily behavior | → Feed back into Fulfillment Scores |

Commitments recursively expand into the full Fulfillment Display architecture.

---

## 6. Temporal Anchoring (1975-2100)

### Era Structure

Each commitment maps to a temporal era on the 1975-2100 timeline.

```typescript
interface Era {
  id: string;
  user_id: string;
  name: string; // "Era of Expansion 2025–2030"
  start_year: number;
  end_year: number;
  theme: string; // "Expansion", "Consolidation", "Emergence"
  chapter_id?: string; // Link to autobiography chapter
}
```

### Example Timeline

| Era | Years | Theme |
|-----|-------|-------|
| Foundations | 1975–1990 | Foundation |
| Creative Emergence | 1990–2005 | Emergence |
| The Hostel Years | 2005–2025 | Building |
| Era of Expansion | 2025–2030 | Expansion |
| Legacy Consolidation | 2030–2040 | Consolidation |
| Wisdom Sharing | 2040–2100 | Legacy |

### Auto-Assignment

- Commitment date → determine year → find matching era
- If no era exists, create default 5-year era
- Update `commitment.active_era` field

---

## 7. Agent Interplay Diagram

```
User Entry (Journal)
        ↓
  JournalAgent
        ↓ (detect commitments)
  CommitmentAgent
        ↓ (spawn/update area)
  AreaGenerator
        ↓ (init dimensions)
  FulfilmentAgent
        ↓ (track progress)
  NarrativeAgent
        ↓ (embed into autobiography)
  IntegrityAgent
        ↓ (verify honor or release)
```

---

## 8. Autonomy Rules for Agents

| Condition | Agent Action |
|-----------|--------------|
| Commitment confidence > 0.75 | **Auto-spawn Area** |
| Commitment confidence 0.4–0.75 | **Flag for user confirmation** |
| No matching Area after 30 days | **Auto-archive commitment** |
| Area inactive for 6 months | **Mark "Dormant"** |
| Commitment fulfilled | **Mark Area "Completed"** and close loop |

---

## 9. Implementation Pseudocode

### Complete Flow

```typescript
// Trigger: New journal entry created
async function onJournalEntryCreated(entry: JournalEntry) {
  // Step 1: Detect commitments
  const commitmentAgent = new CommitmentAgent();
  const detectedCommitments = await commitmentAgent.detectCommitments(entry);

  for (const commitment of detectedCommitments) {
    // Step 2: Save commitment to database
    const savedCommitment = await db.fd_commitment.create({
      data: commitment,
    });

    // Link commitment to entry
    await db.fd_commitment_entry_link.create({
      data: {
        commitment_id: savedCommitment.id,
        entry_id: entry.id,
        extraction_confidence: commitment.confidence,
      },
    });

    // Step 3: Check confidence threshold
    if (commitment.confidence > 0.75) {
      // Auto-spawn area
      const areaGenerator = new AreaGenerator();
      const result = await areaGenerator.spawnAreaFromCommitment(
        savedCommitment
      );

      console.log(`✅ Area ${result.isNew ? 'created' : 'updated'}: ${result.area.name}`);

      // Step 4: Link to autobiography
      if (result.isNew) {
        const narrativeAgent = new NarrativeAgent();
        await narrativeAgent.linkCommitmentToChapter(savedCommitment);
      }
    } else if (commitment.confidence >= 0.4) {
      // Flag for user confirmation
      await notifyUser({
        type: 'commitment_detected',
        commitment: savedCommitment,
        message: 'We detected a possible commitment. Confirm to create an Area.',
      });
    }
  }
}

// Trigger: Weekly integrity check
async function runWeeklyIntegrityCheck(userId: string) {
  const integrityAgent = new IntegrityAgent();

  // Get all active commitments
  const activeCommitments = await db.fd_commitment.findMany({
    where: { user_id: userId, status: 'active' },
    include: { linked_area: true },
  });

  for (const commitment of activeCommitments) {
    // Check if progress is being made
    if (commitment.progress_ratio === 0 && commitment.created_at < thirtyDaysAgo()) {
      // Flag as stalled
      await db.fd_integrity_log.create({
        data: {
          user_id: userId,
          area_id: commitment.linked_area_id,
          issue: `Commitment stalled: "${commitment.summary}"`,
          severity: 'medium',
        },
      });
    }
  }
}
```

---

## 10. API Endpoints

### Base URL
`https://wisdomos-phoenix-frontend.vercel.app/api/fd`

### New Endpoints

```typescript
// Commitments
GET    /fd/commitments                    // List all commitments
GET    /fd/commitments/:id                // Get single commitment
POST   /fd/commitments                    // Manual commitment creation
PATCH  /fd/commitments/:id                // Update commitment status
DELETE /fd/commitments/:id                // Archive commitment

// Commitment-Area Links
GET    /fd/commitments/:id/areas          // Areas linked to commitment
POST   /fd/commitments/:id/spawn-area     // Force spawn area from commitment

// Eras
GET    /fd/eras                           // List timeline eras
POST   /fd/eras                           // Create custom era
PATCH  /fd/eras/:id                       // Update era

// CFI (Commitment Fulfillment Index)
GET    /fd/cfi                            // Get user's CFI score
```

---

## 11. UI Integration

### Dashboard: Commitment Widget

**Location**: `/fd/dashboard`

**Display**:
- Active commitments count
- CFI score (0-100)
- Top 3 progressing commitments
- Bottom 3 stalled commitments
- "Do next" micro-actions per commitment

### Commitment Detail Page

**Path**: `/fd/commitment/:id`

**Components**:
- Commitment statement (editable)
- Linked Areas (with scores)
- Progress timeline
- Linked journal entries
- Era context
- Integrity status
- Actions per dimension

### Timeline Visualization

**Path**: `/fd/timeline`

**Display**:
- 1975-2100 timeline with eras
- Commitments plotted on timeline
- Click commitment → see linked Areas
- Hover era → see all commitments in that period

---

## 12. Testing & Validation

### Unit Tests

```typescript
describe('CommitmentAgent', () => {
  it('should detect commitment with high confidence', async () => {
    const entry = {
      content_md: 'I commit to launching a new hostel in Mexico City by 2026.',
    };

    const agent = new CommitmentAgent();
    const commitments = await agent.detectCommitments(entry);

    expect(commitments).toHaveLength(1);
    expect(commitments[0].confidence).toBeGreaterThan(0.75);
  });

  it('should extract entities correctly', async () => {
    const text = 'I will expand PVT Hostel Academy into Latin America.';

    const agent = new CommitmentAgent();
    const entities = await agent.extractEntities(text);

    expect(entities.subjects).toContain('PVT Hostel Academy');
    expect(entities.subjects).toContain('Latin America');
  });
});

describe('AreaGenerator', () => {
  it('should generate area from commitment', async () => {
    const commitment = {
      id: 'c123',
      statement: 'I will launch a new business vertical.',
      entities: { domains: ['Work', 'Purpose'] },
    };

    const generator = new AreaGenerator();
    const result = await generator.spawnAreaFromCommitment(commitment);

    expect(result.area.code).toMatch(/^CMT_/);
    expect(result.dimensions.length).toBeGreaterThan(0);
  });

  it('should find similar existing area', async () => {
    const commitment = {
      statement: 'I will expand the hostel business in Europe.',
    };

    const generator = new AreaGenerator();
    const similar = await generator.findSimilarArea(commitment, 'user123');

    // Assumes existing "Hostel Expansion" area
    expect(similar).not.toBeNull();
  });
});
```

---

## 13. Deployment Checklist

### Phase 1: Database (Week 1)
- [x] Run migration: `20251029_commitment_engine.sql`
- [ ] Test RLS policies on commitment tables
- [ ] Seed default eras for test users

### Phase 2: Agents (Week 2)
- [ ] Implement `CommitmentAgent` class
- [ ] Implement `AreaGenerator` class
- [ ] Deploy as Supabase Edge Functions
- [ ] Test NLP accuracy (>80% precision)

### Phase 3: API (Week 3)
- [ ] Implement `/fd/commitments` endpoints
- [ ] Implement `/fd/cfi` endpoint
- [ ] Deploy to staging

### Phase 4: UI (Week 4)
- [ ] Build Commitment Dashboard widget
- [ ] Build Commitment Detail page
- [ ] Build Timeline visualization
- [ ] Deploy to staging

### Phase 5: Integration (Week 5)
- [ ] Wire `onJournalEntryCreated` trigger
- [ ] Wire weekly integrity check
- [ ] Test end-to-end flow
- [ ] Deploy to production

---

**Document Version**: 1.0
**Last Updated**: 2025-10-29
**Status**: Ready for Implementation

---

*"Will becomes structure. Structure becomes fulfillment."*
