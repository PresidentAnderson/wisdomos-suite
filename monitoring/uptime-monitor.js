#!/usr/bin/env node

/**
 * WisdomOS Uptime Monitoring Script
 * Simple monitoring tool to check application health and availability
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class UptimeMonitor {
  constructor(options = {}) {
    this.url = options.url || 'https://wisdomos-mreyt8449-axaiinovation.vercel.app';
    this.interval = options.interval || 5 * 60 * 1000; // 5 minutes
    this.timeout = options.timeout || 10000; // 10 seconds
    this.logFile = options.logFile || path.join(__dirname, 'uptime.log');
    this.alertThreshold = options.alertThreshold || 3; // Alert after 3 consecutive failures
    this.consecutiveFailures = 0;
    this.isMonitoring = false;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    console.log(logEntry.trim());
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async checkHealth() {
    const healthUrl = `${this.url}/api/health`;
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = https.get(healthUrl, { timeout: this.timeout }, (res) => {
        const responseTime = Date.now() - startTime;
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const healthData = JSON.parse(data);
              resolve({
                success: true,
                status: res.statusCode,
                responseTime,
                health: healthData
              });
            } else {
              resolve({
                success: false,
                status: res.statusCode,
                responseTime,
                error: `HTTP ${res.statusCode}`
              });
            }
          } catch (error) {
            resolve({
              success: false,
              status: res.statusCode,
              responseTime,
              error: `Parse error: ${error.message}`
            });
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Request timeout',
          responseTime: this.timeout
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
          responseTime: Date.now() - startTime
        });
      });
    });
  }

  async performCheck() {
    const result = await this.checkHealth();
    
    if (result.success) {
      this.consecutiveFailures = 0;
      this.log(`✅ HEALTHY - Response: ${result.responseTime}ms - Status: ${result.health?.status || 'unknown'}`);
      
      if (result.health?.checks) {
        const checks = result.health.checks;
        this.log(`   Database: ${checks.database ? '✅' : '❌'} | API: ${checks.api ? '✅' : '❌'}`);
      }
    } else {
      this.consecutiveFailures++;
      this.log(`❌ UNHEALTHY - ${result.error} - Response: ${result.responseTime}ms`);
      
      if (this.consecutiveFailures >= this.alertThreshold) {
        this.sendAlert(result);
      }
    }

    return result;
  }

  sendAlert(result) {
    const alertMessage = `🚨 ALERT: WisdomOS has been down for ${this.consecutiveFailures} consecutive checks`;
    this.log(alertMessage);
    this.log(`   Last error: ${result.error}`);
    this.log(`   URL: ${this.url}`);
    
    // In a production environment, you would integrate with:
    // - Email notifications
    // - Slack webhooks
    // - PagerDuty
    // - Discord webhooks
    // - SMS services
    
    console.log('\n🔔 ALERT TRIGGERED - Consider implementing notification integrations');
  }

  start() {
    if (this.isMonitoring) {
      this.log('⚠️ Monitor is already running');
      return;
    }

    this.isMonitoring = true;
    this.log(`🚀 Starting uptime monitor for ${this.url}`);
    this.log(`   Check interval: ${this.interval / 1000}s`);
    this.log(`   Timeout: ${this.timeout / 1000}s`);
    this.log(`   Alert threshold: ${this.alertThreshold} failures`);
    this.log(`   Log file: ${this.logFile}`);

    // Perform initial check
    this.performCheck();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.performCheck();
    }, this.interval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.stop();
      process.exit(0);
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isMonitoring = false;
    this.log('🛑 Uptime monitor stopped');
  }

  async runOnce() {
    this.log('🔍 Performing single health check...');
    const result = await this.performCheck();
    return result;
  }

  generateReport(hours = 24) {
    try {
      const logContent = fs.readFileSync(this.logFile, 'utf8');
      const lines = logContent.trim().split('\n');
      
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      const recentLines = lines.filter(line => {
        const match = line.match(/\[([^\]]+)\]/);
        if (!match) return false;
        
        const lineTime = new Date(match[1]);
        return lineTime >= cutoffTime;
      });

      const totalChecks = recentLines.length;
      const successfulChecks = recentLines.filter(line => line.includes('✅ HEALTHY')).length;
      const failedChecks = totalChecks - successfulChecks;
      const uptime = totalChecks > 0 ? (successfulChecks / totalChecks * 100).toFixed(2) : 0;

      const report = {
        period: `Last ${hours} hours`,
        totalChecks,
        successfulChecks,
        failedChecks,
        uptimePercentage: `${uptime}%`,
        generatedAt: new Date().toISOString()
      };

      this.log(`📊 UPTIME REPORT (${hours}h): ${uptime}% uptime (${successfulChecks}/${totalChecks} checks)`);
      return report;
    } catch (error) {
      this.log(`❌ Failed to generate report: ${error.message}`);
      return null;
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'start';

  const monitor = new UptimeMonitor({
    url: process.env.MONITOR_URL || 'https://wisdomos-mreyt8449-axaiinovation.vercel.app',
    interval: parseInt(process.env.MONITOR_INTERVAL) || 5 * 60 * 1000,
    timeout: parseInt(process.env.MONITOR_TIMEOUT) || 10000
  });

  switch (command) {
    case 'start':
      monitor.start();
      break;
    
    case 'check':
      monitor.runOnce().then(() => process.exit(0));
      break;
    
    case 'report':
      const hours = parseInt(args[1]) || 24;
      monitor.generateReport(hours);
      process.exit(0);
      break;
    
    default:
      console.log(`
WisdomOS Uptime Monitor

Usage:
  node uptime-monitor.js start          # Start continuous monitoring
  node uptime-monitor.js check          # Perform single health check
  node uptime-monitor.js report [hours] # Generate uptime report

Environment Variables:
  MONITOR_URL       # URL to monitor (default: production URL)
  MONITOR_INTERVAL  # Check interval in ms (default: 300000 = 5min)
  MONITOR_TIMEOUT   # Request timeout in ms (default: 10000 = 10s)

Examples:
  node uptime-monitor.js start
  node uptime-monitor.js check
  node uptime-monitor.js report 24
      `);
      process.exit(1);
  }
}

module.exports = UptimeMonitor;