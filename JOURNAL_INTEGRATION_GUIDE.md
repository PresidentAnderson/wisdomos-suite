# Journal Integration Guide

## Overview

This guide explains how to integrate the journal entry system with autobiography chapter linking, life area scoring, and Global Fulfillment Score (GFS) calculation.

---

## Architecture

### Components

1. **API Routes**
   - `/api/journal/create` - Create journal entry with area scoring
   - `/api/journal/list` - List journal entries with filtering

2. **Database Models**
   - `Journal` - Stores journal entries
   - `LifeArea` - Stores life areas with scores
   - `User` - Links to journals and life areas

3. **Features**
   - AI-powered upset detection
   - AI reframing (OpenAI integration)
   - Life area score updates
   - Global Fulfillment Score calculation
   - Autobiography chapter linking (optional)

---

## API Usage

### Create Journal Entry

**Endpoint**: `POST /api/journal/create`

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "content": "Today was challenging but I learned...",
  "title": "Reflection on Growth", // Optional
  "lifeAreaIds": ["area_id_1", "area_id_2"],
  "tags": ["growth", "challenge"],
  "mood": "reflective", // Optional
  "autobiographyYear": 2024, // Optional
  "type": "journal" // journal | voice | reflection
}
```

**Response**:
```json
{
  "entry_id": "journal_123",
  "title": "Reflection on Growth",
  "content": "Today was challenging but I learned...",
  "upsetDetected": false,
  "aiReframe": null,
  "linked_chapter": {
    "id": "chapter_2024",
    "title": "Chapter 2024",
    "era_start": "2024",
    "era_end": "2025"
  },
  "updated_areas": [
    {
      "id": "area_123",
      "code": "career",
      "name": "Career",
      "score": 4.2,
      "previousScore": 3.8
    }
  ],
  "gfs": 4.1,
  "createdAt": "2025-10-29T...",
  "message": "Journal entry created successfully"
}
```

### List Journal Entries

**Endpoint**: `GET /api/journal/list`

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Query Parameters**:
- `lifeAreaId` - Filter by life area
- `upsetOnly=true` - Only entries with upset detected
- `limit=50` - Number of entries to return
- `offset=0` - Pagination offset
- `sortBy=createdAt` - Sort field
- `sortOrder=desc` - Sort order (asc/desc)

**Response**:
```json
{
  "entries": [
    {
      "id": "journal_123",
      "content": "...",
      "tags": ["growth"],
      "upsetDetected": false,
      "aiReframe": null,
      "lifeArea": {
        "id": "area_123",
        "name": "Career",
        "phoenixName": "Sacred Fire",
        "status": "GREEN",
        "score": 85
      },
      "createdAt": "2025-10-29T...",
      "updatedAt": "2025-10-29T..."
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Frontend Integration

### Using the API in React

```typescript
import { useState } from 'react'

export function useJournal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createEntry(data: {
    content: string
    lifeAreaIds: string[]
    tags?: string[]
    mood?: string
    autobiographyYear?: number
  }) {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('wisdomos_auth_token')
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/api/journal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create entry')
      }

      return await response.json()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function listEntries(params?: {
    lifeAreaId?: string
    upsetOnly?: boolean
    limit?: number
    offset?: number
  }) {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('wisdomos_auth_token')
      if (!token) throw new Error('Not authenticated')

      const queryParams = new URLSearchParams()
      if (params?.lifeAreaId) queryParams.set('lifeAreaId', params.lifeAreaId)
      if (params?.upsetOnly) queryParams.set('upsetOnly', 'true')
      if (params?.limit) queryParams.set('limit', params.limit.toString())
      if (params?.offset) queryParams.set('offset', params.offset.toString())

      const response = await fetch(`/api/journal/list?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to list entries')
      }

      return await response.json()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createEntry, listEntries, loading, error }
}
```

### Example Component

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useJournal } from '@/hooks/useJournal'

export default function JournalEntryForm() {
  const [content, setContent] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const { createEntry, loading, error } = useJournal()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const data = await createEntry({
        content,
        lifeAreaIds: selectedAreas,
        tags: [],
        autobiographyYear: new Date().getFullYear()
      })

      setResult(data)
      setContent('')
    } catch (err) {
      console.error('Failed to create entry:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reflection..."
        rows={8}
        className="w-full p-4 border rounded-lg"
        required
      />

      {/* Area selection UI */}
      {/* ... */}

      <button
        type="submit"
        disabled={loading || selectedAreas.length === 0}
        className="px-6 py-2 bg-phoenix-orange text-white rounded-lg"
      >
        {loading ? 'Saving...' : 'Save Entry'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Entry Saved ✓</h3>

          {result.linked_chapter && (
            <p className="mb-2">
              Linked to: <strong>{result.linked_chapter.title}</strong>
            </p>
          )}

          {result.upsetDetected && result.aiReframe && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">AI Reframe Suggestion:</h4>
              <p className="text-sm">{result.aiReframe}</p>
            </div>
          )}

          <div className="mt-4">
            <h4 className="font-medium mb-2">Updated Areas:</h4>
            <ul className="space-y-1">
              {result.updated_areas.map((area: any) => (
                <li key={area.id} className="text-sm">
                  {area.name}: {area.previousScore.toFixed(2)} → <strong>{area.score.toFixed(2)}</strong>
                </li>
              ))}
            </ul>
          </div>

          {result.gfs !== null && (
            <p className="mt-4 text-lg font-semibold">
              Global Fulfillment Score: <span className="text-phoenix-orange">{result.gfs}</span>
            </p>
          )}
        </div>
      )}
    </form>
  )
}
```

