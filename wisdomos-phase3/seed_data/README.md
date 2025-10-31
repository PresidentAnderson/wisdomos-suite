# WisdomOS Seed Data - Full 30-Area Framework

This directory contains the complete 30-area life fulfillment framework data for WisdomOS, organized into multiple formats for different use cases.

## Files Overview

### 1. `flat_table.json`
**Purpose:** Normalized machine-readable schema for Prisma database seeding

**Structure:** Array of 30 life area objects
```json
{
  "id": 1,
  "slug": "health-wellness",
  "name": "Health & Wellness",
  "phoenixName": "Phoenix of Vitality",
  "category": "FOUNDATIONAL",
  "cluster": "SYSTEMIC_STRUCTURAL",
  "description": "Physical health, fitness, nutrition, sleep, energy management",
  "score": null,
  "status": null,
  "order": 1
}
```

**Usage:**
```typescript
import { importFromFlatTable } from '@/lib/tenant/import_fulfillment_tracker'
await importFromFlatTable(prisma)
```

---

### 2. `fulfillment_tracker_demo.yaml`
**Purpose:** Sample data with realistic scores for demo tenants

**Contains:**
- Tenant metadata
- All 30 areas with scores (45-90%)
- Status indicators (🟢🟡🔴)
- Recent events and insights
- Aggregate statistics
- Next action recommendations

**Usage:**
```typescript
import { importFulfillmentTracker } from '@/lib/tenant/import_fulfillment_tracker'
await importFulfillmentTracker(prisma, 'demo')
```

---

### 3. `fulfillment_tracker_null.yaml`
**Purpose:** Blank template for new tenant initialization

**Contains:**
- Same structure as demo
- All values set to `null`
- Empty arrays for insights/actions
- Zero scores and statistics

**Usage:**
```typescript
import { importFulfillmentTracker } from '@/lib/tenant/import_fulfillment_tracker'
await importFulfillmentTracker(prisma, 'null')
```

---

## Data Structure

### The 30 Life Areas

Organized into **6 thematic domains**:

#### 1. FOUNDATIONAL (Systems & Structure) - 6 areas
- Health & Wellness
- Financial Abundance
- Work & Purpose
- Home & Environment
- Time & Energy Management
- Learning & Growth

#### 2. RELATIONAL (Connection & Love) - 6 areas
- Intimacy & Love
- Family
- Friendship
- Community & Belonging
- Communication & Boundaries
- Collaboration & Teamwork

#### 3. CREATIVE (Expression & Innovation) - 6 areas
- Art & Creativity
- Music & Sound
- Writing & Storytelling
- Innovation & Problem-Solving
- Design & Aesthetics
- Play & Experimentation

#### 4. EXPERIENTIAL (Adventure & Sensation) - 6 areas
- Adventure & Exploration
- Movement & Dance
- Nature & Wilderness
- Pleasure & Sensuality
- Rest & Recovery
- Celebration & Joy

#### 5. LEGACY (Impact & Contribution) - 6 areas
- Purpose & Calling
- Service & Contribution
- Legacy & Heritage
- Teaching & Mentorship
- Leadership & Influence
- Wealth & Generosity

#### 6. SPIRITUAL (Transcendence & Meaning) - 0 areas
*Note: Spiritual domain areas are not included in the current 30-area framework*

---

## Integration Guide

### Option 1: Use in Prisma Seed Script

Edit `packages/database/prisma/seed.ts`:

```typescript
import { importFromFlatTable } from '@/lib/tenant/import_fulfillment_tracker'

async function main() {
  // Import all 30 areas
  const result = await importFromFlatTable(prisma)
  console.log(`Imported ${result.areasImported} life areas`)

  // Optional: Import demo data
  if (process.env.DATABASE_SEED_DEMO === 'true') {
    await importFulfillmentTracker(prisma, 'demo')
  }
}
```

Run:
```bash
# Basic seed (30 blank areas)
npm run db:seed

# With demo data (30 areas + scores)
DATABASE_SEED_DEMO=true npm run db:seed
```

---

### Option 2: Use in Tenant Provisioning

When creating a new tenant, seed their schema with either demo or null data:

