# 🚀 Production Deployment Checklist - Fulfillment Display v5
## Ready-to-Execute Steps

**Date Prepared:** 2025-10-30
**Target Environment:** Production (Vercel + Production Database)
**Prerequisites:** Database connection, production environment access

---

## ✅ Pre-Deployment Verification

### Code Review
- [x] All code committed to git
- [x] All changes pushed to GitHub
- [x] Vercel auto-deployment triggered
- [x] No uncommitted changes in working directory
- [x] Documentation complete

**Latest Commits:**
```
0b522f6 - fix: Update Prisma import paths in FD-v5 API routes
8b022f0 - feat: Add Settings Pages and FD-v5 Enhancements
fe972b6 - feat: Implement Fulfillment Display v5 three-tier architecture
```

---

## 🗄️ Step 1: Apply Prisma Migrations

### Command
```bash
cd /Volumes/DevOPS\ 2025/01_DEVOPS_PLATFORM/wisdomOS\ 2026/apps/web
npx prisma migrate deploy
```

### What This Does
- Applies pending database migrations to production
- Creates `subdomains` table
- Creates `dimensions` table
- Adds `DimensionName` enum
- Updates `life_areas` table with subdomain relation
- Creates all necessary indexes

### Expected Output
```
Environment variables loaded from .env.production
Prisma schema loaded from prisma/schema.prisma

1 migration found in prisma/migrations

Applying migration `20251030_add_v5_fulfillment_display`

The following migration(s) have been applied:

migrations/
  └─ 20251030_add_v5_fulfillment_display/
      └─ migration.sql

Your database is now in sync with your schema.
```

### Verification Steps
1. Check migration was applied:
   ```bash
   npx prisma migrate status
   ```

2. Verify tables exist:
   ```bash
   npx prisma studio
   # Check for: subdomains, dimensions tables
   ```

3. Test schema generation:
   ```bash
   npx prisma generate
   ```

### Rollback (If Needed)
```bash
# Manually revert migration
npx prisma migrate resolve --rolled-back 20251030_add_v5_fulfillment_display
```

### Troubleshooting
| Issue | Solution |
|-------|----------|
| Migration already applied | Safe to ignore, proceed to next step |
| Connection error | Check DATABASE_URL environment variable |
| Permission denied | Verify database user has CREATE TABLE privileges |
| Timeout | Increase connection timeout in .env |

---

## 🌱 Step 2: Seed Database with Demo Data

### Command
```bash
cd /Volumes/DevOPS\ 2025/01_DEVOPS_PLATFORM/wisdomOS\ 2026/apps/web
npx ts-node prisma/seed-v5-data.ts
```

### What This Does
- Creates demo tenant: `demo-workspace`
- Creates demo user: `demo@wisdomos.com`
- Creates 1 sample life area: Work & Purpose
- Creates 3 subdomains per area
- Creates 5 dimensions per subdomain (15 total)
- Populates with sample metrics
- Creates sample events and audit records

### Expected Output
```
🌱 Starting v5 seed data...
✅ Created tenant: demo-workspace (id: xxx)
✅ Created user: demo@wisdomos.com (id: xxx)
✅ Created life area: Work & Purpose (id: xxx)
✅ Created 3 subdomains
✅ Created 15 dimensions
✅ Created sample events
✅ Seed data completed successfully!
```

### Verification Steps
1. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Verify data:
   - Check `tenants` table has demo-workspace
   - Check `users` table has demo@wisdomos.com
   - Check `life_areas` table has Work & Purpose
   - Check `subdomains` table has 3 entries
   - Check `dimensions` table has 15 entries

3. Test API endpoint:
   ```bash
   curl http://localhost:3011/api/fulfillment-v5
   # Should return life area with nested data
   ```

### Optional: Seed All 10 Life Areas
```bash
# Modify seed script to use COMPLETE_LIFE_AREAS from fulfillment-v5-complete.ts
# Then run:
npx ts-node prisma/seed-v5-data.ts --all
```

