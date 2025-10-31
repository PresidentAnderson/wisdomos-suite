# WisdomOS Engineering Integration Blueprint

**Version**: 1.0.0
**Date**: 2025-10-30
**Architecture**: True Multi-Tenant with Schema Isolation
**Purpose**: Transform WISDOM 2025 Workbook into Production-Ready Application

---

## I. System Overview

### Core Philosophy
WisdomOS transforms personal development from journaling into an **intelligent operating system for life transformation**:

```
Personal Transformation = Data + Reflection + Feedback Loops + Integration
```

**Key Principles**:
- Every life event becomes structured data
- Patterns emerge through aggregation and analysis
- Insights feed back into commitments and boundaries
- Progress is measured across 30 life areas (Phoenix Fulfillment Display)
- Multi-tenant isolation ensures absolute privacy

### Architecture Pattern
```
User → Tenant → Schema → Life Areas → Events → Insights → Commitments
```

Each tenant gets:
- Isolated PostgreSQL schema (e.g., `tenant_abc123`)
- Dedicated data tables
- Cross-schema queries blocked at database level
- No shared data between tenants

---

## II. Data Layer (Prisma Schema)

### Multi-Tenant Architecture

**Primary Models**:

```prisma
// ============================================
// SYSTEM LAYER (public schema)
// ============================================

model Tenant {
  id            String   @id @default(cuid())
  schemaName    String   @unique  // e.g., "tenant_abc123"
  name          String              // Workspace display name
  ownerId       String              // References User.id
  status        TenantStatus @default(ACTIVE)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  users         UserTenant[]

  @@index([ownerId])
  @@index([status])
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  firstName     String?
  lastName      String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastLoginAt   DateTime?

  tenants       UserTenant[]

  @@index([email])
}

model UserTenant {
  id          String @id @default(cuid())
  userId      String
  tenantId    String
  role        TenantRole @default(MEMBER)

  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant      Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())

  @@unique([userId, tenantId])
  @@index([userId])
  @@index([tenantId])
}

enum TenantRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}
```

---

### Tenant-Specific Schema (per tenant)

**Created dynamically when tenant is provisioned.**

Each tenant schema contains:

