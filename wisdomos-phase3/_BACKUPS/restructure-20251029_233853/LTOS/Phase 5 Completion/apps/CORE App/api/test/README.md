# WisdomOS API Test Suite

This directory contains comprehensive end-to-end tests for the contribution-fulfillment mirroring functionality in WisdomOS.

## Test Structure

### Core Test Files

1. **`contributions.e2e-spec.ts`** - Comprehensive tests for contribution CRUD operations and their integration with the mirroring system
2. **`fulfillment.e2e-spec.ts`** - Tests focused on fulfillment entry creation, updates, and deletion through contribution mirroring
3. **`mirroring.e2e-spec.ts`** - Integration tests for the complete mirroring workflow and business logic
4. **`api-integration.e2e-spec.ts`** - Full API endpoint integration tests covering complete user workflows
5. **`error-handling.e2e-spec.ts`** - Error handling, edge cases, and resilience testing

### Database Tests

6. **`../packages/database/test/mirror-triggers.test.ts`** - Database-level constraint testing, transactions, and data integrity

### Support Files

- **`test-setup.ts`** - Test environment setup and database management
- **`test-factories.ts`** - Test data factories and helper functions
- **`jest-e2e.json`** - Jest configuration for e2e tests
- **`jest.setup.ts`** - Global test setup and configuration

## Test Coverage

### Functional Requirements Covered

✅ **Creating contributions and verifying automatic mirroring**
- Tests creation of contributions in all categories (Doing, Being, Having)
- Verifies correct number of mirrors created (Doing=3, Being/Having=2)
- Validates mirror data integrity and metadata

✅ **Updating contributions and checking fulfillment updates**
- Tests partial and complete contribution updates
- Verifies all mirrors are updated consistently
- Tests rapid successive updates and concurrent operations

✅ **Deleting contributions and confirming fulfillment cleanup**
- Tests complete cleanup of all related mirrors
- Verifies referential integrity during deletion
- Tests cascading operations

✅ **Testing different category rules (Doing → 3 areas, Being → 2 areas)**
- Validates business logic for each contribution category
- Tests category-specific mirroring behavior
- Verifies life area assignment rules

✅ **Verifying priority levels (Work & Purpose = 4, others = 3)**
- Tests priority assignment based on life area
- Validates priority consistency across operations

✅ **Testing the community tag trigger**
- Tests community tag detection and mirror creation
- Validates Being/Having + community tag = 3 mirrors
- Tests tag addition and removal workflows

✅ **Audit log generation**
- Tests audit log creation for all operations
- Validates audit log data structure and content
- Tests audit trail completeness

✅ **Unique constraint enforcement (no duplicate mirrors)**
- Tests database unique constraints
- Validates upsert behavior for mirror updates
- Tests concurrent operation handling

✅ **Testing both database and in-memory modes**
- Comprehensive database testing with real constraints
- Transaction and rollback testing
- Performance and scalability testing

✅ **API endpoint integration tests**
- Complete workflow testing
- Cross-module integration
- Authentication and authorization

## Running the Tests

### Prerequisites

1. **Database Setup**: Ensure you have a test database configured
   ```bash
   export TEST_DATABASE_URL="postgresql://test:test@localhost:5432/wisdomos_test"
   ```

2. **Dependencies**: Install all dependencies
   ```bash
   cd /path/to/wisdomOS/apps/api
   npm install
   ```

### Running All Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- contributions.e2e-spec.ts

# Run with coverage
npm run test:e2e -- --coverage

# Run in watch mode
npm run test:e2e -- --watch
```

### Running Database Tests

```bash
cd ../../packages/database
npm test
```

## Test Scenarios Implemented

### 1. Basic CRUD Operations
- Create contribution → verify mirrors created
- Update contribution → verify mirrors updated
- Delete contribution → verify mirrors cleaned up

### 2. Business Logic Validation
- Doing contribution creates 3 fulfillment entries
- Being contribution creates 2 fulfillment entries
- Adding "community" tag adds Community & Contribution mirror
- Priority levels correctly assigned (Work & Purpose = 4, others = 3)

### 3. Data Integrity
- Editing contribution title updates all mirrors
- Deleting contribution removes all mirrors
- Duplicate mirror prevention works
- Audit log tracks all operations

### 4. API Integration
- API returns correct data structure
- Frontend hooks properly handle responses (simulated)
- Authentication and authorization work correctly

### 5. Error Handling
- Database connection failures
- Constraint violations
- Invalid input data
- Concurrent operations
- Resource exhaustion
- SQL injection attempts
- XSS prevention
- Unicode handling

### 6. Performance and Scalability
- Bulk operations (20+ contributions)
- Concurrent operations
- Large data handling
- Database query optimization
- Transaction performance

### 7. Recovery and Resilience
- Partial failure recovery
- Data consistency during errors
- Backfill functionality
- System stability under load

## Expected Test Results

When all tests pass, you should see:

- **contributions.e2e-spec.ts**: ~25 test cases covering contribution CRUD and mirroring
- **fulfillment.e2e-spec.ts**: ~15 test cases covering fulfillment entry lifecycle
- **mirroring.e2e-spec.ts**: ~20 test cases covering integration and business logic
- **api-integration.e2e-spec.ts**: ~15 test cases covering complete workflows
- **error-handling.e2e-spec.ts**: ~20 test cases covering edge cases and errors
- **mirror-triggers.test.ts**: ~15 test cases covering database constraints

**Total: ~110 comprehensive test cases**

## Test Data Management

Tests use isolated test data that is:
- Created fresh for each test suite
- Cleaned up between individual tests  
- Completely removed after test completion
- Separate from development/production data

## Debugging Tests

### Common Issues

1. **Database Connection**: Ensure TEST_DATABASE_URL is correct
2. **Timeouts**: Increase timeout for slow operations
3. **Port Conflicts**: Ensure test ports are available
4. **Cleanup**: Check for data leakage between tests

### Debug Mode

```bash
# Run with debug output
DEBUG=* npm run test:e2e

# Run single test with debugging
npm run test:e2e -- --testNamePattern="should create contribution"
```

## Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Use the test factories for data creation
3. Include proper setup/cleanup
4. Add both positive and negative test cases
5. Update this README with new test scenarios

## Performance Benchmarks

The test suite should complete within:
- Individual tests: < 5 seconds each
- Full test suite: < 10 minutes
- Database tests: < 2 minutes

If tests exceed these times, consider:
- Optimizing database queries
- Reducing test data size
- Parallelizing where safe
- Using test doubles for external dependencies