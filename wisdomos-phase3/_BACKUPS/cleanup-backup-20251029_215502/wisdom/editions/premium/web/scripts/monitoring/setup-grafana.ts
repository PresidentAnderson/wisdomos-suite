#!/usr/bin/env tsx
/**
 * Grafana Dashboard Setup for WisdomOS
 * Creates monitoring dashboards and alerts
 */

import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config()

const GRAFANA_URL = process.env.GRAFANA_INSTANCE_URL
const GRAFANA_TOKEN = process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN
const GRAFANA_ORG_ID = process.env.GRAFANA_ORG_ID || '1'

interface Dashboard {
  uid: string
  title: string
  tags: string[]
  timezone: string
  panels: any[]
}

async function setupGrafana() {
  if (!GRAFANA_URL || !GRAFANA_TOKEN) {
    console.error(chalk.red('❌ Missing GRAFANA_INSTANCE_URL or GRAFANA_SERVICE_ACCOUNT_TOKEN'))
    console.log(chalk.yellow('\nPlease add to your .env file:'))
    console.log(chalk.gray('GRAFANA_INSTANCE_URL=https://your-grafana.grafana.net'))
    console.log(chalk.gray('GRAFANA_SERVICE_ACCOUNT_TOKEN=your-token'))
    process.exit(1)
  }

  console.log(chalk.blue('🎯 Setting up Grafana Monitoring for WisdomOS\n'))
  console.log(chalk.gray(`Instance: ${GRAFANA_URL}`))
  console.log(chalk.gray(`Org ID: ${GRAFANA_ORG_ID}\n`))

  // Create main dashboard
  const mainDashboard = createMainDashboard()
  await createDashboard(mainDashboard)

  // Create alerts
  await createAlerts()

  console.log(chalk.green('\n✅ Grafana setup complete!\n'))
  console.log(chalk.gray('Dashboard URL:'))
  console.log(chalk.blue(`${GRAFANA_URL}/d/wisdomos-main/wisdomos-monitoring\n`))
}

function createMainDashboard(): Dashboard {
  return {
    uid: 'wisdomos-main',
    title: 'WisdomOS - Anthropic Phoenix Framework',
    tags: ['wisdomos', 'anthropic', 'axai'],
    timezone: 'browser',
    panels: [
      // Row 1: Key Metrics
      {
        id: 1,
        gridPos: { x: 0, y: 0, w: 6, h: 8 },
        type: 'stat',
        title: 'Active Users',
        targets: [{
          expr: 'count(increase(wisdomos_user_action[24h]))'
        }],
        fieldConfig: {
          defaults: {
            color: { mode: 'thresholds' },
            thresholds: {
              mode: 'absolute',
              steps: [
                { value: 0, color: 'red' },
                { value: 10, color: 'yellow' },
                { value: 50, color: 'green' }
              ]
            }
          }
        }
      },
      {
        id: 2,
        gridPos: { x: 6, y: 0, w: 6, h: 8 },
        type: 'stat',
        title: 'Total Contributions',
        targets: [{
          expr: 'sum(wisdomos_contribution_created)'
        }],
        fieldConfig: {
          defaults: {
            color: { mode: 'palette-classic' }
          }
        }
      },
      {
        id: 3,
        gridPos: { x: 12, y: 0, w: 6, h: 8 },
        type: 'gauge',
        title: 'Average Fulfillment Score',
        targets: [{
          expr: 'avg(wisdomos_fulfillment_score)'
        }],
        fieldConfig: {
          defaults: {
            min: 0,
            max: 10,
            thresholds: {
              mode: 'absolute',
              steps: [
                { value: 0, color: 'red' },
                { value: 4, color: 'yellow' },
                { value: 7, color: 'green' }
              ]
            }
          }
        }
      },
      {
        id: 4,
        gridPos: { x: 18, y: 0, w: 6, h: 8 },
        type: 'stat',
        title: 'HubSpot Sync Rate',
        targets: [{
          expr: 'sum(rate(wisdomos_hubspot_sync[5m]))'
        }],
        fieldConfig: {
          defaults: {
            unit: 'ops',
            color: { fixedColor: 'blue', mode: 'fixed' }
          }
        }
      },

      // Row 2: Time Series
      {
        id: 5,
        gridPos: { x: 0, y: 8, w: 12, h: 8 },
        type: 'timeseries',
        title: 'Contributions Over Time',
        targets: [
          {
            expr: 'sum by (type) (rate(wisdomos_contribution_created[1h]))',
            legendFormat: '{{type}}'
          }
        ],
        fieldConfig: {
          defaults: {
            unit: 'short',
            custom: {
              lineInterpolation: 'smooth',
              showPoints: 'never',
              spanNulls: true
            }
          }
        }
      },
      {
        id: 6,
        gridPos: { x: 12, y: 8, w: 12, h: 8 },
        type: 'timeseries',
        title: 'Journal Entries by Mood',
        targets: [
          {
            expr: 'sum by (mood) (increase(wisdomos_journal_entry[1h]))',
            legendFormat: '{{mood}}'
          }
        ]
      },

      // Row 3: Distributions
      {
        id: 7,
        gridPos: { x: 0, y: 16, w: 8, h: 8 },
        type: 'piechart',
        title: 'Contribution Types Distribution',
        targets: [{
          expr: 'sum by (type) (wisdomos_contribution_created)'
        }]
      },
      {
        id: 8,
        gridPos: { x: 8, y: 16, w: 8, h: 8 },
        type: 'heatmap',
        title: 'Fulfillment by Life Area',
        targets: [{
          expr: 'wisdomos_fulfillment_score',
          format: 'heatmap'
        }]
      },
      {
        id: 9,
        gridPos: { x: 16, y: 16, w: 8, h: 8 },
        type: 'bargauge',
        title: 'API Performance',
        targets: [{
          expr: 'histogram_quantile(0.95, sum by (endpoint) (rate(wisdomos_api_latency_bucket[5m])))',
          legendFormat: '{{endpoint}}'
        }],
        fieldConfig: {
          defaults: {
            unit: 'ms',
            thresholds: {
              mode: 'absolute',
              steps: [
                { value: 0, color: 'green' },
                { value: 500, color: 'yellow' },
                { value: 1000, color: 'red' }
              ]
            }
          }
        }
      },

      // Row 4: Errors and Alerts
      {
        id: 10,
        gridPos: { x: 0, y: 24, w: 24, h: 6 },
        type: 'alertlist',
        title: 'Active Alerts',
        options: {
          showOptions: 'current',
          maxItems: 10,
          sortOrder: 1,
          dashboardAlerts: true,
          alertName: '',
          dashboardTitle: '',
          tags: ['wisdomos']
        }
      }
    ]
  }
}