```prisma
// ============================================
// TENANT SCHEMA (tenant_abc123)
// ============================================

model LifeArea {
  id              String  @id @default(cuid())
  slug            String  @unique  // e.g., "work", "romantic-intimacy"
  name            String
  description     String?
  cluster         LifeAreaCluster
  sortOrder       Int     @default(0)
  isActive        Boolean @default(true)

  // Current fulfillment state
  currentScore    Float   @default(50.0)  // 0-100 scale
  status          AreaStatus @default(BALANCED)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  events          Event[]
  commitments     Commitment[]
  boundaries      Boundary[]
  metrics         MetricSnapshot[]

  @@index([cluster])
  @@index([status])
  @@index([sortOrder])
}

enum LifeAreaCluster {
  SYSTEMIC_STRUCTURAL      // work, finance, living-environment, legal-civic, time-energy
  RELATIONAL_HUMAN         // romantic-intimacy, family, friendships, professional-network, community
  INNER_PERSONAL           // physical-health, mental-health, emotional-wellbeing, personal-growth, spirituality
  CREATIVE_EXPRESSIVE      // creative-expression, hobbies-play, style-aesthetics, humor-levity, sensuality
  EXPLORATORY_EXPANSIVE    // travel-adventure, learning-education, innovation, nature, curiosity
  INTEGRATIVE_LEGACY       // purpose-mission, values-integrity, legacy-impact, contribution, wisdom
}

enum AreaStatus {
  CRISIS          // Score < 20
  STRUGGLING      // Score 20-39
  BALANCED        // Score 40-69
  THRIVING        // Score 70-89
  FLOURISHING     // Score 90-100
}

model Event {
  id              String    @id @default(cuid())
  lifeAreaId      String

  type            EventType
  category        EventCategory
  tone            EventTone

  title           String
  description     String    @db.Text
  narrative       String?   @db.Text  // Full story

  occurredAt      DateTime
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Emotional and transformational data
  emotionalCharge Int       // -5 to +5
  tags            String[]

  // Relationships
  lifeArea        LifeArea  @relation(fields: [lifeAreaId], references: [id], onDelete: Cascade)
  insights        Insight[]
  commitments     Commitment[]

  @@index([lifeAreaId])
  @@index([type])
  @@index([occurredAt])
  @@index([createdAt])
}

enum EventType {
  BREAKTHROUGH     // Major positive shift
  PROGRESS         // Incremental improvement
  SETBACK          // Temporary regression
  UPSET            // Triggering event requiring inquiry
  MILESTONE        // Significant achievement
  PATTERN          // Recurring theme identified
  LEARNING         // Insight or wisdom gained
}

enum EventCategory {
  PERSONAL
  RELATIONAL
  PROFESSIONAL
  HEALTH
  SPIRITUAL
  FINANCIAL
  CREATIVE
  OTHER
}

enum EventTone {
  POSITIVE
  NEGATIVE
  NEUTRAL
  TRANSFORMATIONAL
  COMPLEX
}

model Insight {
  id              String   @id @default(cuid())
  eventId         String?

  type            InsightType
  title           String
  description     String   @db.Text

  // Pattern recognition
  isRecurring     Boolean  @default(false)
  frequency       Int      @default(1)
  relatedEvents   String[] // Event IDs

  // Integration
  applied         Boolean  @default(false)
  appliedAt       DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  event           Event?   @relation(fields: [eventId], references: [id], onDelete: SetNull)
  commitments     Commitment[]

  @@index([type])
  @@index([isRecurring])
  @@index([applied])
}

enum InsightType {
  TRUTH_REVEALED       // Core belief or pattern exposed
  LIMITING_BELIEF      // Self-imposed constraint identified
  STRENGTH_DISCOVERED  // New capability recognized
  VALUE_CLARIFIED      // Core value articulated
  PATTERN_RECOGNIZED   // Recurring behavior identified
  WISDOM_INTEGRATED    // Deep learning embodied
}

model Commitment {
  id              String   @id @default(cuid())
  lifeAreaId      String?
  eventId         String?
  insightId       String?

  statement       String   @db.Text
  intention       String   @db.Text
  measurable      String?  @db.Text

  status          CommitmentStatus @default(ACTIVE)

  // Tracking
  createdAt       DateTime @default(now())
  completedAt     DateTime?
  reviewedAt      DateTime?

  // Relationships
  lifeArea        LifeArea? @relation(fields: [lifeAreaId], references: [id], onDelete: SetNull)
  event           Event?    @relation(fields: [eventId], references: [id], onDelete: SetNull)
  insight         Insight?  @relation(fields: [insightId], references: [id], onDelete: SetNull)

  @@index([status])
  @@index([lifeAreaId])
  @@index([createdAt])
}

enum CommitmentStatus {
  ACTIVE
  COMPLETED
  PAUSED
  ABANDONED
  INTEGRATED  // Fully embodied, no longer needs tracking
}

model Boundary {
  id              String   @id @default(cuid())
  lifeAreaId      String

  statement       String   @db.Text
  reason          String   @db.Text
  consequence     String?  @db.Text

  status          BoundaryStatus @default(ACTIVE)

  // Violation tracking
  lastViolatedAt  DateTime?
  violationCount  Int      @default(0)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  lifeArea        LifeArea @relation(fields: [lifeAreaId], references: [id], onDelete: Cascade)

  @@index([lifeAreaId])
  @@index([status])
}

enum BoundaryStatus {
  ACTIVE
  SUSPENDED
  DISSOLVED
  INTEGRATED
}

model MetricSnapshot {
  id              String   @id @default(cuid())
  lifeAreaId      String

  date            DateTime @default(now())
  score           Float    // 0-100
  status          AreaStatus

  // Aggregate counts
  eventCount      Int      @default(0)
  upsetCount      Int      @default(0)
  breakthroughCount Int    @default(0)

  notes           String?  @db.Text

  lifeArea        LifeArea @relation(fields: [lifeAreaId], references: [id], onDelete: Cascade)

  @@unique([lifeAreaId, date])
  @@index([lifeAreaId])
  @@index([date])
}

model AutobiographyEntry {
  id              String   @id @default(cuid())

  eraId           String   // References era (1975-2025, 2025-2050, etc.)
  year            Int
  month           Int?

  title           String
  narrative       String   @db.Text

  // Cross-references
  eventIds        String[]
  lifeAreaIds     String[]

  isPublic        Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([eraId])
  @@index([year])
}
```

---

## III. Processing Layer (Logic & Jobs)

### 1. Score Calculation Engine

