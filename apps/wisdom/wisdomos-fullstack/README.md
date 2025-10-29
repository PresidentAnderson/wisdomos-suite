# WisdomOS Full-Stack

A comprehensive personal growth and wisdom tracking system with four integrated displays:
- **Identity Layer** (Contribution Display)
- **Timeline Layer** (Autobiography)
- **Commitments Map** (Fulfillment Display)
- **Analytics Layer** (Assessment Tool)

## Architecture

- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL with sophisticated contact management
- **Frontend**: React + Vite + TypeScript + Tailwind CSS (coming next)
- **Auth**: JWT-based authentication

## Quick Start

### 1. Setup Environment

```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your settings (default should work for local dev)
```

### 2. Start Database

```bash
# Start PostgreSQL with Docker
npm run db:up

# Or use your own PostgreSQL instance and update DATABASE_URL in .env
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd apps/server
npm install
```

### 4. Setup Database Schema

```bash
# From apps/server directory
npm run prisma:generate  # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed with demo data
```

### 5. Start Development Server

```bash
# From apps/server directory
npm run dev

# API will be available at http://localhost:4000
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login/register with email
- `GET /api/auth/me` - Get current user

### Core APIs (all require Bearer token)
- `/api/contributions` - Identity/contribution tracking
- `/api/autobiography` - Year-by-year life entries
- `/api/fulfillment` - Life areas and commitments
- `/api/assessments` - Relationship assessments
- `/api/contacts` - Contact management
- `/api/boundary-audits` - Boundary incident tracking
- `/api/interactions` - Communication logging

## Database Schema Features

### Enhanced Contact Management
- Contacts linked to multiple life areas without duplication
- Relationship roles and frequencies
- HubSpot/Salesforce ID tracking for CRM sync

### Life Areas (13 from Fulfillment Display)
1. Work & Purpose
2. Health
3. Finance
4. Intimacy & Love
5. Time & Energy
6. Spiritual Alignment
7. Creativity & Expression
8. Friendship & Community
9. Learning & Growth
10. Home & Environment
11. Sexuality
12. Emotional Regulation
13. Legacy & Archives

### Assessment Tracking
- Landmark-style relationship scoring (1-5 scale)
- Trust, Communication, Reliability, Openness, Growth, Reciprocity, Alignment
- Automatic overall score calculation
- Historical tracking for trend analysis

### Interaction Logging
- Multi-channel support (call, SMS, email, WhatsApp, etc.)
- AI-ready fields for sentiment analysis
- Topic extraction and entity recognition support

## Demo Credentials

After seeding:
- Email: `demo@wisdomos.app`
- This creates a demo user with sample data

## Testing the API

```bash
# 1. Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@wisdomos.app"}'

# Save the token from response

# 2. Get contributions
curl http://localhost:4000/api/contributions \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Create a new contribution
curl -X POST http://localhost:4000/api/contributions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "strength",
    "title": "Systems Thinking",
    "content": "Seeing the bigger picture",
    "tags": ["insight", "strategy"]
  }'
```

## Next Steps

1. **Frontend**: React app with integrated displays (coming next)
2. **Real Auth**: Replace demo auth with Auth0/Clerk
3. **CRM Sync**: HubSpot integration for contact sync
4. **AI Features**: Sentiment analysis for interactions
5. **Deployment**: Railway/Render for API, Supabase for DB

## Development

```bash
# Watch mode for server
cd apps/server
npm run dev

# Run Prisma Studio to view/edit data
npx prisma studio

# Generate Prisma types after schema changes
npm run prisma:generate

# Create migration for production
npx prisma migrate dev --name migration_name
```

## License

Private - All rights reserved