# Development Guide

Guide for developing WisdomOS locally.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Initialize database
pnpm db:init

# Start development
pnpm dev
```

## Development Commands

```bash
# Start all services
pnpm dev

# Individual services
pnpm web:dev      # Web app only
pnpm api:dev      # API server only
pnpm mobile:dev   # Mobile app only

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes
pnpm db:studio    # Open Prisma Studio

# Testing
pnpm test         # Run tests
pnpm test:watch   # Watch mode
pnpm lint         # Run linting

# Building
pnpm build        # Build all
```

## Project Structure

See [Monorepo Structure](../../architecture/monorepo-structure.md) for details.

## Best Practices

- Run `pnpm lint` before committing
- Write tests for new features
- Update documentation
- Follow TypeScript strict mode
- Use conventional commit messages

## Troubleshooting

See [FAQ](../../getting-started/faq.md#troubleshooting) for common issues.

## Contributing

See [Contributing Guide](../../contributing/README.md) for how to contribute.
