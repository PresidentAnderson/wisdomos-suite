#!/usr/bin/env tsx
/**
 * Test Grafana Connection and Diagnose Issues
 */

import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config()

async function testGrafanaConnection() {
  console.log(chalk.blue('🔍 Testing Grafana Connection\n'))

  const configs = [
    {
      name: 'Grafana Cloud',
      url: process.env.GRAFANA_INSTANCE_URL,
      token: process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN,
      type: 'cloud'
    },
    {
      name: 'Grafana Cloud (Prometheus)',
      url: process.env.GRAFANA_PROMETHEUS_URL || 'https://prometheus-us-central1.grafana.net',
      token: process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN,
      type: 'prometheus'
    },
    {
      name: 'Local Grafana',
      url: 'http://localhost:3000',
      token: process.env.GRAFANA_LOCAL_TOKEN || 'admin:admin',
      type: 'local'
    }
  ]

  for (const config of configs) {
    if (!config.url || !config.token) {
      console.log(chalk.yellow(`⏭️  Skipping ${config.name} (not configured)\n`))
      continue
    }

    console.log(chalk.blue(`Testing ${config.name}...`))
    console.log(chalk.gray(`URL: ${config.url}`))

    try {
      // Test different endpoints based on type
      const endpoints = config.type === 'cloud' 
        ? ['/api/org', '/api/datasources', '/api/dashboards']
        : config.type === 'prometheus'
        ? ['/api/v1/label/__name__/values']
        : ['/api/org', '/api/health']

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${config.url}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${config.token}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          } as any)

          if (response.ok) {
            console.log(chalk.green(`  ✓ ${endpoint} - OK (${response.status})`))
          } else {
            console.log(chalk.red(`  ✗ ${endpoint} - Failed (${response.status})`))
            const text = await response.text()
            if (text.includes('Invalid API key')) {
              console.log(chalk.red('     Error: Invalid API key/token'))
            } else if (text.includes('unauthorized')) {
              console.log(chalk.red('     Error: Unauthorized - check token permissions'))
            }
          }
        } catch (error: any) {
          console.log(chalk.red(`  ✗ ${endpoint} - Error: ${error.message}`))
        }
      }
    } catch (error: any) {
      console.log(chalk.red(`  ✗ Connection failed: ${error.message}`))
    }
    console.log()
  }

  // Provide diagnostic information
  console.log(chalk.blue('📋 Diagnostic Information:\n'))
  
  console.log(chalk.yellow('Common Issues:'))
  console.log('1. Instance suspended/deleted - Check Grafana Cloud portal')
  console.log('2. Token expired - Generate new service account token')
  console.log('3. Wrong URL format - Should be: https://YOUR-STACK.grafana.net')
  console.log('4. Network/firewall blocking - Try from different network')
  console.log('5. Free tier limits exceeded - Check usage in Grafana Cloud\n')

  console.log(chalk.yellow('Alternative Solutions:'))
  console.log('1. Use Vercel Analytics (built-in with Vercel deployment)')
  console.log('2. Set up local Grafana with Docker')
  console.log('3. Use alternative: Prometheus + local Grafana')
  console.log('4. Try other free tiers: New Relic, DataDog (limited)\n')
}

// Run test
if (require.main === module) {
  testGrafanaConnection().catch(console.error)
}

export { testGrafanaConnection }