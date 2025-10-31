# Tests Directory

## Purpose
End-to-end (E2E) and integration tests for WisdomOS.

## What's Inside

### E2E Tests
- User flow testing
- Cross-application integration
- Authentication flows
- Critical path testing

### Integration Tests
- API integration tests
- Database integration tests
- Third-party service tests

### Test Utilities
- Test fixtures
- Mock data
- Helper functions
- Test configuration

## Technologies
- Jest for unit tests
- Supertest for API tests
- Playwright/Cypress for E2E (if configured)

## Running Tests
```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run with coverage
pnpm test:cov

# Watch mode
pnpm test:watch
```

## Test Structure
```
tests/
├── e2e/              # End-to-end tests
├── integration/      # Integration tests
├── fixtures/         # Test data
└── utils/           # Test helpers
```

## Importance: ⭐⭐⭐⭐
Important - Ensures quality and catches regressions.