**Location**: `/api/src/services/fulfillment/scoreCalculator.ts`

**Algorithm**:
```typescript
interface ScoreInputs {
  recentEvents: Event[]
  commitmentRatio: number  // completed / total
  boundaryViolations: number
  upsetFrequency: number
  breakthroughCount: number
}

function calculateAreaScore(inputs: ScoreInputs): number {
  let baseScore = 50

  // Factor 1: Event momentum (+/- 20 points)
  const eventMomentum = calculateEventMomentum(inputs.recentEvents)
  baseScore += eventMomentum

  // Factor 2: Commitment integrity (+/- 15 points)
  const commitmentScore = inputs.commitmentRatio * 15
  baseScore += commitmentScore

  // Factor 3: Boundary health (-10 points per violation)
  baseScore -= Math.min(inputs.boundaryViolations * 10, 30)

  // Factor 4: Upset frequency (negative weight)
  baseScore -= Math.min(inputs.upsetFrequency * 5, 20)

  // Factor 5: Breakthrough bonus (+15 per breakthrough)
  baseScore += Math.min(inputs.breakthroughCount * 15, 30)

  return Math.max(0, Math.min(100, baseScore))
}
```

**Triggers**:
- New event created
- Commitment status changed
- Boundary violation logged
- Manual refresh requested

---

### 2. Pattern Recognition Engine

**Location**: `/api/src/services/insights/patternRecognizer.ts`

**Logic**:
```typescript
async function detectPatterns(tenantSchema: string) {
  // Query events with similar tags/descriptions
  const events = await prisma.$queryRaw`
    SELECT * FROM "${tenantSchema}".events
    WHERE created_at > NOW() - INTERVAL '90 days'
    ORDER BY created_at DESC
  `

  // Group by semantic similarity
  const patterns = detectSemanticClusters(events)

  // Create insights for recurring patterns
  for (const pattern of patterns) {
    if (pattern.frequency >= 3) {
      await prisma.insight.create({
        data: {
          type: 'PATTERN_RECOGNIZED',
          title: `Recurring: ${pattern.theme}`,
          description: generatePatternDescription(pattern),
          isRecurring: true,
          frequency: pattern.frequency,
          relatedEvents: pattern.eventIds
        }
      })
    }
  }
}
```

**Runs**: Daily cron job at 2 AM UTC

---

### 3. Snapshot Job (Daily/Weekly Summaries)

**Location**: `/api/src/jobs/createSnapshots.ts`

```typescript
async function createDailySnapshots(tenantSchema: string) {
  const lifeAreas = await prisma.lifeArea.findMany()

  for (const area of lifeAreas) {
    const score = await calculateAreaScore({
      lifeAreaId: area.id,
      tenantSchema
    })

    const eventCounts = await getEventCounts(area.id, tenantSchema)

    await prisma.metricSnapshot.create({
      data: {
        lifeAreaId: area.id,
        date: new Date(),
        score,
        status: getStatusFromScore(score),
        ...eventCounts
      }
    })
  }
}
```

**Schedule**:
- Daily at 11:59 PM user local time
- Weekly on Sunday
- Monthly on last day of month

---

## IV. API Endpoints (REST Spec)

### Base URL
```
Production: https://api.wisdomos.com/v1
Development: http://localhost:3000/api/v1
```

### Authentication
All endpoints require `Authorization: Bearer <JWT>` header.

JWT payload includes:
```json
{
  "userId": "user_abc123",
  "tenantId": "tenant_xyz789",
  "tenantSchema": "tenant_xyz789",
  "role": "OWNER"
}
```

---

### Endpoints

#### **POST /auth/register**
Create new user + tenant.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "workspaceName": "John's Transformation Journey"
}
```

**Response**:
```json
{
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "firstName": "John"
  },
  "tenant": {
    "id": "tenant_xyz789",
    "name": "John's Transformation Journey",
    "schemaName": "tenant_xyz789"
  },
  "token": "eyJhbGc..."
}
```

**Backend Process**:
1. Create `User` in public schema
2. Create `Tenant` record with generated schema name
3. Execute `CREATE SCHEMA tenant_xyz789`
4. Run Prisma migrations on new schema
5. Seed default life areas (30 areas)
6. Create `UserTenant` relationship
7. Return JWT with tenant context

---

#### **POST /auth/login**
Authenticate user.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "user": {...},
  "tenants": [
    {
      "id": "tenant_xyz789",
      "name": "John's Transformation Journey",
      "role": "OWNER"
    }
  ],
  "token": "eyJhbGc..."
}
```

