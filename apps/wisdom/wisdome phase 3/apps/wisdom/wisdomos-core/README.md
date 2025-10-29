# 🔥 WisdomOS Core

**Phoenix Transformation System - Core Business Logic Library**

[![Build Status](https://github.com/presidentanderson/wisdomos-core/workflows/CI%2FCD/badge.svg)](https://github.com/presidentanderson/wisdomos-core/actions)
[![Coverage](https://codecov.io/gh/presidentanderson/wisdomos-core/branch/main/graph/badge.svg)](https://codecov.io/gh/presidentanderson/wisdomos-core)
[![npm version](https://badge.fury.io/js/%40wisdomos%2Fcore.svg)](https://badge.fury.io/js/%40wisdomos%2Fcore)
[![License: PROPRIETARY](https://img.shields.io/badge/License-PROPRIETARY-red.svg)](./LICENSE)

> *"From ashes to clarity, every transformation begins with a single commit."* 🔥

## 🌟 Overview

WisdomOS Core is the foundational TypeScript library powering the Phoenix Transformation System. It provides robust business logic, type-safe interfaces, and utilities for managing personal transformation journeys through the four phases of the Phoenix lifecycle.

### 🦅 The Phoenix Phases

1. **🔥 ASHES** - Recognition and preparation phase
2. **💫 BURNING** - Active transformation and learning phase  
3. **🌅 RISING** - Integration and emergence phase
4. **🦅 SOARING** - Mastery and transcendence phase

## 📦 Installation

```bash
# Using npm
npm install @wisdomos/core

# Using yarn
yarn add @wisdomos/core

# Using pnpm
pnpm add @wisdomos/core
```

## 🚀 Quick Start

```typescript
import { 
  PhoenixLifecycleService,
  TransformationService,
  TransformationType,
  PhoenixPhase 
} from '@wisdomos/core';

// Initialize services
const phoenixService = new PhoenixLifecycleService(cycleRepo, transformationRepo);
const transformationService = new TransformationService(transformationRepo, progressRepo);

// Create a new Phoenix cycle
const cycle = await phoenixService.initializePhoenixCycle(userId);

// Create a transformation
const transformation = await transformationService.createTransformation(userId, {
  type: TransformationType.MINDSET_SHIFT,
  title: 'Develop Growth Mindset',
  description: 'Transform from fixed to growth mindset',
  targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  milestones: ['Identify limiting beliefs', 'Practice positive self-talk'],
  tags: ['mindset', 'growth']
});

// Update progress
await transformationService.updateProgress(transformation.id, 50, 'Making great progress!');

// Check if ready to advance Phoenix phase
const canAdvance = await phoenixService.canAdvancePhase(userId);
if (canAdvance) {
  const updatedCycle = await phoenixService.advancePhase(userId, ['Milestone achieved'], ['Key insight discovered']);
}
```

## 🏗️ Architecture

### Core Components

- **Types & Interfaces** - Comprehensive type definitions and schemas
- **Phoenix Lifecycle** - Four-phase transformation management
- **Transformation Engine** - Individual transformation tracking
- **Utilities** - Helper functions and validation tools
- **Constants** - System-wide configuration and constants

### Key Features

✅ **Type-Safe** - Full TypeScript support with Zod validation  
✅ **Phoenix Lifecycle** - Four-phase transformation methodology  
✅ **Progress Tracking** - Detailed progress monitoring and analytics  
✅ **Flexible Architecture** - Repository pattern for data persistence  
✅ **Comprehensive Testing** - 100% test coverage with Jest  
✅ **ESLint & Prettier** - Code quality and formatting  
✅ **Zero Dependencies** - Minimal external dependencies  

## 📚 API Reference

### PhoenixLifecycleService

Manages the Phoenix transformation cycles and phase progression.

```typescript
class PhoenixLifecycleService {
  async initializePhoenixCycle(userId: string): Promise<PhoenixCycle>
  async getCurrentCycle(userId: string): Promise<PhoenixCycle | null>
  async advancePhase(userId: string, achievements?: string[], insights?: string[]): Promise<PhoenixCycle>
  async canAdvancePhase(userId: string): Promise<boolean>
  async getPhaseRequirements(phase: PhoenixPhase): Promise<string[]>
  async calculatePhaseProgress(userId: string): Promise<number>
}
```

### TransformationService

Handles individual transformation lifecycle management.

```typescript
class TransformationService {
  async createTransformation(userId: string, data: CreateTransformationData): Promise<Transformation>
  async updateProgress(transformationId: string, progress: number, notes?: string): Promise<Transformation>
  async completeTransformation(transformationId: string, notes?: string): Promise<Transformation>
  async cancelTransformation(transformationId: string, reason?: string): Promise<Transformation>
  async getActiveTransformations(userId: string): Promise<Transformation[]>
  async getTransformationHistory(userId: string, limit?: number, offset?: number): Promise<Transformation[]>
}
```

### Core Types

```typescript
// Phoenix User
interface PhoenixUser {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  // ... additional fields
}

// Transformation
interface Transformation {
  id: string;
  userId: string;
  type: TransformationType;
  status: TransformationStatus;
  title: string;
  progress: number;
  startDate: Date;
  targetCompletionDate: Date;
  // ... additional fields
}

// Phoenix Cycle
interface PhoenixCycle {
  id: string;
  userId: string;
  currentPhase: PhoenixPhase;
  cycleNumber: number;
  startDate: Date;
  phaseHistory: PhaseHistoryEntry[];
  // ... additional fields
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage Requirements

- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Build library
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

### Development Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build the library for production |
| `npm run dev` | Start TypeScript compiler in watch mode |
| `npm run test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Fix linting issues automatically |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run clean` | Clean build artifacts |

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/) for releases:

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 🤝 Contributing

This is proprietary software. Contributions are restricted to authorized team members only.

### Development Workflow

1. Create feature branch from `develop`
2. Make changes with comprehensive tests
3. Submit pull request for review
4. Merge to `develop` after approval
5. Release to `main` after testing

## 📄 License

**PROPRIETARY** - All rights reserved. See [LICENSE](./LICENSE) for details.

This software is protected by copyright and other intellectual property laws. Unauthorized copying, distribution, or use is strictly prohibited.

## 🛡️ Security

Security is our top priority. Please review our [Security Policy](./SECURITY.md) for:

- 🚨 Reporting vulnerabilities
- 🔒 Security best practices
- 📋 Compliance information
- 🏆 Security reward program

## 📞 Support

- 📧 **Email**: support@axaiinnovations.com
- 🌐 **Website**: https://axaiinnovations.com
- 📚 **Documentation**: https://docs.wisdomos.app
- 💬 **Community**: https://community.wisdomos.app

## 🗺️ Roadmap

### v1.1.0 (Q2 2025)
- Advanced analytics and insights
- Enhanced Phoenix phase validation
- Additional transformation types
- Performance optimizations

### v1.2.0 (Q3 2025)
- Real-time progress synchronization
- Advanced metric calculations
- Integration framework
- Mobile SDK compatibility

### v2.0.0 (Q4 2025)
- Next-generation Phoenix methodology
- AI-powered recommendations
- Advanced personalization
- Multi-tenant architecture

## 🏆 Acknowledgments

Built with ❤️ by the AXAI Innovations team and powered by:

- **TypeScript** - Type-safe development
- **Zod** - Schema validation
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

**🔥 Phoenix rises through transformation!**

*Copyright © 2025 AXAI Innovations. All rights reserved.*