### Troubleshooting
| Issue | Solution |
|-------|----------|
| Duplicate key error | Data already seeded, safe to skip |
| Foreign key violation | Ensure migrations applied first |
| Tenant not found | Check tenant creation in seed script |
| Permission error | Verify database user has INSERT privileges |

---

## 🔐 Step 3: Integrate Authentication

### Current State
All API endpoints use placeholder IDs:
```typescript
const userId = 'demo-user-001' // TODO: Get from session
const tenantId = 'demo-tenant-001' // TODO: Get from JWT
```

### Files to Update

#### 1. `/app/api/fulfillment-v5/route.ts`
**Before:**
```typescript
const userId = 'demo-user-001'
const tenantId = 'demo-tenant-001'
```

**After:**
```typescript
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const tenantId = session.user.tenantId

  // ... rest of the code
}
```

#### 2. `/app/api/fulfillment-v5/[areaId]/route.ts`
Same pattern as above - replace placeholders with session data.

#### 3. `/app/api/fulfillment-v5/dimensions/[dimensionId]/route.ts`
Same pattern as above - replace placeholders with session data.

#### 4. `/app/api/fulfillment-v5/analytics/route.ts`
Same pattern as above - replace placeholders with session data.

### Authentication Setup (If Not Already Configured)

#### Check Existing Auth
```bash
# Look for existing auth configuration
cat apps/web/lib/auth-options.ts
# or
cat apps/web/app/api/auth/[...nextauth]/route.ts
```

#### If Using NextAuth
```typescript
// lib/auth-options.ts
import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    // Your providers
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.tenantId = user.tenantId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.tenantId = token.tenantId
      }
      return session
    }
  }
}
```

### Verification Steps
1. **Test unauthorized access:**
   ```bash
   curl http://localhost:3011/api/fulfillment-v5
   # Should return: {"error": "Unauthorized"}
   ```

2. **Test with valid session:**
   - Login via UI
   - Navigate to /fulfillment
   - Open DevTools Network tab
   - Should see successful API call with data

3. **Test multi-tenancy:**
   - Login as user from tenant A
   - Verify only tenant A's data returned
   - Login as user from tenant B
   - Verify only tenant B's data returned

### Security Checklist
- [ ] All placeholder IDs removed
- [ ] Session validation on all endpoints
- [ ] 401 Unauthorized for missing session
- [ ] Multi-tenancy filtering working
- [ ] No data leakage between tenants
- [ ] CORS configured correctly
- [ ] Rate limiting implemented (optional but recommended)

---

## 🧪 Step 4: Test All API Endpoints

### Test Suite

#### Test 1: GET /api/fulfillment-v5
**Purpose:** Fetch all life areas with nested data

**Request:**
```bash
curl -X GET http://localhost:3011/api/fulfillment-v5 \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "lifeAreas": [
    {
      "id": "xxx",
      "name": "Work & Purpose",
      "phoenixName": "Phoenix of Achievement",
      "status": "YELLOW",
      "score": 65,
      "subdomains": [
        {
          "id": "xxx",
          "name": "Creative Work",
          "dimensions": [
            {
              "id": "xxx",
              "name": "BEING",
              "focus": "Inspired state",
              "metric": 3,
              // ...
            }
            // ... 4 more dimensions
          ]
        }
        // ... 2 more subdomains
      ]
    }
  ]
}
```

**Success Criteria:**
- [ ] 200 OK status
- [ ] lifeAreas array returned
- [ ] Nested structure intact (areas → subdomains → dimensions)
- [ ] All fields populated
- [ ] Response time < 500ms

---

#### Test 2: GET /api/fulfillment-v5/[areaId]
**Purpose:** Fetch single life area

