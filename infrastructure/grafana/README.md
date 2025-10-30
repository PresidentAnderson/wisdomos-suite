# WisdomOS Grafana Monitoring Setup

This directory contains Grafana configuration for monitoring the WisdomOS platform.

## Files

- `alertmanager-config.json` - Alert routing and notification configuration
- `alert-rules.yaml` - Alert rules for critical metrics
- `dashboard-wisdomos-overview.json` - Main platform overview dashboard
- `datasources.yaml` - Data source configurations (Prometheus, PostgreSQL)
- `docker-compose.yml` - Complete monitoring stack setup

## Quick Start

### 1. Set Up Environment Variables

Create a `.env` file in this directory:

```bash
# Database connection
POSTGRES_HOST=db.yvssmqyphqgvpkwudeoa.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=xUJfDHMSjWjVR4l3

# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=<your-secure-password>

# Alerting
ALERT_EMAIL=alerts@wisdomos.com
CRITICAL_EMAIL=critical@wisdomos.com
SLACK_WEBHOOK_URL=<your-slack-webhook-url>

# Prometheus
PROMETHEUS_RETENTION=15d
```

### 2. Start the Monitoring Stack

```bash
cd infrastructure/grafana
docker-compose up -d
```

This will start:
- Grafana (port 3000)
- Prometheus (port 9090)
- Node Exporter (port 9100)
- Postgres Exporter (port 9187)

### 3. Access Grafana

1. Open http://localhost:3000
2. Login with credentials from `.env`
3. Navigate to Dashboards → WisdomOS - Platform Overview

### 4. Import Alert Rules

```bash
# Copy alert rules to Grafana provisioning directory
cp alert-rules.yaml /var/lib/grafana/provisioning/alerting/

# Reload Grafana configuration
curl -X POST http://localhost:3000/api/admin/provisioning/alerting/reload \
  -H "Content-Type: application/json" \
  -u admin:$GRAFANA_ADMIN_PASSWORD
```

### 5. Configure Alertmanager

Import `alertmanager-config.json` via Grafana UI:
1. Go to Alerting → Contact points
2. Click "Import contact point"
3. Upload `alertmanager-config.json`

## Alert Rules

### Critical Alerts
- **Database Connection Failure** - Triggers when database is unreachable for 1+ minutes
- **High API Error Rate** - Triggers when 5xx errors exceed 5% for 3+ minutes
- **Fulfillment Score Calculation Failure** - Triggers when 10+ dimensions have null metrics
- **Disk Space Low** - Triggers when available disk space < 15%

### Performance Alerts
- **Slow API Response** - Triggers when P95 latency > 2s for 5+ minutes
- **High Database Connections** - Triggers when active connections > 80 for 3+ minutes
- **High Memory Usage** - Triggers when memory usage > 85% for 5+ minutes
- **High CPU Usage** - Triggers when CPU usage > 80% for 5+ minutes

### Business Metric Alerts
- **Low Fulfillment Scores** - Triggers when 24h average < 2.5 for 30+ minutes
- **Journal Processing Backlog** - Triggers when 100+ entries unprocessed for 10+ minutes
- **Commitment Detection Failure** - Triggers when no commitments detected in 1 hour

## Dashboards

### WisdomOS - Platform Overview
Main dashboard showing:
- API request rate and response times
- Active users and journal entries
- Average fulfillment scores
- Fulfillment scores by life area
- Database connection count
- Agent job queue status
- Recent errors

Additional dashboards can be added in `/infrastructure/grafana/dashboards/`.

## Data Sources

### Prometheus
Collects metrics from:
- Application instrumentation (HTTP requests, response times)
- Node Exporter (CPU, memory, disk, network)
- Postgres Exporter (database metrics)

### PostgreSQL
Direct queries to WisdomOS database for:
- User activity
- Journal entries
- Fulfillment scores
- Commitments
- Agent job status

## Metrics to Instrument

Add these metrics to your application code:

### API Metrics
```typescript
import { register, Counter, Histogram } from 'prom-client';

// Request counter
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'endpoint', 'status']
});

// Response time histogram
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5]
});
```

### Business Metrics
```typescript
// Fulfillment score gauge
const fulfillmentScoreGauge = new Gauge({
  name: 'fulfillment_score',
  help: 'Current fulfillment score',
  labelNames: ['area', 'subdomain', 'dimension']
});

// Journal entry counter
const journalEntriesTotal = new Counter({
  name: 'journal_entries_total',
  help: 'Total number of journal entries',
  labelNames: ['user_id', 'classification']
});
```

## Troubleshooting

### Alerts not firing
1. Check alert rule configuration in Grafana UI
2. Verify data sources are connected
3. Check Prometheus targets are up: http://localhost:9090/targets
4. Review alert evaluation logs in Grafana

### Missing metrics
1. Ensure application is instrumented correctly
2. Check Prometheus scrape configuration
3. Verify network connectivity to scrape targets

### Email alerts not sending
1. Verify SMTP configuration in Grafana
2. Check alertmanager logs: `docker-compose logs alertmanager`
3. Test email contact point in Grafana UI

## Production Deployment

For production, consider:

1. **High Availability**
   - Run multiple Grafana instances behind load balancer
   - Use managed Prometheus (e.g., Grafana Cloud, AWS AMP)
   - Use external database for Grafana (PostgreSQL)

2. **Security**
   - Enable HTTPS with valid certificates
   - Use strong passwords and MFA
   - Restrict network access with firewall rules
   - Rotate credentials regularly

3. **Scaling**
   - Increase Prometheus retention as needed
   - Use Prometheus federation for multi-cluster
   - Consider Thanos or Cortex for long-term storage

4. **Backup**
   - Backup Grafana SQLite database regularly
   - Export dashboard JSON definitions
   - Version control alert rules

## Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [AlertManager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
