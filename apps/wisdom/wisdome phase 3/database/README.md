# WisdomOS Database Architecture

## Overview
Production-ready PostgreSQL schema for relationship management, aligned with the Fulfillment Display and Assessment Tools from Landmark's Wisdom Course.

## Features
- **Normalized contact storage** - Each person stored once, linked to multiple life areas
- **13 Life Areas** - From your Fulfillment Display (Work, Health, Finance, Intimacy, etc.)
- **Interaction tracking** - Log calls, emails, meetings with AI sentiment analysis
- **Landmark-style assessments** - Weekly relationship ratings (trust, communication, reliability, alignment)
- **HubSpot integration** - Automatic CRM sync for contacts and interactions
- **Revision tracking** - Full history for autobiography entries

## Quick Start

### 1. Setup PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Docker
docker run --name wisdomos-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials and HubSpot token
```

### 3. Run Migration
```bash
cd database
./run-migration.sh
```

## Database Schema

### Core Tables

#### `contacts`
- Stores all people in your life
- Supports HubSpot/Salesforce IDs for CRM sync
- Email uniqueness enforced (deferred for batch imports)

#### `life_areas`
13 pre-seeded areas from your Fulfillment Display:
1. Work & Purpose
2. Health
3. Finance
4. Intimacy & Love
5. Time & Energy Management
6. Spiritual Alignment
7. Creativity & Expression
8. Friendship & Community
9. Learning & Growth
10. Home & Environment
11. Sexuality
12. Emotional Regulation & Inner Child
13. Legacy & Archives

#### `contact_life_area_links`
- Many-to-many relationship between contacts and life areas
- Tracks role, frequency, weight, expected outcomes
- Example: Djamel → Intimacy (partner, daily, 0.9 weight)

#### `interactions`
- Logs all communication (calls, texts, emails, meetings)
- AI-ready fields: sentiment, topics, entities, embeddings
- Syncs to HubSpot as engagements

#### `relationship_assessments`
- Landmark-style weekly ratings (1-5 scale)
- Four dimensions: trust, communication, reliability, alignment
- Auto-calculates overall score if not provided

## API Endpoints

### Contact Management
```typescript
POST /contacts/upsert       // Create or update contact
GET  /contacts              // List all contacts
GET  /contacts/:id          // Get single contact
GET  /contacts/:id/health   // Get relationship health dashboard
```

### Interaction Logging
```typescript
POST /interactions/log      // Log call/email/meeting
GET  /contacts/:id/interactions  // Get contact's interactions
```

### Assessments
```typescript
POST /assessments/create    // Create weekly assessment
GET  /assessments/latest    // Get latest assessment
```

### HubSpot Sync
```typescript
POST /integrations/hubspot/sync-contact      // Sync contact to HubSpot
POST /integrations/hubspot/sync-interaction  // Sync interaction as engagement
GET  /integrations/hubspot/test             // Test HubSpot connection
```

## HubSpot Integration

### Setup
1. Get your HubSpot Private App token from: https://app.hubspot.com/private-apps
2. Add to `.env`: `HUBSPOT_ACCESS_TOKEN=pat-na1-...`
3. Test connection: `GET /integrations/hubspot/test`

### Mapping
- **Contacts** → HubSpot Contacts (email, phone, name)
- **Interactions** → HubSpot Engagements (notes, calls, emails, meetings)
- **Life Areas** → Custom properties or associations

### Sync Flow
1. On contact create → Search HubSpot by email
2. If found → Update and store `hubspot_id`
3. If not found → Create new and store `hubspot_id`
4. On interaction → Create engagement linked to contact

## Prisma Usage

### Generate Client
```bash
npx prisma generate
```

### Query Examples
```typescript
// Get contact with all life areas
const contact = await prisma.contacts.findUnique({
  where: { id: contactId },
  include: {
    links: {
      include: { life_area: true }
    },
    assessments: {
      orderBy: { assessed_on: 'desc' },
      take: 1
    }
  }
});

// Log interaction
const interaction = await prisma.interactions.create({
  data: {
    contact_id: contactId,
    life_area_id: 4, // Intimacy
    channel: 'whatsapp',
    subject: 'Evening check-in',
    body_text: 'How was your day?',
    sentiment: 'positive',
    sentiment_score: 0.7
  }
});

// Create assessment
const assessment = await prisma.relationship_assessments.create({
  data: {
    contact_id: contactId,
    life_area_id: 4,
    trust_score: 4.5,
    communication: 4.0,
    reliability: 4.0,
    alignment: 4.8,
    notes: 'Growing stronger together'
  }
});
```

## Testing

Use the included `test-api.http` file with VS Code REST Client or similar:

```http
### Create Contact
POST http://localhost:4000/contacts/upsert
Content-Type: application/json

{
  "first_name": "Test",
  "last_name": "User",
  "email": "test@example.com"
}
```

## Migration History

### v1.0.0 - Initial Schema
- Core tables: contacts, life_areas, links
- Interaction tracking with AI fields
- Relationship assessments
- HubSpot integration support

## Troubleshooting

### Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c '\l'

# Check connection string
echo $DATABASE_URL

# Test with psql directly
psql postgresql://user:pass@localhost:5432/wisdomos
```

### Migration Errors
```bash
# Drop and recreate database
dropdb wisdomos
createdb wisdomos
./run-migration.sh
```

### HubSpot Sync Issues
- Verify token has correct scopes: contacts, engagements
- Check portal ID matches your account
- Use test endpoint to verify connection

## Future Enhancements
- [ ] pgvector for semantic search on interactions
- [ ] Row-level security for multi-user support
- [ ] Materialized views for performance
- [ ] GraphQL API layer
- [ ] Real-time sync with webhooks