**Request:**
```bash
AREA_ID="your-life-area-id"
curl -X GET http://localhost:3011/api/fulfillment-v5/$AREA_ID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "lifeArea": {
    "id": "xxx",
    "name": "Work & Purpose",
    "subdomains": [...]
  }
}
```

**Success Criteria:**
- [ ] 200 OK status for valid ID
- [ ] 404 Not Found for invalid ID
- [ ] Single life area returned
- [ ] All nested data included
- [ ] Response time < 300ms

---

#### Test 3: PATCH /api/fulfillment-v5/dimensions/[dimensionId]
**Purpose:** Update dimension metric and notes

**Request:**
```bash
DIMENSION_ID="your-dimension-id"
curl -X PATCH http://localhost:3011/api/fulfillment-v5/dimensions/$DIMENSION_ID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "metric": 4,
    "notes": "Improved this week"
  }'
```

**Expected Response:**
```json
{
  "dimension": {
    "id": "xxx",
    "name": "BEING",
    "metric": 4,
    "notes": "Improved this week",
    "updatedAt": "2025-10-30T..."
  }
}
```

**Success Criteria:**
- [ ] 200 OK status for valid update
- [ ] 400 Bad Request for metric < 1 or > 5
- [ ] 404 Not Found for invalid dimension ID
- [ ] Updated dimension returned
- [ ] updatedAt timestamp updated
- [ ] Response time < 200ms

**Edge Cases to Test:**
```bash
# Test invalid metric (should fail with 400)
curl -X PATCH .../dimensions/$DIMENSION_ID \
  -d '{"metric": 6}'

# Test null metric (should succeed - clearing metric)
curl -X PATCH .../dimensions/$DIMENSION_ID \
  -d '{"metric": null}'

# Test notes only (should succeed)
curl -X PATCH .../dimensions/$DIMENSION_ID \
  -d '{"notes": "Just updating notes"}'
```

---

#### Test 4: GET /api/fulfillment-v5/analytics
**Purpose:** Fetch aggregated analytics

**Request:**
```bash
curl -X GET http://localhost:3011/api/fulfillment-v5/analytics \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "overview": {
    "totalLifeAreas": 1,
    "averageScore": 3.2,
    "thrivingCount": 0,
    "needsAttentionCount": 1,
    "breakdownCount": 0
  },
  "dimensionAverages": {
    "being": 3.0,
    "doing": 3.67,
    "having": 3.0,
    "relating": 3.67,
    "becoming": 4.0
  },
  "topDimensions": [
    {
      "lifeAreaName": "Work & Purpose",
      "subdomainName": "Creative Work",
      "dimensionName": "BECOMING",
      "metric": 5,
      "focus": "Growth mindset"
    }
    // ... 4 more
  ],
  "bottomDimensions": [...],
  "lifeAreaBreakdown": [...]
}
```

**Success Criteria:**
- [ ] 200 OK status
- [ ] All analytics sections present
- [ ] Calculations correct (manually verify a few)
- [ ] topDimensions sorted by metric (descending)
- [ ] bottomDimensions sorted by metric (ascending)
- [ ] Response time < 500ms

---

### Automated Test Script

