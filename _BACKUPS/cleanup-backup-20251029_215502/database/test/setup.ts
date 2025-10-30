import { config } from 'dotenv';

// Load test environment
config({ path: '.env.test' });

// Set defaults for database testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/wisdomos_test';

// Global setup
beforeAll(async () => {
  console.log('Setting up database tests...');
});

afterAll(async () => {
  console.log('Cleaning up database tests...');
});

export {};