---

## Life Area Scoring Algorithm

### Score Calculation

Scores are calculated on a 0-100 scale and influenced by:

1. **Consistency Bonus** (+0 to +20 points)
   - Based on number of journal entries in last 30 days
   - Formula: `Math.min(recentEntries * 2, 20)`

2. **Quality Bonus** (+0 to +15 points)
   - Based on content length (depth of reflection)
   - Formula: `Math.min(content.length / 100, 15)`

3. **Upset Penalty** (-10 points)
   - Applied when upset is detected in entry
   - Encourages addressing challenges

### Global Fulfillment Score (GFS)

```typescript
// Average of all life area scores
const totalScore = allAreas.reduce((sum, area) => sum + area.score, 0)
const gfs = allAreas.length > 0 ? totalScore / allAreas.length : 0
```

**Scale**: 0-100 (or 0-5 when divided by 20)

---

## AI Features

### Upset Detection

**Keyword Matching**:
- Negative emotion keywords (angry, frustrated, upset, etc.)
- Negative patterns (regex-based)

**Triggers AI reframing** when upset is detected.

### AI Reframing

**Uses OpenAI GPT-4**:
- System prompt: Compassionate life coach
- Framework: Phoenix transformation (Ashes → Fire → Rebirth)
- Output: < 150 words, empathetic and solution-focused

**Configuration**:
```bash
# .env
OPENAI_API_KEY=sk-proj-xxxxx
```

---

## Database Schema Updates

The journal system uses existing tables:

```prisma
model Journal {
  id            String         @id @default(uuid())
  tenantId      String
  userId        String
  lifeAreaId    String
  content       String         @db.Text
  upsetDetected Boolean        @default(false)
  aiReframe     String?        @db.Text
  tags          String[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  user          User           @relation(...)
  lifeArea      LifeArea       @relation(...)
}

model LifeArea {
  id            String         @id @default(uuid())
  tenantId      String
  userId        String
  name          String
  phoenixName   String?
  status        LifeStatus     @default(GREEN)
  score         Int            @default(0)  // 0-100
  // ...
}
```

---

## Testing

### Test Journal Creation

```bash
# Get auth token
TOKEN=$(curl -X POST http://localhost:3011/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# Create journal entry
curl -X POST http://localhost:3011/api/journal/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Today I felt frustrated with my progress, but I realized...",
    "lifeAreaIds": ["area_id_1"],
    "tags": ["growth", "challenge"],
    "autobiographyYear": 2024
  }' | jq
```

### Test Journal List

```bash
curl -X GET "http://localhost:3011/api/journal/list?limit=10&upsetOnly=false" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Migration from Supabase Edge Functions

If migrating from Supabase Edge Functions:

### Old Code (Supabase)
```typescript
const { data, error } = await supabase.functions.invoke('journal_entry_ingest', {
  body: { content, areas },
  headers: { Authorization: `Bearer ${session.access_token}` }
})
```

### New Code (WisdomOS API)
```typescript
const token = localStorage.getItem('wisdomos_auth_token')
const response = await fetch('/api/journal/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    content,
    lifeAreaIds: areas
  })
})
const data = await response.json()
```

---

## Environment Variables

Required:
```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI Features (Optional)
OPENAI_API_KEY=sk-proj-xxxxx  # For AI reframing
```

---

## Future Enhancements

1. **Advanced Sentiment Analysis**
   - Use ML models for better upset detection
   - Multi-dimensional emotion classification

2. **Pattern Recognition**
   - Identify recurring themes across entries
   - Suggest areas needing attention

3. **Autobiography Chapter Auto-Linking**
   - Automatically link entries to life chapters
   - Based on content and date

4. **Voice Journal Integration**
   - Speech-to-text processing
   - Emotion detection from voice

5. **Collaborative Journaling**
   - Share entries with mentors/therapists
   - Collaborative reframing

---

## Troubleshooting

### Issue: "Not authenticated"
**Solution**: Ensure JWT token is in Authorization header

### Issue: "Life area not found"
**Solution**: Verify life area IDs exist and belong to user

### Issue: AI reframe not working
**Solution**: Check `OPENAI_API_KEY` is set and valid

### Issue: Scores not updating
**Solution**: Verify life areas have valid initial scores

---

## Support

For issues or questions:
- **Documentation**: This file
- **API Errors**: Check server logs: `npm run dev`
- **AXAI Innovations**: contact@axaiinovations.com

---

**Last Updated**: 2025-10-29
**Version**: 2.0.0-phoenix