---

#### **GET /life-areas**
Fetch all life areas with current scores.

**Response**:
```json
{
  "lifeAreas": [
    {
      "id": "area_001",
      "slug": "work",
      "name": "Work & Purpose",
      "cluster": "SYSTEMIC_STRUCTURAL",
      "currentScore": 72.5,
      "status": "THRIVING",
      "sortOrder": 1
    },
    // ... 29 more
  ]
}
```

---

#### **POST /events**
Create new life event.

**Request**:
```json
{
  "lifeAreaId": "area_001",
  "type": "BREAKTHROUGH",
  "category": "PROFESSIONAL",
  "tone": "POSITIVE",
  "title": "Got promoted to Senior Engineer",
  "description": "After 2 years of hard work, finally recognized...",
  "narrative": "Full story here...",
  "occurredAt": "2025-10-29T10:00:00Z",
  "emotionalCharge": 5,
  "tags": ["career", "recognition", "growth"]
}
```

**Response**:
```json
{
  "event": {...},
  "updatedScore": 75.2,
  "suggestedInsights": [
    "Your pattern of consistent effort leading to recognition"
  ]
}
```

**Backend Triggers**:
- Recalculate life area score
- Check for pattern matches
- Update dashboard aggregates

---

#### **GET /dashboard**
Get overview dashboard data.

**Response**:
```json
{
  "overallScore": 68.4,
  "distribution": {
    "flourishing": 3,
    "thriving": 12,
    "balanced": 10,
    "struggling": 4,
    "crisis": 1
  },
  "topAreas": [
    {"slug": "work", "score": 85.2},
    {"slug": "physical-health", "score": 78.9}
  ],
  "needsAttention": [
    {"slug": "romantic-intimacy", "score": 22.3, "status": "STRUGGLING"}
  ],
  "recentActivity": [...],
  "activeCommitments": 12,
  "upcomingReviews": [...]
}
```

---

#### **GET /insights**
Get detected patterns and insights.

**Response**:
```json
{
  "insights": [
    {
      "id": "insight_001",
      "type": "PATTERN_RECOGNIZED",
      "title": "Recurring: Work-Life Imbalance",
      "description": "You've logged 4 upsets in the past 30 days related to overwork...",
      "isRecurring": true,
      "frequency": 4,
      "relatedEvents": ["evt_1", "evt_2", "evt_3", "evt_4"],
      "applied": false
    }
  ]
}
```

---

## V. Frontend Integration (React + Vite + Tailwind)

### Component Architecture

```
src/
├── components/
│   ├── dashboard/
│   │   ├── FulfillmentDisplay.tsx       ← Main dashboard
│   │   ├── LifeAreaCard.tsx             ← Individual area card
│   │   ├── ScoreGauge.tsx               ← Visual score indicator
│   │   └── TrendChart.tsx               ← Historical trends
│   ├── events/
│   │   ├── EventForm.tsx                ← Create/edit events
│   │   ├── EventTimeline.tsx            ← Chronological view
│   │   └── EventCard.tsx                ← Single event display
│   ├── insights/
│   │   ├── InsightsPanel.tsx            ← Pattern recognition display
│   │   ├── PatternCard.tsx              ← Single pattern
│   │   └── InsightIntegrationFlow.tsx   ← Apply insight → commitment
│   ├── commitments/
│   │   ├── CommitmentList.tsx
│   │   ├── CommitmentCard.tsx
│   │   └── CommitmentTracker.tsx
│   └── autobiography/
│       ├── TimelineView.tsx
│       ├── EraCard.tsx
│       └── EntryEditor.tsx
├── hooks/
│   ├── useAuth.ts                       ← JWT + tenant context
│   ├── useDashboard.ts                  ← Real-time dashboard data
│   ├── useLifeAreas.ts                  ← CRUD for life areas
│   ├── useEvents.ts                     ← Event management
│   └── useInsights.ts                   ← Pattern queries
├── lib/
│   ├── api.ts                           ← Axios instance with auth
│   ├── tenantContext.tsx                ← React context for tenant
│   └── queries.ts                       ← React Query hooks
└── pages/
    ├── Dashboard.tsx
    ├── LifeArea.tsx
    ├── Events.tsx
    ├── Insights.tsx
    ├── Autobiography.tsx
    └── Settings.tsx
```

