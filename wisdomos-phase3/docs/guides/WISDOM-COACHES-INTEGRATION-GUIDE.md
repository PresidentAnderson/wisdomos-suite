# WisdomOS Coaches Integration Guide

**Date:** 2025-10-29
**Status:** Ready for Implementation
**Purpose:** Integrate WE2/WE3-aligned coaching system with Fulfillment Display

---

## Overview

This guide integrates a comprehensive coaching system into wisdomOS 2026, aligned with:
- **WE2 Assessment Model**: Relational capability assessment (not feelings)
- **WE3 Framework**: "Issue-free" living and generative possibilities
- **Fulfillment Display**: 13 life areas with signals and assessments

---

## What Was Created

### 1. Database Schema (`supabase/migrations/20251029_wisdom_schema.sql`)

**Core Tables:**
- `areas` - Life areas from Fulfillment Display
- `people` - Relationships and connections
- `area_people` - Who you communicate with per area
- `area_dimensions` - Custom dimensions per area
- `dim_signals` - 0-5 ratings over time (30-day rolling average)
- `assessments` - WE2 relationship assessments (WE2-WE5)
- `autobio_entries` - Autobiography entries per area
- `conversations` - Coach dialogue history
- `coaches` - AI coaches with WE2/WE3-informed context

**Key View:**
- `v_area_fulfillment` - Rolling 30-day signal avg + 90-day assessment avg

**RPCs:**
- `create_or_update_coach()` - Create/update coach with context
- `coach_log()` - Log conversation turn, optionally add to autobiography
- `upsert_dim_signal()` - Record a dimension signal

### 2. Edge Functions

**Location:** `supabase/functions/`

#### `coach-factory/index.ts`
Seeds a coach for a new area with WE2/WE3-informed context prompt.

**Context Includes:**
- WE2: Assess relational "state & condition" (capability, not feelings)
- WE3: "Issue-free" living reframe
- Modes: Immediate, Structural, Generative, Representational
- Coaching strategy based on scores (<3 = Restoration, ≥4 = Play)

**Usage:**
```bash
POST /functions/v1/coach-factory
{
  "area_id": "uuid",
  "area_name": "Health & Vitality",
  "commitment": "I am vibrant, energized, and physically capable"
}
```

#### `coach-turn/index.ts`
Logs a conversation turn. Your external AI layer calls this after generating a response.

**Usage:**
```bash
POST /functions/v1/coach-turn
{
  "area_id": "uuid",
  "role": "user" | "coach" | "system",
  "content_md": "...",
  "tags": ["insight", "commitment"],
  "autobio": false  // true to add to autobiography
}
```

#### `signal-write/index.ts`
Records a dimension signal (0-5 scale) with optional note.

**Usage:**
```bash
POST /functions/v1/signal-write
{
  "area_id": "uuid",
  "key": "vitality",
  "value": 4.2,
  "note": "Great energy after morning routine"
}
```

---

## Integration Steps

### Step 1: Apply Database Schema

```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"

# If using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Copy contents of supabase/migrations/20251029_wisdom_schema.sql
# Paste and run in Supabase SQL Editor
```

### Step 2: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy coach-factory
supabase functions deploy coach-turn
supabase functions deploy signal-write

# Or deploy all at once
supabase functions deploy
```

### Step 3: Set Environment Variables

Create `.env` files for each function or set in Supabase dashboard:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Test Edge Functions Locally (Optional)

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve

# Test in another terminal
curl -X POST http://localhost:54321/functions/v1/coach-factory \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"area_id":"test-uuid","area_name":"Test Area","commitment":"Test commitment"}'
```

---

## Seed Data: 13 Life Areas

**File:** `supabase/migrations/20251029_seed_life_areas.sql` (to be created)

Based on your Fulfillment Display, here are the 13 life areas to seed:

```sql
-- Seed 13 Life Areas from Fulfillment Display
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

-- Seed default dimensions for each area (example for Health & Vitality)
insert into public.area_dimensions (area_id, key, label, weight)
select
  id,
  unnest(array['vitality', 'strength', 'flexibility', 'endurance', 'recovery']),
  unnest(array['Vitality', 'Strength', 'Flexibility', 'Endurance', 'Recovery']),
  1.0
from public.areas
where slug = 'health-vitality'
on conflict (area_id, key) do nothing;

-- Create coaches for all areas
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

Modes: Immediate, Structural, Generative, Representational.

Coaching Strategy:
- If score < 3 → Restoration Mode (requests/promises/boundaries)
- If score ≥ 4 → Play Mode (social experiments, speculation/inquiry)

Process:
- Log insights to autobiography when user approves
- Track dimension signals (0-5 scale)
- Use WE2 assessments for relationship capability
- Focus on fulfillment, not problem-solving', r.name, r.commitment)
    );
  end loop;
end $$;
```

**To apply:**
```bash
# Create the seed file
cat > supabase/migrations/20251029_seed_life_areas.sql << 'EOF'
[paste SQL above]
EOF

# Apply migration
supabase db push
```

---

## Admin Interface Options

### Option A: Use Provided React Admin (Recommended)

**Location:** Create as separate app at `apps/wisdom-admin/`

**Setup:**
```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps"

# Create Vite React app
npm create vite@latest wisdom-admin -- --template react-ts
cd wisdom-admin
npm install @supabase/supabase-js

# Create .env
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF

# Add to root package.json scripts
# "admin:dev": "pnpm --filter @wisdom/wisdom-admin dev"
```

**Files to create:**
1. `src/supabase.ts` - Supabase client
2. `src/App.tsx` - Main admin interface (provided in bundle)

See original bundle for complete React Admin code.

### Option B: Integrate into Existing Web App

Add admin routes to `apps/web/`:

```typescript
// apps/web/app/admin/coaches/page.tsx
import { CoachesAdmin } from '@/components/admin/CoachesAdmin';

export default function CoachesAdminPage() {
  return <CoachesAdmin />;
}
```

### Option C: Use Supabase Studio

Directly manage tables in Supabase Studio UI:
- Navigate to Table Editor
- CRUD operations on all tables
- View fulfillment dashboard via SQL queries

---

## API Integration

### From Next.js App

```typescript
// apps/web/lib/wisdom-api.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function logCoachTurn(
  areaId: string,
  role: 'user' | 'coach' | 'system',
  contentMd: string,
  tags: string[] = [],
  autobio: boolean = false
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/coach-turn`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ area_id: areaId, role, content_md: contentMd, tags, autobio })
    }
  );

  return response.json();
}