async function createDashboard(dashboard: Dashboard) {
  console.log(chalk.blue(`Creating dashboard: ${dashboard.title}...`))
  
  try {
    const response = await fetch(`${GRAFANA_URL}/api/dashboards/db`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GRAFANA_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Grafana-Org-Id': GRAFANA_ORG_ID
      },
      body: JSON.stringify({
        dashboard,
        overwrite: true,
        message: 'Created by WisdomOS setup script'
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log(chalk.green(`✓ Dashboard created: ${result.url}`))
    } else {
      const error = await response.text()
      console.error(chalk.red(`✗ Failed to create dashboard: ${error}`))
    }
  } catch (error) {
    console.error(chalk.red(`✗ Error creating dashboard: ${error}`))
  }
}

async function createAlerts() {
  console.log(chalk.blue('\nCreating alert rules...'))
  
  const alerts = [
    {
      uid: 'wisdomos-error-rate',
      title: 'High Error Rate',
      condition: 'sum(rate(wisdomos_error_count[5m])) > 0.1',
      annotations: {
        summary: 'WisdomOS error rate is above threshold',
        description: 'Error rate is {{ $value }} errors/sec'
      }
    },
    {
      uid: 'wisdomos-hubspot-stale',
      title: 'HubSpot Webhook Stale',
      condition: 'time() - max(wisdomos_hubspot_sync) > 900',
      annotations: {
        summary: 'HubSpot webhooks have not received data for 15+ minutes',
        description: 'Last webhook received {{ $value }} seconds ago'
      }
    },
    {
      uid: 'wisdomos-low-fulfillment',
      title: 'Low Fulfillment Score',
      condition: 'avg(wisdomos_fulfillment_score) < 3',
      annotations: {
        summary: 'Average fulfillment score is critically low',
        description: 'Current average: {{ $value }}/10'
      }
    }
  ]

  for (const alert of alerts) {
    try {
      const response = await fetch(`${GRAFANA_URL}/api/v1/provisioning/alert-rules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GRAFANA_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Grafana-Org-Id': GRAFANA_ORG_ID
        },
        body: JSON.stringify({
          uid: alert.uid,
          title: alert.title,
          condition: alert.condition,
          data: [{
            refId: 'A',
            queryType: '',
            model: {
              expr: alert.condition,
              refId: 'A'
            }
          }],
          noDataState: 'NoData',
          execErrState: 'Alerting',
          for: '5m',
          annotations: alert.annotations,
          labels: {
            app: 'wisdomos',
            severity: 'warning'
          }
        })
      })

      if (response.ok) {
        console.log(chalk.green(`✓ Alert created: ${alert.title}`))
      } else {
        console.log(chalk.yellow(`⚠ Alert may already exist: ${alert.title}`))
      }
    } catch (error) {
      console.error(chalk.red(`✗ Error creating alert ${alert.title}: ${error}`))
    }
  }
}

// Run setup
if (require.main === module) {
  setupGrafana().catch(console.error)
}

export { setupGrafana }