#!/usr/bin/env node

/**
 * WisdomOS Comprehensive Test Suite
 * Tests all API endpoints, authentication, and CRUD operations
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_EMAIL = 'test@wisdomos.com';
const TEST_PASSWORD = 'testpassword123';

class TestSuite {
  constructor() {
    this.results = [];
    this.authToken = null;
    this.userId = null;
    this.testData = {
      goalIds: [],
      contributionIds: [],
      autobiographyIds: []
    };
  }

  log(test, status, message = '', details = null) {
    const result = {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${status} ${message ? '- ' + message : ''}`);
    
    if (details && status === 'FAIL') {
      console.log('   Details:', details);
    }
  }

  async makeRequest(method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }

  async testHealthCheck() {
    const result = await this.makeRequest('GET', '/api/health');
    
    if (result.success && result.data?.status === 'healthy') {
      this.log('Health Check', 'PASS', 'API is healthy');
    } else {
      this.log('Health Check', 'FAIL', 'API health check failed', result.error);
    }
  }

  async testAuthentication() {
    // Test login endpoint
    const loginData = {
      email: TEST_EMAIL,
      name: 'Test User'
    };

    const result = await this.makeRequest('POST', '/api/auth/login', loginData);
    
    if (result.success && result.data?.token) {
      this.authToken = result.data.token;
      this.userId = result.data.user?.id;
      this.log('Authentication - Login', 'PASS', 'Login successful');
    } else {
      this.log('Authentication - Login', 'FAIL', 'Login failed', result.error);
      return false;
    }

    // Test /me endpoint
    const meResult = await this.makeRequest('GET', '/api/auth/me');
    
    if (meResult.success && meResult.data?.id) {
      this.log('Authentication - Me', 'PASS', 'User info retrieved');
      return true;
    } else {
      this.log('Authentication - Me', 'FAIL', 'Failed to get user info', meResult.error);
      return false;
    }
  }

  async testGoalsCRUD() {
    // Test CREATE Goal
    const goalData = {
      title: 'Test Goal',
      description: 'This is a test goal',
      importance: 'Testing the application',
      isSprint: true,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      tags: ['test', 'automation']
    };

    const createResult = await this.makeRequest('POST', '/api/goals', goalData);
    
    if (createResult.success && createResult.data?.id) {
      this.testData.goalIds.push(createResult.data.id);
      this.log('Goals - CREATE', 'PASS', 'Goal created successfully');
    } else {
      this.log('Goals - CREATE', 'FAIL', 'Failed to create goal', createResult.error);
    }

    // Test READ Goals
    const readResult = await this.makeRequest('GET', '/api/goals');
    
    if (readResult.success && Array.isArray(readResult.data)) {
      this.log('Goals - READ', 'PASS', `Retrieved ${readResult.data.length} goals`);
    } else {
      this.log('Goals - READ', 'FAIL', 'Failed to read goals', readResult.error);
    }

    // Test UPDATE Goal
    if (this.testData.goalIds.length > 0) {
      const goalId = this.testData.goalIds[0];
      const updateData = {
        title: 'Updated Test Goal',
        isCompleted: true
      };

      const updateResult = await this.makeRequest('PUT', `/api/goals/${goalId}`, updateData);
      
      if (updateResult.success) {
        this.log('Goals - UPDATE', 'PASS', 'Goal updated successfully');
      } else {
        this.log('Goals - UPDATE', 'FAIL', 'Failed to update goal', updateResult.error);
      }
    }

    // Test DELETE Goal
    if (this.testData.goalIds.length > 0) {
      const goalId = this.testData.goalIds[0];
      const deleteResult = await this.makeRequest('DELETE', `/api/goals/${goalId}`);
      
      if (deleteResult.success) {
        this.log('Goals - DELETE', 'PASS', 'Goal deleted successfully');
      } else {
        this.log('Goals - DELETE', 'FAIL', 'Failed to delete goal', deleteResult.error);
      }
    }
  }

  async testContributionsCRUD() {
    // Test CREATE Contribution
    const contributionData = {
      type: 'strength',
      title: 'Test Strength',
      content: 'This is a test strength contribution',
      source: 'Automated Test',
      tags: ['test', 'strength'],
      color: '#FF5733'
    };

    const createResult = await this.makeRequest('POST', '/api/contributions', contributionData);
    
    if (createResult.success && createResult.data?.id) {
      this.testData.contributionIds.push(createResult.data.id);
      this.log('Contributions - CREATE', 'PASS', 'Contribution created successfully');
    } else {
      this.log('Contributions - CREATE', 'FAIL', 'Failed to create contribution', createResult.error);
    }

    // Test READ Contributions
    const readResult = await this.makeRequest('GET', '/api/contributions');
    
    if (readResult.success && Array.isArray(readResult.data)) {
      this.log('Contributions - READ', 'PASS', `Retrieved ${readResult.data.length} contributions`);
    } else {
      this.log('Contributions - READ', 'FAIL', 'Failed to read contributions', readResult.error);
    }

    // Test UPDATE Contribution - Skip as API doesn't have PUT method
    this.log('Contributions - UPDATE', 'WARN', 'UPDATE not implemented in API');

    // Test DELETE Contribution
    if (this.testData.contributionIds.length > 0) {
      const contributionId = this.testData.contributionIds[0];
      const deleteResult = await this.makeRequest('DELETE', `/api/contributions/${contributionId}`);
      
      if (deleteResult.success) {
        this.log('Contributions - DELETE', 'PASS', 'Contribution deleted successfully');
      } else {
        this.log('Contributions - DELETE', 'FAIL', 'Failed to delete contribution', deleteResult.error);
      }
    }
  }

  async testAutobiographyCRUD() {
    // Test CREATE Autobiography Entry
    const autobiographyData = {
      year: 2020,
      title: 'Test Life Event',
      body: 'This is a test narrative for 2020',
      earliest: 'This happened when I was young',
      insight: 'I learned something important',
      commitment: 'I will do better next time'
    };

    const createResult = await this.makeRequest('POST', '/api/autobiography', autobiographyData);
    
    if (createResult.success && createResult.data?.id) {
      this.testData.autobiographyIds.push(createResult.data.id);
      this.log('Autobiography - CREATE', 'PASS', 'Autobiography entry created successfully');
    } else {
      this.log('Autobiography - CREATE', 'FAIL', 'Failed to create autobiography entry', createResult.error);
    }

    // Test READ Autobiography Entries
    const readResult = await this.makeRequest('GET', '/api/autobiography');
    
    if (readResult.success && Array.isArray(readResult.data)) {
      this.log('Autobiography - READ', 'PASS', `Retrieved ${readResult.data.length} autobiography entries`);
    } else {
      this.log('Autobiography - READ', 'FAIL', 'Failed to read autobiography entries', readResult.error);
    }

    // Test UPDATE Autobiography Entry - Skip as API doesn't have PUT method
    this.log('Autobiography - UPDATE', 'WARN', 'UPDATE not implemented in API');

    // Test DELETE Autobiography Entry
    if (this.testData.autobiographyIds.length > 0) {
      const autobiographyId = this.testData.autobiographyIds[0];
      const deleteResult = await this.makeRequest('DELETE', `/api/autobiography/${autobiographyId}`);
      
      if (deleteResult.success) {
        this.log('Autobiography - DELETE', 'PASS', 'Autobiography entry deleted successfully');
      } else {
        this.log('Autobiography - DELETE', 'FAIL', 'Failed to delete autobiography entry', deleteResult.error);
      }
    }
  }

  async testSettings() {
    // Test GET Settings
    const getResult = await this.makeRequest('GET', '/api/settings');
    
    if (getResult.success) {
      this.log('Settings - GET', 'PASS', 'Settings retrieved successfully');
    } else {
      this.log('Settings - GET', 'FAIL', 'Failed to get settings', getResult.error);
    }

    // Test UPDATE Settings
    const settingsData = {
      enableGoals: true,
      enableContributions: true,
      enableAutobiography: true,
      theme: 'dark',
      defaultEntryVisibility: 'private'
    };

    const updateResult = await this.makeRequest('PUT', '/api/settings', settingsData);
    
    if (updateResult.success) {
      this.log('Settings - UPDATE', 'PASS', 'Settings updated successfully');
    } else {
      this.log('Settings - UPDATE', 'FAIL', 'Failed to update settings', updateResult.error);
    }
  }

  generateReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    const warnTests = this.results.filter(r => r.status === 'WARN').length;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        warnings: warnTests,
        successRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`
      },
      results: this.results,
      recommendations: []
    };

    if (failedTests > 0) {
      report.recommendations.push('Review failed tests and fix issues before deployment');
    }

    if (passedTests === totalTests) {
      report.recommendations.push('All tests passed - ready for deployment');
    }

    // Write report to file
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Warnings: ${warnTests}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    console.log('\nDetailed report saved to: test-report.json');

    return report;
  }

  async runAllTests() {
    console.log('🚀 Starting WisdomOS Comprehensive Test Suite...\n');

    try {
      await this.testHealthCheck();
      
      const authSuccess = await this.testAuthentication();
      if (!authSuccess) {
        this.log('Test Suite', 'FAIL', 'Authentication failed - cannot continue with other tests');
        return this.generateReport();
      }

      await this.testGoalsCRUD();
      await this.testContributionsCRUD();
      await this.testAutobiographyCRUD();
      await this.testSettings();

    } catch (error) {
      this.log('Test Suite', 'FAIL', 'Unexpected error during testing', error.message);
    }

    return this.generateReport();
  }
}

// Main execution
if (require.main === module) {
  const testSuite = new TestSuite();
  testSuite.runAllTests().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = TestSuite;