export async function recordSignal(
  areaId: string,
  dimensionKey: string,
  value: number,
  note?: string
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/signal-write`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ area_id: areaId, key: dimensionKey, value, note })
    }
  );

  return response.json();
}

export async function getFulfillmentDashboard() {
  const { data, error } = await supabase
    .from('v_area_fulfillment')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}
```

### Usage in Components

```typescript
// apps/web/components/CoachChat.tsx
'use client';

import { useState } from 'react';
import { logCoachTurn } from '@/lib/wisdom-api';

export function CoachChat({ areaId, areaName }: { areaId: string; areaName: string }) {
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([]);
  const [input, setInput] = useState('');

  async function sendMessage() {
    // Log user message
    await logCoachTurn(areaId, 'user', input);

    // TODO: Call your AI service to generate coach response
    // const coachResponse = await generateCoachResponse(areaId, input);

    // Log coach response
    // await logCoachTurn(areaId, 'coach', coachResponse);

    setInput('');
  }

  return (
    <div>
      <h2>{areaName} Coach</h2>
      {/* Chat UI */}
    </div>
  );
}
```

---

## Fulfillment Display Integration

### Query Fulfillment Data

```typescript
// Get 30-day rolling average for an area
const { data: signals } = await supabase
  .from('dim_signals')
  .select('*')
  .eq('area_id', areaId)
  .gte('at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  .order('at');

// Calculate average
const avg = signals.reduce((sum, s) => sum + s.value, 0) / signals.length;

// Get recent assessments
const { data: assessments } = await supabase
  .from('assessments')
  .select('*, people(full_name)')
  .eq('area_id', areaId)
  .gte('at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
  .order('at', { ascending: false });
```

### Display Fulfillment Dashboard

```typescript
import { getFulfillmentDashboard } from '@/lib/wisdom-api';

export async function FulfillmentDashboard() {
  const dashboard = await getFulfillmentDashboard();

  return (
    <div className="grid grid-cols-3 gap-4">
      {dashboard.map(area => (
        <div key={area.area_id} className="p-4 border rounded">
          <h3>{area.name}</h3>
          <p>Signal Avg (30d): {area.avg_signal_30d?.toFixed(1) ?? '-'}</p>
          <p>Assessment Avg (90d): {area.assessment_avg_90d?.toFixed(1) ?? '-'}</p>
          <p>Last Signal: {area.last_signal_at ? new Date(area.last_signal_at).toLocaleDateString() : '-'}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Testing Checklist

- [ ] SQL schema applied successfully
- [ ] All tables created and accessible
- [ ] View `v_area_fulfillment` returns data
- [ ] Edge functions deployed
- [ ] Coach factory creates coaches
- [ ] Coach turn logs conversations
- [ ] Signal write records signals
- [ ] Seed data applied (13 life areas)
- [ ] Coaches created for all areas
- [ ] Fulfillment dashboard displays correctly

---

## Next Steps

1. **Apply Seed Data** (see SQL above)
2. **Choose Admin Interface** (Option A, B, or C)
3. **Integrate into Web App** (coach chat, fulfillment display)
4. **Connect AI Service** (OpenAI, Anthropic, etc. for coach responses)
5. **Add User Authentication** (update RLS policies)
6. **Create Mobile Views** (React Native components)
7. **Build Desktop App** (Electron wrapper)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     wisdomOS 2026                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile App  │  │ Desktop App  │      │
│  │  (Next.js)   │  │ (React Native│  │  (Electron)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │                │
│         └─────────────────┴─────────────────┘                │
│                           │                                   │
│                    ┌──────▼──────┐                           │
│                    │ Supabase    │                           │
│                    │ Edge Funcs  │                           │
│                    ├─────────────┤                           │
│                    │coach-factory│                           │
│                    │coach-turn   │                           │
│                    │signal-write │                           │
│                    └──────┬──────┘                           │
│                           │                                   │
│                    ┌──────▼──────┐                           │
│                    │  PostgreSQL │                           │
│                    │  (Supabase) │                           │
│                    ├─────────────┤                           │
│                    │ • areas     │                           │
│                    │ • people    │                           │
│                    │ • coaches   │                           │
│                    │ • signals   │                           │
│                    │ • assessments│                          │
│                    └─────────────┘                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## WE2/WE3 Alignment

### WE2: Relationship Assessment
- **Capability, not feelings**: Assessments measure relational capacity
- **Dimensions**: Relatedness, Workability, Reliability, Openness
- **Scale**: 0-5 (decimals allowed)
- **Overall score**: Auto-calculated average

### WE3: Issue-Free Living
- **Reframe**: "This is what having what I want looks like now"
- **Modes**: Immediate, Structural, Generative, Representational
- **Coaching Strategy**:
  - Score < 3: Restoration Mode (requests/promises/boundaries)
  - Score ≥ 4: Play Mode (experiments, speculation/inquiry)

### Fulfillment Display Integration
- **13 Life Areas**: Health, Partnership, Family, Career, Financial, Growth, Creativity, Social, Environment, Recreation, Spiritual, Contribution, Rest
- **Signals**: 0-5 ratings tracked over time (30-day rolling average)
- **Dimensions**: Custom per area (e.g., Health: vitality, strength, flexibility, endurance, recovery)
- **Assessments**: WE2-based relationship capability scores (90-day rolling average)

---

## Files Created

1. `supabase/migrations/20251029_wisdom_schema.sql` - Database schema
2. `supabase/functions/coach-factory/index.ts` - Coach creation
3. `supabase/functions/coach-turn/index.ts` - Conversation logging
4. `supabase/functions/signal-write/index.ts` - Signal recording
5. `WISDOM-COACHES-INTEGRATION-GUIDE.md` - This document

---

**Status:** ✅ Ready for deployment
**Next:** Apply migrations and deploy functions