Create `test-api.sh`:
```bash
#!/bin/bash

BASE_URL="http://localhost:3011"
SESSION_TOKEN="your-session-token"

echo "🧪 Testing Fulfillment v5 API..."

# Test 1: Get all
echo "\n1️⃣ GET /api/fulfillment-v5"
curl -s -X GET $BASE_URL/api/fulfillment-v5 \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" | jq

# Test 2: Get analytics
echo "\n2️⃣ GET /api/fulfillment-v5/analytics"
curl -s -X GET $BASE_URL/api/fulfillment-v5/analytics \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" | jq

# Test 3: Update dimension (will need real ID)
# echo "\n3️⃣ PATCH /api/fulfillment-v5/dimensions/[id]"
# curl -s -X PATCH $BASE_URL/api/fulfillment-v5/dimensions/xxx \
#   -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
#   -H "Content-Type: application/json" \
#   -d '{"metric": 4}' | jq

echo "\n✅ Tests complete"
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 👥 Step 5: User Acceptance Testing

### Test Scenarios

#### Scenario 1: View Fulfillment Display
**Steps:**
1. Navigate to `/fulfillment`
2. Wait for data to load
3. Verify loading spinner appears briefly
4. Verify life areas display

**Expected:**
- ✅ Life areas render with Phoenix names
- ✅ Status badges show correct colors
- ✅ Scores display correctly
- ✅ No JavaScript errors in console

---

#### Scenario 2: Expand Three-Tier Structure
**Steps:**
1. Click on a life area header
2. Observe subdomain cards appear
3. Click on a subdomain header
4. Observe dimension table appears

**Expected:**
- ✅ Smooth animation on expand
- ✅ Chevron icon rotates
- ✅ Subdomains appear (Creative, Operational, Strategic)
- ✅ Dimensions table shows 5 rows (Being, Doing, Having, Relating, Becoming)
- ✅ Metrics display with color coding

---

#### Scenario 3: Edit Dimension Metric
**Steps:**
1. Expand to dimension table
2. Click "Edit" on any dimension
3. Change metric value (1-5)
4. Click "Save"

**Expected:**
- ✅ Edit mode activates
- ✅ Metric input accepts 1-5 only
- ✅ Save button enabled
- ✅ API call successful (check Network tab)
- ✅ UI updates with new value
- ✅ Color coding updates if threshold crossed

---

#### Scenario 4: View Analytics Dashboard
**Steps:**
1. Navigate to `/fulfillment-v5-analytics`
2. Wait for data to load
3. Scroll through all sections

**Expected:**
- ✅ Overview cards display correct totals
- ✅ Life area grid renders all areas
- ✅ Heatmap displays with color coding
- ✅ Bar chart shows dimension averages
- ✅ Line chart shows trends
- ✅ Top/bottom performers lists populated

---

#### Scenario 5: Export Data
**Steps:**
1. On analytics dashboard, click "Export as JSON"
2. Verify file downloads
3. Click "Export as CSV"
4. Verify file downloads
5. Open both files

**Expected:**
- ✅ JSON file downloads with date stamp
- ✅ JSON structure preserved
- ✅ CSV file downloads with date stamp
- ✅ CSV opens in Excel/Sheets
- ✅ All data present in both formats

---

#### Scenario 6: Error Handling
**Steps:**
1. Disconnect from internet (or block API in DevTools)
2. Navigate to `/fulfillment`
3. Observe error state
4. Click "Retry" button
5. Reconnect internet

**Expected:**
- ✅ Error message displays clearly
- ✅ Retry button works
- ✅ Data loads on retry
- ✅ No JavaScript crashes

---

### UAT Checklist

**Functionality:**
- [ ] All pages load without errors
- [ ] Data fetches successfully
- [ ] Three-tier expansion works smoothly
- [ ] Metric editing saves correctly
- [ ] Analytics calculate accurately
- [ ] Export functions work (JSON & CSV)

**Performance:**
- [ ] Initial page load < 2 seconds
- [ ] API calls < 500ms
- [ ] Animations smooth (60fps)
- [ ] No lag when expanding/collapsing
- [ ] Dashboard renders < 1 second

**UI/UX:**
- [ ] Responsive design works on desktop
- [ ] Colors match Phoenix theme
- [ ] Icons display correctly
- [ ] Hover states work
- [ ] Loading states clear
- [ ] Error messages helpful

**Data Integrity:**
- [ ] Correct data for logged-in user
- [ ] Multi-tenancy isolation working
- [ ] No data leakage
- [ ] Metrics save correctly
- [ ] Analytics calculations correct

**Browser Compatibility:**
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

---

## 🚨 Troubleshooting Guide

### Issue: Migration Fails

**Symptoms:**
```
Error: Migration failed to apply
```

**Solutions:**
1. Check database connection:
   ```bash
   psql $DATABASE_URL
   ```

2. Verify database user permissions:
   ```sql
   SHOW GRANTS FOR CURRENT_USER;
   ```

3. Check for conflicting migrations:
   ```bash
   npx prisma migrate status
   ```

4. Manually rollback if needed:
   ```sql
   DELETE FROM _prisma_migrations WHERE migration_name = '20251030_add_v5_fulfillment_display';
   ```

---

### Issue: Seed Script Fails

**Symptoms:**
```
Error: Foreign key violation
```

**Solutions:**
1. Ensure migrations applied first:
   ```bash
   npx prisma migrate status
   ```

2. Check if data already exists:
   ```bash
   npx prisma studio
   # Check life_areas table
   ```

3. Clear existing data (CAUTION):
   ```sql
   TRUNCATE TABLE dimensions CASCADE;
   TRUNCATE TABLE subdomains CASCADE;
   ```

---

### Issue: API Returns Empty Data

**Symptoms:**
```json
{"lifeAreas": []}
```

**Solutions:**
1. Verify seed script ran:
   ```bash
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM life_areas;"
   ```

2. Check user/tenant IDs match:
   ```sql
   SELECT id, tenantId FROM users WHERE email = 'demo@wisdomos.com';
   SELECT id, userId FROM life_areas;
   ```

3. Check authentication is working:
   - Verify session token valid
   - Check userId/tenantId extracted correctly

---

### Issue: Analytics Show Wrong Numbers

**Symptoms:**
Calculations don't match expected values

**Solutions:**
1. Manually calculate and compare:
   ```sql
   SELECT AVG(metric) FROM dimensions WHERE metric IS NOT NULL;
   ```

2. Check for null metrics:
   ```sql
   SELECT COUNT(*) FROM dimensions WHERE metric IS NULL;
   ```

3. Verify aggregation logic in analytics endpoint

---

## 📋 Post-Deployment Verification

### Final Checklist

**Database:**
- [ ] Migrations applied successfully
- [ ] All tables created
- [ ] Indexes created
- [ ] Sample data seeded

**Authentication:**
- [ ] Placeholder IDs removed
- [ ] Session validation working
- [ ] Multi-tenancy enforced
- [ ] 401 errors for unauthorized

**API Endpoints:**
- [ ] GET /api/fulfillment-v5 working
- [ ] GET /api/fulfillment-v5/[areaId] working
- [ ] PATCH /api/fulfillment-v5/dimensions/[id] working
- [ ] GET /api/fulfillment-v5/analytics working

**Frontend:**
- [ ] /fulfillment page loads
- [ ] Data displays correctly
- [ ] Expansion works
- [ ] Metric editing works
- [ ] /fulfillment-v5-analytics loads
- [ ] All charts render
- [ ] Export works

**Performance:**
- [ ] Page loads < 2s
- [ ] API responses < 500ms
- [ ] No console errors
- [ ] Smooth animations

**Security:**
- [ ] Multi-tenancy isolated
- [ ] No data leakage
- [ ] Input validation working
- [ ] Error messages don't leak data

---

## 🎉 Success Criteria

**All systems operational when:**
- ✅ Database migrations applied without errors
- ✅ Seed data populated successfully
- ✅ All 4 API endpoints return correct data
- ✅ Authentication integrated and working
- ✅ Both frontend pages load and function correctly
- ✅ All UAT scenarios pass
- ✅ No critical errors in logs
- ✅ Performance metrics met

**You're ready for production! 🚀**

---

**Document Version:** 1.0
**Last Updated:** 2025-10-30T03:45:00-04:00
**Prepared by:** Claude Code (Sonnet 4.5)
**Session ID:** wisdomos-session-2025-10-30-v5-integration