```typescript
import { createTenantPrismaClient } from '@/lib/tenant/provisioning'
import { importFulfillmentTracker } from '@/lib/tenant/import_fulfillment_tracker'

async function provisionNewTenant(userId: string, workspaceName: string) {
  // ... create tenant schema ...

  const tenantPrisma = createTenantPrismaClient(schemaName)

  // Seed with blank template for production
  await importFulfillmentTracker(tenantPrisma, 'null')

  // OR seed with demo data for demo/staging
  // await importFulfillmentTracker(tenantPrisma, 'demo')
}
```

---

### Option 3: Manual Import via API

Create an admin API endpoint:

```typescript
// app/api/admin/seed-areas/route.ts
import { importFulfillmentTracker } from '@/lib/tenant/import_fulfillment_tracker'

export async function POST(req: Request) {
  const { templateType } = await req.json()

  const result = await importFulfillmentTracker(
    prisma,
    templateType as 'demo' | 'null'
  )

  return Response.json(result)
}
```

---

## Color-Coding System

The framework uses emoji indicators for at-a-glance status:

| Emoji | Status | Score Range | Meaning |
|-------|--------|-------------|---------|
| 🟢 | Thriving | 80-100% | Flourishing, high fulfillment |
| 🟡 | Needs Attention | 50-79% | Functional but room for growth |
| 🔴 | Breakdown | 0-49% | Crisis state, needs immediate attention |

---

## Phoenix Archetypes

Each area has a **Phoenix Name** representing its transformation potential:

Examples:
- **Health & Wellness** → "Phoenix of Vitality"
- **Intimacy & Love** → "Phoenix of Sacred Union"
- **Purpose & Calling** → "Phoenix of Destiny"
- **Innovation & Problem-Solving** → "Phoenix of Breakthroughs"

These archetypes symbolize the transformative power of each life area.

---

## Validation

To validate YAML structure before import:

```typescript
import { validateYamlStructure } from '@/lib/tenant/import_fulfillment_tracker'

const validation = validateYamlStructure('./seed_data/fulfillment_tracker_demo.yaml')

if (!validation.valid) {
  console.error('Validation errors:', validation.errors)
}

if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings)
}
```

---

## File Locations

```
/seed_data/
  ├── flat_table.json                    # JSON schema (30 areas)
  ├── fulfillment_tracker_demo.yaml      # Demo data with scores
  ├── fulfillment_tracker_null.yaml      # Blank template
  └── README.md                          # This file

/lib/tenant/
  └── import_fulfillment_tracker.ts      # Import utility functions

/docs/
  └── grouped_domains.md                 # Human-readable documentation

/packages/database/prisma/
  └── seed.ts                            # Updated seed script
```

---

## Next Steps

1. **Install dependencies:**
   ```bash
   npm install js-yaml
   npm install --save-dev @types/js-yaml
   ```

2. **Run database migrations:**
   ```bash
   npm run db:push
   ```

3. **Seed the database:**
   ```bash
   # Production (blank template)
   npm run db:seed

   # Demo/development (with scores)
   DATABASE_SEED_DEMO=true npm run db:seed
   ```

4. **Verify import:**
   ```bash
   npm run db:studio
   # Navigate to LifeArea table
   # Should see 30 areas
   ```

---

## Troubleshooting

### Error: "YAML file not found"
- Ensure files are in `/seed_data/` directory
- Check file names match exactly
- Verify working directory is project root

### Error: "Invalid YAML structure"
- Run validation function first
- Check for syntax errors in YAML
- Ensure all required fields are present

### Error: "Prisma import failed"
- Verify Prisma schema includes LifeArea model
- Run `npx prisma generate` to update client
- Check database connection string

### Warning: "Expected 30 areas, found X"
- Check if all areas are present in file
- Verify no duplicate slugs
- Ensure proper YAML formatting

---

## Contributing

When adding new life areas:

1. Add to `flat_table.json` with unique ID and slug
2. Add to both YAML files (demo with score, null with null)
3. Update `grouped_domains.md` documentation
4. Run validation to ensure structure is valid
5. Test import in development environment

---

## Related Documentation

- [Full Documentation](/docs/grouped_domains.md) - Human-readable guide to all 30 areas
- [Integration Spec](/docs/WISDOMOS_INTEGRATION_SPEC.md) - System architecture
- [Implementation Guide](/docs/IMPLEMENTATION_COMPLETE.md) - Setup instructions

---

**Last Updated:** October 30, 2025
**Version:** 1.0 - Full 30-Area Framework
**Maintained by:** WisdomOS Development Team
