# WisdomOS Database Seeding Guide

This guide explains how to populate your WisdomOS database with seed data for development, testing, and demonstration purposes.

## Overview

WisdomOS provides multiple seeding options to support different use cases:

1. **Basic Seeding**: Creates the 13 canonical life areas only
2. **Demo Seeding**: Creates demo users and basic contributions  
3. **Advanced Demo**: Creates comprehensive demo data showcasing all features
4. **Full Demo**: Combines basic + advanced demo data

## Quick Start

### 1. Basic Life Areas Only
```bash
npm run db:seed
```
Creates the 13 canonical life areas without any demo users or contributions.

### 2. Complete Demo Data (Recommended)
```bash
npm run db:seed:demo
```
Creates life areas + 3 demo users + comprehensive contributions + mirroring examples.

### 3. Advanced Demo Only
```bash
npm run db:seed:demo-only
```
Adds advanced demo data to existing demo users (run after basic demo seeding).

## Seeding Commands Reference

### Root Level Commands (Recommended)

| Command | Description |
|---------|-------------|
| `npm run db:seed` | Basic seeding: canonical life areas only |
| `npm run db:seed:demo` | Full demo: life areas + users + contributions + advanced features |
| `npm run db:seed:demo-only` | Advanced demo data only (requires existing demo users) |

### Database Package Commands

| Command | Description |
|---------|-------------|
| `cd packages/database && npm run db:seed` | Basic seeding |
| `cd packages/database && npm run db:seed:demo` | Demo users + basic contributions |
| `cd packages/database && npm run db:seed:advanced` | Advanced demo data only |
| `cd packages/database && npm run db:seed:full` | Complete demo package |

## Demo Data Overview

### Demo Users Created

The seeding creates 3 realistic demo users with different profiles:

#### 1. Alex Rivera (alex.developer@wisdomos.com)
- **Role**: Senior Software Engineer → Tech Lead
- **Phoenix Stage**: FIRE (Breakthrough phase)
- **Cycle Count**: 2
- **Contributions**: Full-stack development, open source, technical resources
- **Demonstrates**: "Doing" category mirroring to 3 life areas

#### 2. Sarah Chen (sarah.creative@wisdomos.com)  
- **Role**: UX Designer and Digital Artist
- **Phoenix Stage**: REBIRTH (Fulfillment phase)
- **Cycle Count**: 1
- **Contributions**: Empathetic design, digital art, accessibility systems
- **Demonstrates**: "Being" category mirroring to 2 life areas

#### 3. Marcus Thompson (marcus.coach@wisdomos.com)
- **Role**: Life Coach and Community Builder  
- **Phoenix Stage**: FLIGHT (Legacy phase)
- **Cycle Count**: 5
- **Contributions**: Community healing, wisdom keeping, resource sharing
- **Demonstrates**: "Transforming" category and complete Phoenix journeys

### Contribution Categories Demonstrated

The demo data showcases all 5 contribution categories:

1. **Doing**: Technical work, product management, facilitation
2. **Being**: Mindful presence, empathy, wisdom keeping  
3. **Creating**: Art, design systems, education platforms
4. **Transforming**: Culture change, healing facilitation, therapy integration
5. **Having**: Resource sharing, tools, community assets

### Mirroring Feature Showcase

The seed data demonstrates the core mirroring functionality:

- **"Doing" contributions** → Mirror to 3 life areas:
  - Work & Purpose (priority 4)
  - Creativity & Expression (priority 3)  
  - Community & Contribution (priority 3)

- **"Being" contributions** → Mirror to 2 life areas:
  - Creativity & Expression (priority 3)
  - Spirituality & Practice (priority 3)

- **Custom mirror rules** for different user types

### Additional Demo Features

- **Phoenix Cycles**: Complete transformation journeys with all 4 stages
- **Journal Entries**: Breakthrough moments, reflections, gratitude
- **Achievements**: Unlocked badges showing progression
- **Audit Logs**: System activity tracking and user actions
- **Fulfillment Entries**: Manual, assessment, and mirrored entries
- **Priority System**: Work & Purpose = 4, others = 3

## Environment Variables

### DATABASE_SEED_DEMO
Controls whether demo data is created during basic seeding:

```bash
# Enable demo data creation
DATABASE_SEED_DEMO=true npm run db:seed

# Disable demo data (default)
npm run db:seed
```

## Resetting and Re-seeding

### Complete Reset
```bash
npm run db:reset
# This will drop all data and re-run migrations
# Then run your preferred seeding command
```

### Fresh Demo Data
```bash
# Reset everything and create full demo
npm run db:reset
npm run db:seed:demo
```

## Development Workflow

### For Feature Development
1. Start with basic seeding for clean environment:
   ```bash
   npm run db:seed
   ```

### For Demo/Testing
1. Use full demo data to test all features:
   ```bash
   npm run db:seed:demo
   ```

### For Presentation/Showcase
1. Use complete demo data with all examples:
   ```bash
   npm run db:seed:demo
   ```

## Troubleshooting

### Duplicate Key Errors
If you see unique constraint violations:
```bash
# Reset and try again
npm run db:reset
npm run db:seed:demo
```

### Missing Demo Users
If advanced seeding fails with "No demo users found":
```bash
# Run basic demo seeding first
DATABASE_SEED_DEMO=true npm run db:seed
# Then run advanced seeding
npm run db:seed:demo-only
```

### Permission Errors
Ensure your database user has sufficient permissions:
- CREATE, INSERT, UPDATE, DELETE on all tables
- EXECUTE on stored functions

## Customizing Seed Data

### Adding Your Own Demo Data

1. **Extend the seed script**: Edit `/packages/database/prisma/seed.ts`
2. **Create new script**: Add to `/scripts/` directory
3. **Add npm scripts**: Update package.json files

### Modifying Demo Users

Edit the `demoUsers` array in either:
- `/packages/database/prisma/seed.ts` (basic demo)
- `/scripts/seed-demo-data.ts` (advanced demo)

### Adding Life Areas

Edit the `canonicalAreas` array in `/packages/database/prisma/seed.ts`

## Production Considerations

**⚠️ Important**: Never run demo seeding commands in production!

- Demo users have predictable emails and weak security
- Demo data contains placeholder information
- Use `npm run db:seed` (basic) for production initialization

## File Structure

```
wisdomOS/
├── packages/database/prisma/
│   └── seed.ts                 # Basic + demo seeding
├── scripts/
│   └── seed-demo-data.ts       # Advanced demo features
├── package.json                # Root-level commands
└── packages/database/package.json  # Database-level commands
```

## Support

For issues with seeding:
1. Check the console output for specific error messages
2. Verify your DATABASE_URL is correct
3. Ensure database exists and is accessible
4. Check that migrations have been run: `npm run db:migrate`

---

*Last updated: Generated with comprehensive demo data for WisdomOS contribution-fulfillment mirror feature*