---

### Key Components

#### **FulfillmentDisplay.tsx**
```tsx
import { useLifeAreas } from '@/hooks/useLifeAreas'
import { LifeAreaCard } from './LifeAreaCard'

export function FulfillmentDisplay() {
  const { lifeAreas, isLoading } = useLifeAreas()

  const clusters = groupByCluster(lifeAreas)

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Phoenix Fulfillment Display</h1>

      {Object.entries(clusters).map(([cluster, areas]) => (
        <div key={cluster} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{formatCluster(cluster)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.map(area => (
              <LifeAreaCard key={area.id} area={area} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### **LifeAreaCard.tsx**
```tsx
interface LifeAreaCardProps {
  area: LifeArea
}

export function LifeAreaCard({ area }: LifeAreaCardProps) {
  const statusColors = {
    FLOURISHING: 'bg-green-100 border-green-500',
    THRIVING: 'bg-blue-100 border-blue-500',
    BALANCED: 'bg-gray-100 border-gray-400',
    STRUGGLING: 'bg-yellow-100 border-yellow-500',
    CRISIS: 'bg-red-100 border-red-500'
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${statusColors[area.status]}`}>
      <h3 className="font-semibold">{area.name}</h3>
      <div className="mt-2">
        <ScoreGauge score={area.currentScore} />
      </div>
      <p className="text-sm text-gray-600 mt-2">{area.status}</p>
    </div>
  )
}
```

---

### Hooks

#### **useDashboard.ts**
```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard')
      return data
    },
    refetchInterval: 30000 // Refresh every 30s
  })
}
```

#### **useAuth.ts**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  tenant: Tenant | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      token: null,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        set({
          user: data.user,
          tenant: data.tenants[0], // Select first tenant
          token: data.token
        })
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      },

      logout: () => {
        set({ user: null, tenant: null, token: null })
        delete api.defaults.headers.common['Authorization']
      }
    }),
    { name: 'auth-storage' }
  )
)
```

---

## VI. Tenant Management System

### Provisioning Flow

**1. Registration Request**
```typescript
// /api/src/routes/auth/register.ts
export async function register(req: Request, res: Response) {
  const { email, password, workspaceName } = req.body

  // Step 1: Create user in public schema
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hash(password, 10)
    }
  })

  // Step 2: Generate unique tenant schema name
  const schemaName = `tenant_${nanoid(12)}`

  // Step 3: Create tenant record
  const tenant = await prisma.tenant.create({
    data: {
      name: workspaceName,
      schemaName,
      ownerId: user.id,
      status: 'ACTIVE'
    }
  })

  // Step 4: Create dedicated schema
  await prisma.$executeRawUnsafe(`CREATE SCHEMA "${schemaName}"`)

  // Step 5: Run Prisma migrations on new schema
  await runMigrationsForSchema(schemaName)

  // Step 6: Seed default data
  await seedTenantData(schemaName)

  // Step 7: Create user-tenant relationship
  await prisma.userTenant.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      role: 'OWNER'
    }
  })

  // Step 8: Generate JWT with tenant context
  const token = jwt.sign({
    userId: user.id,
    tenantId: tenant.id,
    tenantSchema: schemaName,
    role: 'OWNER'
  }, process.env.JWT_SECRET, { expiresIn: '7d' })

  res.json({ user, tenant, token })
}
```

---

### Seeding Default Data

```typescript
async function seedTenantData(schemaName: string) {
  const prismaClient = createTenantPrismaClient(schemaName)

  // Seed 30 life areas
  const lifeAreas = [
    { slug: 'work', name: 'Work & Purpose', cluster: 'SYSTEMIC_STRUCTURAL', sortOrder: 1 },
    { slug: 'finance', name: 'Financial Abundance', cluster: 'SYSTEMIC_STRUCTURAL', sortOrder: 2 },
    // ... 28 more
  ]

  await prismaClient.lifeArea.createMany({ data: lifeAreas })
}
```

---

### Tenant-Scoped Prisma Client

```typescript
// /api/src/lib/prisma-tenant.ts
import { PrismaClient } from '@prisma/client'

