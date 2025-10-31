# Quick Start: Database Setup for Pattern Data

## Step 1: Run Database Migration

```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/web"

# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_pattern_data_and_recommendations

# Verify migration was successful
npx prisma migrate status
```

## Step 2: Test the Implementation

### Test Unauthenticated Access (Should Work Immediately)
```bash
# Patterns endpoint - should return mock data
curl http://localhost:3000/api/insights/patterns

# Recommendations endpoint - should return rule-based recommendations
curl http://localhost:3000/api/insights/recommendations
```

### Verify Database Tables
```bash
# Open Prisma Studio to inspect new tables
npx prisma studio

# Look for:
# - pattern_data table
# - user_recommendations table
```

## Step 3: Wire Up Authentication

### Option A: If Using NextAuth

1. Create auth configuration file (if not exists):
```typescript
// lib/auth-options.ts
import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  // Your NextAuth configuration
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

2. Update API routes to use NextAuth:
```typescript
// app/api/insights/patterns/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    // Return mock data
    const data = generateMockPatternData()
    return NextResponse.json(data)
  }

  const userId = session.user.id
  const tenantId = session.user.tenantId

  // Fetch real data
  const data = await getUserPatternData(userId, tenantId)
  return NextResponse.json(data)
}
```

### Option B: If Using Custom JWT Auth (Current Implementation)

The routes already support this! Just ensure:

1. Your frontend sends Authorization header:
```typescript
fetch('/api/insights/patterns', {
  headers: {
    'Authorization': `Bearer ${yourJwtToken}`
  }
})
```

2. Your JWT token contains:
```json
{
  "userId": "user-id",
  "email": "user@example.com",
  "tenantId": "tenant-id",
  "role": "member"
}
```

## Step 4: Test with Real Data

### Insert Sample Pattern Data
```typescript
// Create a test script: scripts/seed-pattern-data.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPatternData() {
  const userId = 'your-test-user-id'
  const tenantId = 'your-test-tenant-id'

  // Create 7 days of pattern data
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date
  })

  for (const date of dates) {
    await prisma.patternData.create({
      data: {
        userId,
        tenantId,
        date,
        energy: Math.floor(Math.random() * 30) + 70, // 70-100
        focus: Math.floor(Math.random() * 30) + 70,
        fulfillment: Math.floor(Math.random() * 30) + 70
      }
    })
  }

  console.log('Seeded 7 days of pattern data')
}

seedPatternData()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
  })
```

Run it:
```bash
npx tsx scripts/seed-pattern-data.ts
```

### Verify Real Data is Returned
```bash
# With authentication token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/insights/patterns
```

## Step 5: Monitor Caching

### Check Recommendation Cache
```bash
# First request - should generate new recommendations
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/insights/recommendations

# Second request (within 1 hour) - should return cached
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/insights/recommendations
```

Look for `"cached": true` in the response.

## Troubleshooting

### Migration Fails
```bash
# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Or fix manually
npx prisma db push --force-reset
```

### "Cannot find module '@prisma/client'"
```bash
# Regenerate Prisma client
npx prisma generate
```

### Authentication Not Working
1. Check console logs in API routes
2. Verify JWT token format
3. Test with mock data first (no auth header)
4. Check `getUserFromRequest()` in lib/auth.ts

### Data Not Persisting
1. Check database connection in .env
2. Verify tenant isolation is working
3. Check Prisma Studio to see if data exists
4. Look at API route console logs

## Environment Variables

Ensure these are set in `.env`:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wisdomos"

# Auth (for JWT)
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Optional: OpenAI for AI recommendations
OPENAI_API_KEY="sk-..."
```

## Next Steps

1. Run migration
2. Test with mock data (no auth)
3. Wire up authentication
4. Test with real user data
5. Monitor performance and caching
6. Deploy to staging environment

## Support

For issues:
- Check detailed report: `DATABASE_PERSISTENCE_IMPLEMENTATION_REPORT.md`
- Review Prisma schema: `prisma/schema.prisma`
- Check API routes: `app/api/insights/patterns/route.ts` and `app/api/insights/recommendations/route.ts`
