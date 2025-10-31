# 🔥 WisdomOS API

**Phoenix Transformation System - Backend API**

[![Build Status](https://github.com/presidentanderson/wisdomos-api/workflows/CI%2FCD/badge.svg)](https://github.com/presidentanderson/wisdomos-api/actions)
[![Coverage](https://codecov.io/gh/presidentanderson/wisdomos-api/branch/main/graph/badge.svg)](https://codecov.io/gh/presidentanderson/wisdomos-api)
[![Railway](https://img.shields.io/badge/Deploy-Railway-blueviolet)](https://wisdomos-api.up.railway.app)
[![License: PROPRIETARY](https://img.shields.io/badge/License-PROPRIETARY-red.svg)](./LICENSE)

> *"From ashes to clarity, every transformation begins with a single API call."* 🔥

## 🌟 Overview

WisdomOS API is the robust backend system powering the Phoenix Transformation Platform. Built with NestJS, it provides a secure, scalable, and feature-rich API for managing personal transformation journeys through the four phases of the Phoenix lifecycle.

### 🛠️ Tech Stack

- **🏗️ Framework**: NestJS with Express
- **🗃️ Database**: PostgreSQL with Prisma ORM
- **☁️ Cloud**: Supabase for database hosting
- **🚀 Deployment**: Railway for hosting and CI/CD
- **🔐 Authentication**: JWT with Passport.js
- **📡 API**: tRPC for type-safe API calls
- **⚡ Caching**: Redis for session and data caching
- **📊 Monitoring**: Sentry for error tracking
- **🧪 Testing**: Jest for unit and integration tests

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/presidentanderson/wisdomos-api.git
cd wisdomos-api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your environment variables (see Configuration section)

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database (optional)
npm run prisma:seed

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:4000` with documentation at `http://localhost:4000/docs`.

## ⚙️ Configuration

### Environment Variables

Key environment variables to configure:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_DATABASE_URL="postgresql://user:password@host:port/database"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Redis Cache
REDIS_URL="redis://localhost:6379"

# External APIs
OPENAI_API_KEY="your-openai-api-key"
SENDGRID_API_KEY="your-sendgrid-api-key"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

See [`.env.example`](./.env.example) for the complete list of configuration options.

## 🏗️ Architecture

### Core Modules

```
src/
├── auth/           # Authentication & authorization
├── users/          # User management
├── transformations/# Transformation CRUD operations
├── phoenix/        # Phoenix lifecycle management
├── progress/       # Progress tracking
├── analytics/      # Analytics and insights
├── notifications/  # Notification system
├── database/       # Database configuration
├── common/         # Shared utilities, filters, guards
└── config/         # Application configuration
```

### API Endpoints

#### Authentication
```
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User login
POST   /api/auth/logout        # User logout
POST   /api/auth/refresh       # Refresh tokens
POST   /api/auth/forgot        # Password reset request
POST   /api/auth/reset         # Password reset confirmation
```

#### Users
```
GET    /api/users/profile      # Get user profile
PUT    /api/users/profile      # Update user profile
GET    /api/users/settings     # Get user settings
PUT    /api/users/settings     # Update user settings
DELETE /api/users/account      # Delete user account
```

#### Transformations
```
GET    /api/transformations               # List user transformations
POST   /api/transformations               # Create transformation
GET    /api/transformations/:id          # Get transformation
PUT    /api/transformations/:id          # Update transformation
DELETE /api/transformations/:id          # Delete transformation
POST   /api/transformations/:id/progress # Update progress
```

#### Phoenix Cycles
```
GET    /api/phoenix/current     # Get current Phoenix cycle
POST   /api/phoenix/initialize  # Initialize new cycle
POST   /api/phoenix/advance     # Advance to next phase
GET    /api/phoenix/history     # Get cycle history
GET    /api/phoenix/requirements# Get phase requirements
```

#### Progress & Analytics
```
GET    /api/progress/history    # Get progress history
POST   /api/progress/entry      # Create progress entry
GET    /api/analytics/user      # Get user analytics
GET    /api/analytics/insights  # Get AI-powered insights
```

## 🔒 Authentication & Security

### JWT Authentication

The API uses JWT tokens for stateless authentication:

```typescript
// Login example
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword'
  })
});

const { accessToken, refreshToken, user } = await response.json();

// Use token in subsequent requests
const protectedResponse = await fetch('/api/users/profile', {
  headers: { 
    'Authorization': `Bearer ${accessToken}` 
  }
});
```

### Security Features

- 🔐 **JWT Authentication** with refresh tokens
- 🛡️ **Rate Limiting** to prevent abuse
- 🔒 **Password Hashing** with bcrypt
- 🚫 **CORS Protection** with configurable origins
- 🛑 **SQL Injection Prevention** via Prisma ORM
- 🔍 **Input Validation** using class-validator
- 📝 **Audit Logging** for security events
- 🚨 **Error Handling** without information disclosure

## 🗃️ Database Schema

### Key Models

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR,
  display_name VARCHAR NOT NULL,
  timezone VARCHAR DEFAULT 'UTC',
  subscription_tier VARCHAR DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Phoenix Cycles
CREATE TABLE phoenix_cycles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  current_phase phoenix_phase_enum,
  cycle_number INTEGER,
  start_date TIMESTAMP,
  phase_history JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transformations
CREATE TABLE transformations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  phoenix_cycle_id UUID REFERENCES phoenix_cycles(id),
  type transformation_type_enum,
  status transformation_status_enum,
  title VARCHAR NOT NULL,
  progress FLOAT DEFAULT 0,
  target_completion_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

See [`prisma/schema.prisma`](./prisma/schema.prisma) for the complete database schema.

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Test Structure

```
test/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data and fixtures
```

### Test Coverage Requirements

- **Statements**: 85%
- **Branches**: 80%
- **Functions**: 85%
- **Lines**: 85%

## 🚀 Deployment

### Railway Deployment

The API is deployed on Railway with automated CI/CD:

1. **Development**: Pushes to `develop` deploy to staging
2. **Production**: Pushes to `main` deploy to production
3. **Database**: Migrations run automatically on deployment
4. **Health Checks**: Automated health monitoring

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start:prod

# Or using Docker
docker build -t wisdomos-api .
docker run -p 4000:4000 wisdomos-api
```

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
PORT=4000
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
REDIS_URL=your-production-redis-url
SENTRY_DSN=your-production-sentry-dsn
```

## 📊 Monitoring & Observability

### Health Checks

The API includes comprehensive health checks:

```bash
# Health endpoint
GET /health

# Response
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600.123,
  "database": "connected",
  "redis": "connected",
  "memory": {
    "used": "125.5 MB",
    "limit": "512 MB"
  }
}
```

### Monitoring Stack

- **🐛 Error Tracking**: Sentry for error monitoring
- **📈 Metrics**: Custom metrics and performance monitoring  
- **📊 Logging**: Structured logging with Winston
- **🔍 Tracing**: Request tracing and performance analysis
- **⚡ Performance**: Response time and throughput monitoring

## 🔧 Development

### Development Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run start:debug` | Start with debugging enabled |
| `npm run build` | Build for production |
| `npm run start:prod` | Start production server |
| `npm run lint` | Lint code with ESLint |
| `npm run test` | Run test suite |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed database with test data |

### Code Quality

- **ESLint**: Comprehensive linting rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks
- **TypeScript**: Strong typing throughout
- **SonarCloud**: Code quality analysis

## 📚 API Documentation

### Interactive Documentation

Visit `/docs` when running the server for interactive Swagger documentation.

### tRPC Integration

Type-safe API calls with tRPC:

```typescript
import { createTRPCClient } from '@trpc/client';
import type { AppRouter } from './src/trpc/app.router';

const client = createTRPCClient<AppRouter>({
  url: 'http://localhost:4000/trpc',
  headers: {
    authorization: `Bearer ${token}`,
  },
});

// Type-safe API calls
const transformations = await client.transformations.list.query();
const newTransformation = await client.transformations.create.mutate({
  type: 'MINDSET_SHIFT',
  title: 'Develop Growth Mindset',
  targetCompletionDate: new Date(),
});
```

## 🛡️ Security

Security is our top priority. Please review our [Security Policy](./SECURITY.md) for:

- 🚨 Reporting vulnerabilities
- 🔒 Security best practices
- 📋 Compliance information
- 🏆 Security reward program

## 📄 License

**PROPRIETARY** - All rights reserved. See [LICENSE](./LICENSE) for details.

This software is protected by copyright and other intellectual property laws. Unauthorized copying, distribution, or use is strictly prohibited.

## 🤝 Contributing

This is proprietary software. Contributions are restricted to authorized team members only.

### Development Workflow

1. Create feature branch from `develop`
2. Implement features with comprehensive tests
3. Submit pull request for code review
4. Deploy to staging for testing
5. Merge to `main` for production deployment

## 📞 Support

- 📧 **Email**: support@axaiinnovations.com
- 🌐 **Website**: https://axaiinnovations.com
- 📚 **Documentation**: https://docs.wisdomos.app
- 🚨 **Status Page**: https://status.wisdomos.app

## 🗺️ Roadmap

### v1.1.0 (Q2 2025)
- GraphQL API endpoint
- Enhanced analytics engine
- Real-time notifications
- Advanced integrations

### v1.2.0 (Q3 2025)
- AI-powered insights
- Multi-language support
- Advanced reporting
- Performance optimizations

### v2.0.0 (Q4 2025)
- Microservices architecture
- Advanced Phoenix methodology
- Enterprise features
- Global deployment

---

**🔥 Phoenix rises through transformation!**

*Built with ❤️ by AXAI Innovations*  
*Copyright © 2025 AXAI Innovations. All rights reserved.*