export function createTenantPrismaClient(schemaName: string) {
  return new PrismaClient({
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?schema=${schemaName}`
      }
    }
  })
}
```

---

### Middleware for Tenant Context

```typescript
// /api/src/middleware/tenantContext.ts
export function tenantContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload

    // Attach tenant context to request
    req.tenant = {
      id: decoded.tenantId,
      schema: decoded.tenantSchema,
      userId: decoded.userId,
      role: decoded.role
    }

    // Create tenant-specific Prisma client
    req.prisma = createTenantPrismaClient(decoded.tenantSchema)

    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

---

## VII. Error Handling & Diagnostics

### Fixing "Right-hand side of 'instanceof' is not an object"

**Root Cause**: This error occurs when:
1. Client-side code tries to use server-side classes (like `Request`)
2. Tenant initialization runs in the wrong context
3. Import boundaries are crossed incorrectly

**Solution**:

#### ❌ WRONG (causes error):
```typescript
// Client component directly calling server function
async function handleRegister() {
  const result = await createTenant(req.user) // ERROR: 'req' doesn't exist client-side
}
```

#### ✅ CORRECT:
```typescript
// Client component calls API route
async function handleRegister() {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, workspaceName })
  })
  const data = await response.json()
}
```

**Server Route**:
```typescript
// /api/src/routes/auth/register.ts
export async function POST(req: Request) {
  // All tenant creation logic happens server-side
  // No instanceof checks on client-passed objects
  const body = await req.json() // Safe: req is real Request object

  // Create tenant entirely on server
  const tenant = await createTenant(body)

  return Response.json({ tenant })
}
```

---

### Diagnostic Logging

```typescript
// /api/src/lib/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'wisdomos-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Add tenant context to all logs
logger.add(new winston.transports.Console({
  format: winston.format.simple()
}))
```

**Usage**:
```typescript
logger.info('Tenant created', {
  tenantId: tenant.id,
  schemaName: tenant.schemaName,
  userId: user.id
})
```

---

## VIII. Future Modules

### Prepared Expansion Stubs

#### **/modules/autobiography**
- Life story timeline (1975-2100)
- Era-based organization
- Cross-reference events to autobiography entries
- Public/private visibility controls

#### **/modules/fulfillment**
- Detailed Phoenix score tracking
- Historical trend analysis
- Predictive analytics (ML model for score forecasting)
- Area interdependency mapping

#### **/modules/patterns**
- AI-assisted insight analysis using OpenAI GPT-4
- Semantic clustering of events
- Automated upset inquiry suggestions
- Commitment generation from insights

#### **/modules/contributions**
- Link real-world actions to dashboard growth
- Track volunteering, teaching, service
- Impact scoring tied to legacy areas

#### **/modules/coach-factory**
- 30 area-specific AI coaches (already implemented!)
- Mode switching (restoration < 30, play ≥ 40)
- Relationship assessment triggers
- Contextual coaching responses

---

## IX. Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Load Balancer (HTTPS)         │
└────────────────┬────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼──────┐       ┌─────▼──────┐
│  Next.js   │       │   API      │
│  Frontend  │       │  (Node.js) │
│  (Vercel)  │       │  (Railway) │
└────────────┘       └─────┬──────┘
                           │
                     ┌─────▼──────────────┐
                     │   PostgreSQL       │
                     │   (Multi-Schema)   │
                     │                    │
                     │  - public (users)  │
                     │  - tenant_abc123   │
                     │  - tenant_xyz789   │
                     │  - ...             │
                     └────────────────────┘
```

---

## X. Implementation Checklist

- [ ] Set up PostgreSQL with schema-per-tenant support
- [ ] Configure Prisma for dynamic schema connections
- [ ] Implement auth routes (`/register`, `/login`)
- [ ] Create tenant provisioning system
- [ ] Seed 30 life areas on tenant creation
- [ ] Build dashboard API endpoints
- [ ] Create React components (FulfillmentDisplay, LifeAreaCard)
- [ ] Implement event creation flow
- [ ] Add pattern recognition job (cron)
- [ ] Create snapshot job (daily/weekly)
- [ ] Deploy API to Railway/Render
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Configure environment variables
- [ ] Test multi-tenant isolation
- [ ] Add monitoring (Sentry, LogRocket)
- [ ] Document API with OpenAPI spec

---

**End of Integration Blueprint**

This document transforms the WISDOM 2025 Workbook into a production-ready, multi-tenant SaaS application with true schema isolation, intelligent scoring, pattern recognition, and a transformational UX.
