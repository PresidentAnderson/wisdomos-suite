# WisdomOS API Reference (v1.0)

**Complete API Documentation for Developers and AI Agents**

---

## Table of Contents

1. [Authentication](#authentication)
2. [Life Areas API](#life-areas-api)
3. [Journals API](#journals-api)
4. [Insights API](#insights-api)
5. [Phoenix Cycles API](#phoenix-cycles-api)
6. [Dashboard API](#dashboard-api)
7. [Relationships API](#relationships-api)
8. [Vault API](#vault-api)
9. [AI Agents API](#ai-agents-api)
10. [Error Handling](#error-handling)

---

## Base URL

```
Production:  https://wisdomos-phoenix-frontend.vercel.app/api
Staging:     https://staging.wisdomos.app/api
Development: http://localhost:3000/api
```

---

## Authentication

All API requests require authentication via JWT token in the `Authorization` header.

### Register User

Create a new user account.

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "Jane Doe",
  "tenantSlug": "personal" // optional, creates new tenant if not provided
}
```

**Response (201 Created)**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "tenantId": "uuid",
    "role": "OWNER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "expiresIn": 3600
}
```

### Login

Authenticate existing user.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK)**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "tenantId": "uuid",
    "role": "OWNER",
    "lastLoginAt": "2025-10-28T23:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "expiresIn": 3600
}
```

### Get Current User

Retrieve authenticated user profile.

```http
GET /auth/me
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane Doe",
  "tenantId": "uuid",
  "role": "OWNER",
  "tenant": {
    "id": "uuid",
    "name": "Personal Workspace",
    "slug": "personal",
    "plan": "FREE"
  },
  "createdAt": "2025-10-28T00:00:00Z",
  "lastLoginAt": "2025-10-28T23:00:00Z"
}
```

### Logout

Invalidate user session.

```http
POST /auth/logout
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "message": "Logged out successfully"
}
```

---

## Life Areas API

Manage fulfillment dimensions (Work, Relationships, Health, etc.)

### List Life Areas

```http
GET /api/life-areas
Authorization: Bearer {token}
```

**Query Parameters**
- `status` (optional): Filter by status (GREEN, YELLOW, RED)
- `sort` (optional): Sort field (sortOrder, score, updatedAt)

**Response (200 OK)**
```json
{
  "lifeAreas": [
    {
      "id": "uuid",
      "name": "Career & Purpose",
      "phoenixName": "Phoenix of Mastery",
      "status": "GREEN",
      "score": 85,
      "sortOrder": 1,
      "userId": "uuid",
      "createdAt": "2025-10-28T00:00:00Z",
      "updatedAt": "2025-10-28T23:00:00Z",
      "journalCount": 24
    }
  ]
}
```

### Create Life Area

```http
POST /api/life-areas
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Physical Health",
  "phoenixName": "Phoenix of Vitality",
  "sortOrder": 2
}
```

**Response (201 Created)**
```json
{
  "id": "uuid",
  "name": "Physical Health",
  "phoenixName": "Phoenix of Vitality",
  "status": "GREEN",
  "score": 0,
  "sortOrder": 2,
  "userId": "uuid",
  "tenantId": "uuid",
  "createdAt": "2025-10-28T23:00:00Z",
  "updatedAt": "2025-10-28T23:00:00Z"
}
```

### Update Life Area

```http
PATCH /api/life-areas/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Health & Wellness",
  "status": "YELLOW",
  "score": 65
}
```

**Response (200 OK)**
```json
{
  "id": "uuid",
  "name": "Health & Wellness",
  "status": "YELLOW",
  "score": 65,
  "updatedAt": "2025-10-28T23:05:00Z"
}
```

### Delete Life Area

```http
DELETE /api/life-areas/:id
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "message": "Life area deleted successfully",
  "id": "uuid"
}
```

---

## Journals API

Journaling and reflection entries.

### List Journals

```http
GET /api/journals
Authorization: Bearer {token}
```

**Query Parameters**
- `lifeAreaId` (optional): Filter by life area
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response (200 OK)**
```json
{
  "journals": [
    {
      "id": "uuid",
      "content": "Today I realized that my purpose is shifting...",
      "sentiment": 0.75,
      "lifeAreaId": "uuid",
      "lifeArea": {
        "name": "Career & Purpose"
      },
      "userId": "uuid",
      "createdAt": "2025-10-28T20:00:00Z",
      "updatedAt": "2025-10-28T20:00:00Z",
      "tags": ["breakthrough", "purpose"],
      "insightCount": 3
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Single Journal

```http
GET /api/journals/:id
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "id": "uuid",
  "content": "Today I realized that my purpose is shifting...",
  "sentiment": 0.75,
  "lifeAreaId": "uuid",
  "lifeArea": {
    "id": "uuid",
    "name": "Career & Purpose",
    "phoenixName": "Phoenix of Mastery"
  },
  "userId": "uuid",
  "createdAt": "2025-10-28T20:00:00Z",
  "updatedAt": "2025-10-28T20:00:00Z",
  "tags": ["breakthrough", "purpose"],
  "insights": [
    {
      "id": "uuid",
      "agentType": "INSIGHT",
      "insight": "You're experiencing a career transition...",
      "confidence": 0.89
    }
  ]
}
```

### Create Journal Entry

```http
POST /api/journals
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Today was challenging but I learned...",
  "lifeAreaId": "uuid",
  "tags": ["reflection", "growth"],
  "generateInsights": true // optional, trigger AI analysis
}
```

**Response (201 Created)**
```json
{
  "id": "uuid",
  "content": "Today was challenging but I learned...",
  "sentiment": 0.62,
  "lifeAreaId": "uuid",
  "userId": "uuid",
  "tenantId": "uuid",
  "tags": ["reflection", "growth"],
  "createdAt": "2025-10-28T23:10:00Z",
  "updatedAt": "2025-10-28T23:10:00Z",
  "insights": [] // populated if generateInsights: true
}
```

### Update Journal Entry

```http
PATCH /api/journals/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Updated content...",
  "tags": ["reflection", "growth", "breakthrough"]
}
```

**Response (200 OK)**
```json
{
  "id": "uuid",
  "content": "Updated content...",
  "tags": ["reflection", "growth", "breakthrough"],
  "updatedAt": "2025-10-28T23:15:00Z"
}
```

### Delete Journal Entry

```http
DELETE /api/journals/:id
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "message": "Journal entry deleted successfully",
  "id": "uuid"
}
```

---

## Insights API

AI-generated analysis and pattern detection.

### Get Insights for Journal

```http
GET /api/insights/:journalId
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "insights": [
    {
      "id": "uuid",
      "journalId": "uuid",
      "agentType": "JOURNAL",
      "insight": "This entry shows strong self-awareness about career transitions...",
      "confidence": 0.89,
      "keywords": ["career", "transition", "purpose"],
      "tone": "reflective",
      "createdAt": "2025-10-28T23:00:00Z"
    }
  ]
}
```

### Generate New Insights

```http
POST /api/insights/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "journalId": "uuid",
  "agentTypes": ["JOURNAL", "INSIGHT", "PATTERN"] // optional
}
```

**Response (201 Created)**
```json
{
  "insights": [
    {
      "id": "uuid",
      "journalId": "uuid",
      "agentType": "JOURNAL",
      "insight": "Key themes: purpose, alignment, growth...",
      "confidence": 0.91
    }
  ],
  "tokensUsed": 1247,
  "processingTime": 2.3
}
```

### Detect Patterns

```http
GET /api/insights/patterns
Authorization: Bearer {token}
```

**Query Parameters**
- `lifeAreaId` (optional): Focus on specific life area
- `startDate` (optional): Pattern detection window start
- `endDate` (optional): Pattern detection window end

**Response (200 OK)**
```json
{
  "patterns": [
    {
      "type": "RECURRING_THEME",
      "theme": "Work-life balance",
      "occurrences": 12,
      "firstSeen": "2025-09-15T00:00:00Z",
      "lastSeen": "2025-10-28T00:00:00Z",
      "lifeAreas": ["Career & Purpose", "Relationships"],
      "sentiment": -0.3,
      "recommendation": "Consider setting clearer boundaries..."
    }
  ]
}
```

---

## Phoenix Cycles API

Transformation tracking through the Phoenix stages.

### Get Current Cycle

```http
GET /api/phoenix/current
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "id": "uuid",
  "cycleNumber": 3,
  "stage": "FIRE",
  "startedAt": "2025-10-01T00:00:00Z",
  "completedAt": null,
  "ashesReflection": "I need to let go of perfectionism...",
  "fireBreakthrough": "In progress...",
  "rebirthVision": null,
  "flightLegacy": null,
  "completionScore": 0.45,
  "stageProgress": {
    "ASHES": 1.0,
    "FIRE": 0.6,
    "REBIRTH": 0.0,
    "FLIGHT": 0.0
  }
}
```

### Initiate Phoenix Reset

```http
POST /api/phoenix/reset
Authorization: Bearer {token}
Content-Type: application/json

{
  "trigger": "Major life transition - career change",
  "ashesReflection": "What I'm leaving behind..."
}
```

**Response (201 Created)**
```json
{
  "id": "uuid",
  "cycleNumber": 4,
  "stage": "ASHES",
  "startedAt": "2025-10-28T23:20:00Z",
  "ashesReflection": "What I'm leaving behind...",
  "completionScore": 0.0
}
```

### Update Phoenix Cycle

```http
PATCH /api/phoenix/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "stage": "REBIRTH",
  "rebirthVision": "My new vision for this chapter..."
}
```

**Response (200 OK)**
```json
{
  "id": "uuid",
  "stage": "REBIRTH",
  "rebirthVision": "My new vision for this chapter...",
  "completionScore": 0.75,
  "updatedAt": "2025-10-28T23:25:00Z"
}
```

### Get Phoenix History

```http
GET /api/phoenix/history
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "cycles": [
    {
      "id": "uuid",
      "cycleNumber": 1,
      "startedAt": "2025-01-01T00:00:00Z",
      "completedAt": "2025-04-15T00:00:00Z",
      "completionScore": 1.0,
      "outcome": "Successfully transitioned careers"
    }
  ],
  "totalCycles": 3,
  "currentCycle": 3
}
```

---

## Dashboard API

Aggregate metrics and analytics.

### Get Dashboard Overview

```http
GET /api/dashboard
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "userId": "uuid",
  "overallFulfillment": 78,
  "phoenixStage": "FIRE",
  "currentCycle": 3,
  "lifeAreas": [
    {
      "name": "Career & Purpose",
      "status": "GREEN",
      "score": 85,
      "trend": "UP"
    }
  ],
  "recentJournals": 12,
  "totalJournals": 156,
  "insightsGenerated": 342,
  "streakDays": 24,
  "lastEntry": "2025-10-28T20:00:00Z"
}
```

### Get Trend Data

```http
GET /api/dashboard/trends
Authorization: Bearer {token}
```

**Query Parameters**
- `period` (optional): 7d, 30d, 90d, 1y (default: 30d)
- `metric` (optional): fulfillment, sentiment, activity

**Response (200 OK)**
```json
{
  "period": "30d",
  "metric": "fulfillment",
  "dataPoints": [
    {
      "date": "2025-10-01",
      "value": 72
    },
    {
      "date": "2025-10-15",
      "value": 75
    },
    {
      "date": "2025-10-28",
      "value": 78
    }
  ],
  "trend": "IMPROVING",
  "changePercent": 8.3
}
```

### Get AI Recommendations

```http
GET /api/dashboard/recommendations
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "recommendations": [
    {
      "type": "LIFE_AREA",
      "priority": "HIGH",
      "title": "Relationships need attention",
      "description": "Your relationship score has declined 15% this month...",
      "suggestedActions": [
        "Schedule quality time with loved ones",
        "Journal about relationship patterns"
      ]
    }
  ]
}
```

---

## Relationships API

Social connection tracking.

### List Relationships

```http
GET /api/relationships
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "relationships": [
    {
      "id": "uuid",
      "name": "Sarah Johnson",
      "type": "FRIEND",
      "quality": 85,
      "frequency": "WEEKLY",
      "lastContact": "2025-10-25T00:00:00Z",
      "notes": "Close friend from college",
      "createdAt": "2025-01-15T00:00:00Z"
    }
  ]
}
```

### Create Relationship

```http
POST /api/relationships
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mike Chen",
  "type": "MENTOR",
  "quality": 90,
  "frequency": "MONTHLY",
  "notes": "Career mentor"
}
```

**Response (201 Created)**
```json
{
  "id": "uuid",
  "name": "Mike Chen",
  "type": "MENTOR",
  "quality": 90,
  "frequency": "MONTHLY",
  "notes": "Career mentor",
  "createdAt": "2025-10-28T23:30:00Z"
}
```

---

## Vault API

Secure document storage.

### List Vault Items

```http
GET /api/vault
Authorization: Bearer {token}
```

**Response (200 OK)**
```json
{
  "items": [
    {
      "id": "uuid",
      "fileName": "important-document.pdf",
      "fileSize": 245632,
      "mimeType": "application/pdf",
      "encrypted": true,
      "tags": ["legal", "personal"],
      "uploadedAt": "2025-10-28T00:00:00Z"
    }
  ]
}
```

### Upload to Vault

```http
POST /api/vault
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <binary>
tags: ["personal", "important"]
encrypt: true
```

**Response (201 Created)**
```json
{
  "id": "uuid",
  "fileName": "document.pdf",
  "fileSize": 245632,
  "storageUrl": "https://...",
  "encrypted": true,
  "uploadedAt": "2025-10-28T23:35:00Z"
}
```

---

## AI Agents API

Direct agent invocation.

### Invoke Agent

```http
POST /api/agents/invoke
Authorization: Bearer {token}
Content-Type: application/json

{
  "agentType": "JOURNAL",
  "task": "Analyze recent entries for patterns",
  "context": {
    "journalIds": ["uuid1", "uuid2"]
  }
}
```

**Response (200 OK)**
```json
{
  "agentType": "JOURNAL",
  "result": {
    "insights": [...],
    "patterns": [...],
    "recommendations": [...]
  },
  "metadata": {
    "model": "gpt-4",
    "tokensUsed": 1547,
    "processingTime": 3.2,
    "confidence": 0.87
  }
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "timestamp": "2025-10-28T23:40:00Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

**Document Version**: 1.0
**Last Updated**: 2025-10-28
**Base URL**: https://wisdomos-phoenix-frontend.vercel.app/api
