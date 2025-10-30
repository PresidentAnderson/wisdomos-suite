# WisdomOS Production Deployment Checklist

**Version:** 1.0.0
**Date Created:** October 29, 2025
**Last Updated:** October 29, 2025
**Status:** Ready for Use

---

## Overview

This comprehensive checklist ensures all critical aspects are verified before deploying WisdomOS to production. Complete ALL critical items before deployment.

**Deployment Status Legend:**
- [ ] Not Started
- [⏸️] In Progress
- [✅] Completed
- [❌] Failed / Blocked
- [⏭️] Skipped (with justification)

---

## Pre-Deployment Checklist

### Phase 1: Security Verification (CRITICAL)

#### 1.1 Dependency Security

- [ ] **Run npm audit on root package**
  ```bash
  cd /path/to/wisdomos-2026
  npm audit
  ```
  Expected: 0 vulnerabilities
  Current Status: 0 vulnerabilities ✅

- [ ] **Run npm audit on web app**
  ```bash
  cd apps/web
  npm audit
  ```
  Expected: 0 vulnerabilities
  Current Status: 0 vulnerabilities ✅

- [ ] **Run npm audit on API**
  ```bash
  cd apps/api
  npm audit
  ```
  Expected: 0 high/critical vulnerabilities
  Current Status: 5 low severity (dev-only) ⚠️

- [ ] **Verify GitHub Dependabot alerts resolved**
  ```bash
  gh api repos/PresidentAnderson/wisdomos-phase3/dependabot/alerts \
    --paginate | jq '[.[] | select(.state == "open")] | length'
  ```
  Expected: 0 HIGH/CRITICAL alerts
  Current Status: 28 open alerts (2 critical, 22 high) ❌

- [ ] **Review and merge Dependabot PRs**
  - [ ] PR #5: Security updates (7 directories, 4 packages)
  - [ ] PR #7: Security updates (6 directories, 4 packages)
  - [ ] PR #8: Security updates (5 directories, 4 packages)
  Current Status: All pending ❌

- [ ] **Verify package-lock.json files synced to remote**
  ```bash
  git status | grep package-lock.json
  ```
  Expected: No uncommitted changes

#### 1.2 Code Security

- [ ] **Enable branch protection on main**
  - [ ] Require PR reviews before merge
  - [ ] Require status checks to pass
  - [ ] Require up-to-date branches
  - [ ] Include administrators in restrictions

- [ ] **Enable GitHub code scanning**
  - [ ] CodeQL analysis configured
  - [ ] Dependency review enabled
  - [ ] Secret scanning enabled

- [ ] **Verify no secrets in codebase**
  ```bash
  git log --all --pretty=format: --name-only | \
    sort -u | \
    grep -E '\.(env|key|pem|p12|pfx|cer|crt|credential)$'
  ```
  Expected: Only .env.example files

- [ ] **Rotate all production secrets**
  - [ ] DATABASE_URL
  - [ ] NEXTAUTH_SECRET (generate new: `openssl rand -base64 32`)
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] OPENAI_API_KEY
  - [ ] Any third-party API keys

#### 1.3 Security Headers

- [ ] **Configure security headers in Next.js**
  File: apps/web/next.config.mjs
  ```javascript
  headers: [
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    // ... additional headers
  ]
  ```

- [ ] **Verify security headers in deployment**
  Test URL after deployment:
  ```bash
  curl -I https://your-production-url.com
  ```

---

### Phase 2: Code Quality (CRITICAL)

#### 2.1 Build Verification

- [ ] **Clean install dependencies**
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

- [ ] **Run TypeScript type check**
  ```bash
  cd apps/web
  npm run type-check
  ```
  Expected: No type errors
  Current Status: Not verified ⚠️

- [ ] **Run linter**
  ```bash
  npm run lint
  ```
  Expected: No lint errors
  Current Status: Passing on main ✅

- [ ] **Run tests**
  ```bash
  npm run test
  ```
  Expected: All tests passing
  Current Status: Not verified ⚠️

- [ ] **Build production bundle**
  ```bash
  cd apps/web
  npm run build
  ```
  Expected: Build succeeds without errors
  Current Status: Passing on main ✅

- [ ] **Verify build output size**
  Check .next/build-manifest.json for bundle sizes
  Target: First Load JS < 200 KB per page

#### 2.2 Database

- [ ] **Verify all migrations applied**
  ```bash
  cd apps/web
  npx prisma migrate status
  ```
  Expected: All migrations applied

- [ ] **Backup production database before deployment**
  ```bash
  # Supabase backup command or manual backup via dashboard
  ```

- [ ] **Test migration rollback procedure**
  ```bash
  npx prisma migrate resolve --rolled-back [migration_name]
  ```

- [ ] **Verify database connection string format**
  Format: `postgresql://user:password@host:port/database?schema=public`

- [ ] **Generate Prisma Client**
  ```bash
  npx prisma generate
  ```
  Expected: Client generated successfully

#### 2.3 Code Review

- [ ] **All PRs reviewed by at least one other developer**
- [ ] **No TODO or FIXME comments in critical paths**
- [ ] **Code comments present for complex logic**
- [ ] **No console.log statements in production code**
- [ ] **Error handling implemented for all async operations**

---

### Phase 3: CI/CD Configuration (CRITICAL)

#### 3.1 Fix CI Configuration

- [ ] **Remove continue-on-error from critical steps**
  File: .github/workflows/ci.yml

  Change lines 32, 36, 42:
  ```yaml
  # BEFORE
  - name: Run linter
    run: npm run lint
    continue-on-error: true  # REMOVE THIS

  # AFTER
  - name: Run linter
    run: npm run lint
    # Let failures block deployment
  ```

- [ ] **Verify CI fails on build errors**
  - [ ] Lint failures block deployment
  - [ ] Test failures block deployment
  - [ ] Build failures block deployment

- [ ] **Update security scan audit level**
  File: .github/workflows/ci.yml, line 64:
  ```yaml
  - name: Run security audit
    run: npm audit --audit-level=moderate  # Was: high
  ```

#### 3.2 Workflow Verification

- [ ] **All workflows passing on main branch**
  ```bash
  gh run list --branch main --limit 5
  ```
  Expected: All SUCCESS
  Current Status: ✅

- [ ] **Deploy workflow configured correctly**
  - [ ] Triggers on push to main
  - [ ] Environment variables configured
  - [ ] Deployment target verified

- [ ] **Rollback workflow tested**
  File: .github/workflows/rollback.yml
  Test in staging environment

---

### Phase 4: Environment Configuration (CRITICAL)

#### 4.1 Environment Variables

**Required Variables Checklist:**

**Database:**
- [ ] DATABASE_URL (verified working)
- [ ] DIRECT_URL (for Prisma migrations)

**Authentication:**
- [ ] NEXTAUTH_SECRET (32+ character random string)
- [ ] NEXTAUTH_URL (production URL)
- [ ] GITHUB_ID (OAuth - optional)
- [ ] GITHUB_SECRET (OAuth - optional)
- [ ] GOOGLE_CLIENT_ID (OAuth - optional)
- [ ] GOOGLE_CLIENT_SECRET (OAuth - optional)

**Supabase:**
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY (never expose to client)
- [ ] SUPABASE_JWT_SECRET

**AI Services:**
- [ ] OPENAI_API_KEY
- [ ] ANTHROPIC_API_KEY (optional)

**Platform-Specific:**
- [ ] NEXT_PUBLIC_SITE_URL (production URL)
- [ ] NEXT_PUBLIC_API_BASE (production API URL)

**Email (if configured):**
- [ ] EMAIL_SERVER
- [ ] EMAIL_FROM

#### 4.2 Platform Configuration

**Netlify (if using):**
- [ ] Site created in Netlify dashboard
- [ ] All environment variables configured
- [ ] Build settings match netlify.toml
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Deploy notifications configured

**Vercel (if using):**
- [ ] Project created in Vercel dashboard
- [ ] All environment variables configured (Production scope)
- [ ] Build settings verified
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Deploy notifications configured

#### 4.3 Environment Verification Script

- [ ] **Test environment variables accessible**
  Create test script:
  ```javascript
  // scripts/verify-env.js
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('Missing required env vars:', missing);
    process.exit(1);
  }
  console.log('All required environment variables present ✓');
  ```

  Run: `node scripts/verify-env.js`

---

### Phase 5: Deployment Platform Setup (CRITICAL)

#### 5.1 Choose Primary Platform

- [ ] **Decision made on primary platform**
  Options: Netlify | Vercel | Self-hosted
  Chosen: ________________
  Justification: ________________

- [ ] **Remove/archive secondary platform configs**
  - [ ] If choosing Netlify: Archive/remove vercel.json
  - [ ] If choosing Vercel: Archive/remove netlify.toml
  - [ ] Document in README.md

#### 5.2 Platform-Specific Setup

**If Netlify:**
- [ ] netlify.toml verified
  - [ ] Base directory: `apps/web`
  - [ ] Publish directory: `.next`
  - [ ] Build command correct
  - [ ] Environment variables set
- [ ] Test build in Netlify dashboard
- [ ] Deploy to staging first (deploy-preview)
- [ ] Verify staging works end-to-end

**If Vercel:**
- [ ] vercel.json verified
  - [ ] Build settings correct
  - [ ] API routes configuration
  - [ ] Redirects configured
- [ ] Project settings in Vercel dashboard
  - [ ] Root Directory: `apps/web`
  - [ ] Framework Preset: Next.js
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`
- [ ] Test build in Vercel dashboard
- [ ] Deploy to preview first
- [ ] Verify preview works end-to-end

#### 5.3 DNS and Domain

- [ ] **Domain purchased/available**
- [ ] **DNS records configured**
  - [ ] A record or CNAME to deployment platform
  - [ ] MX records for email (if applicable)
  - [ ] TXT records for verification
- [ ] **SSL certificate provisioned**
  - [ ] Auto-provisioning enabled (Let's Encrypt)
  - [ ] Certificate valid and not expiring soon
- [ ] **WWW redirect configured** (if applicable)
  - [ ] www.domain.com → domain.com (or vice versa)

---

### Phase 6: Testing (CRITICAL)

#### 6.1 Local Testing

- [ ] **Test in production mode locally**
  ```bash
  cd apps/web
  npm run build
  npm run start
  ```
  Open: http://localhost:3000

- [ ] **Test critical user flows**
  - [ ] Homepage loads
  - [ ] User registration
  - [ ] User login
  - [ ] Dashboard access
  - [ ] Patterns page
  - [ ] Recommendations page
  - [ ] Best Practices page
  - [ ] User logout

- [ ] **Test API endpoints**
  ```bash
  # Health check
  curl http://localhost:3000/api/health

  # Auth status
  curl http://localhost:3000/api/auth/session

  # Patterns
  curl http://localhost:3000/api/insights/patterns
  ```

#### 6.2 Staging Environment Testing

- [ ] **Deploy to staging environment**
  - [ ] Netlify deploy-preview OR
  - [ ] Vercel preview deployment OR
  - [ ] Dedicated staging environment

- [ ] **Smoke test all pages**
  - [ ] / (homepage)
  - [ ] /auth/login
  - [ ] /auth/register
  - [ ] /dashboard
  - [ ] /insights/patterns
  - [ ] /insights/recommendations
  - [ ] /resources/best-practices
  - [ ] /api/health

- [ ] **Test authentication flows**
  - [ ] Email/password registration
  - [ ] Email/password login
  - [ ] OAuth login (if configured)
  - [ ] Password reset (if configured)
  - [ ] Session persistence
  - [ ] Logout

- [ ] **Test database operations**
  - [ ] Create operations (user registration)
  - [ ] Read operations (dashboard data)
  - [ ] Update operations (user profile)
  - [ ] Delete operations (if applicable)

- [ ] **Test error handling**
  - [ ] Invalid form submissions
  - [ ] Unauthenticated access to protected routes
  - [ ] 404 page displays
  - [ ] 500 error handling

#### 6.3 Performance Testing

- [ ] **Run Lighthouse audit**
  Target scores:
  - Performance: > 90
  - Accessibility: > 95
  - Best Practices: > 95
  - SEO: > 90

- [ ] **Check Core Web Vitals**
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1

- [ ] **Test on different devices**
  - [ ] Desktop (Chrome, Firefox, Safari)
  - [ ] Mobile (iOS Safari, Android Chrome)
  - [ ] Tablet

- [ ] **Test on slow network**
  Chrome DevTools → Network → Slow 3G
  - [ ] Page still loads and is usable
  - [ ] Loading states display correctly
  - [ ] No timeout errors

#### 6.4 Security Testing

- [ ] **Test security headers**
  ```bash
  curl -I https://staging-url.com | grep -E "(Strict-Transport|X-Content-Type|X-Frame|CSP)"
  ```

- [ ] **Check for exposed secrets**
  View page source, check Network tab
  - [ ] No API keys in client code
  - [ ] No database credentials exposed
  - [ ] Environment variables not leaked

- [ ] **Test authentication security**
  - [ ] Cannot access dashboard without login
  - [ ] Session expires after timeout
  - [ ] CSRF protection working
  - [ ] XSS protection working

- [ ] **Run security scan**
  - [ ] OWASP ZAP scan OR
  - [ ] Burp Suite scan OR
  - [ ] Snyk web scan
  Expected: No HIGH/CRITICAL findings

---

### Phase 7: Monitoring and Alerting (HIGH PRIORITY)

#### 7.1 Error Tracking

- [ ] **Set up Sentry (or alternative)**
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard -i nextjs
  ```

- [ ] **Configure Sentry**
  - [ ] DSN added to environment variables
  - [ ] Source maps uploaded
  - [ ] Release tracking configured
  - [ ] Alert rules configured

- [ ] **Test error tracking**
  - [ ] Trigger test error
  - [ ] Verify appears in Sentry dashboard
  - [ ] Verify alert notification received

#### 7.2 Uptime Monitoring

- [ ] **Set up uptime monitor**
  Options: UptimeRobot | Pingdom | StatusCake

- [ ] **Configure checks**
  - [ ] Homepage (/)
  - [ ] API health (/api/health)
  - [ ] Login page (/auth/login)
  - [ ] Check interval: 5 minutes

- [ ] **Configure alerts**
  - [ ] Email notifications
  - [ ] Slack notifications (optional)
  - [ ] SMS for critical (optional)

#### 7.3 Performance Monitoring

- [ ] **Set up performance monitoring**
  Options: Vercel Analytics | New Relic | Datadog

- [ ] **Configure metrics**
  - [ ] Response time tracking
  - [ ] Throughput (requests/minute)
  - [ ] Error rate
  - [ ] Apdex score

#### 7.4 Log Aggregation

- [ ] **Set up log aggregation**
  Options: Logtail | Papertrail | Loggly

- [ ] **Configure log forwarding**
  - [ ] Application logs
  - [ ] Error logs
  - [ ] Access logs
  - [ ] Database query logs

- [ ] **Set up log alerts**
  - [ ] Error rate > threshold
  - [ ] Specific error patterns
  - [ ] Authentication failures

---

### Phase 8: Documentation (MEDIUM PRIORITY)

#### 8.1 Deployment Documentation

- [ ] **Update README.md**
  - [ ] Production deployment instructions
  - [ ] Environment variable requirements
  - [ ] Known issues and workarounds

- [ ] **Create runbook**
  - [ ] Common operational tasks
  - [ ] Troubleshooting guide
  - [ ] Escalation procedures

- [ ] **Document rollback procedure**
  - [ ] Step-by-step rollback instructions
  - [ ] Database rollback procedure
  - [ ] Emergency contacts

#### 8.2 API Documentation

- [ ] **API endpoints documented**
  - [ ] Authentication endpoints
  - [ ] User endpoints
  - [ ] Insights endpoints
  - [ ] Request/response examples

- [ ] **Rate limits documented**
  - [ ] Per endpoint limits
  - [ ] Global limits
  - [ ] Handling rate limit errors

---

### Phase 9: Team Preparation (MEDIUM PRIORITY)

#### 9.1 Team Communication

- [ ] **Deployment schedule communicated**
  - [ ] Deployment date/time
  - [ ] Expected duration
  - [ ] Maintenance window (if needed)
  - [ ] Rollback deadline

- [ ] **On-call rotation established**
  - [ ] Primary on-call: ________________
  - [ ] Secondary on-call: ________________
  - [ ] Escalation contacts

- [ ] **Incident response plan reviewed**
  - [ ] Team members know their roles
  - [ ] Communication channels established
  - [ ] Post-incident review process defined

#### 9.2 Access and Permissions

- [ ] **Team has necessary access**
  - [ ] Deployment platform (Netlify/Vercel)
  - [ ] GitHub repository
  - [ ] Database (Supabase)
  - [ ] Monitoring tools (Sentry, etc.)
  - [ ] Domain registrar / DNS

- [ ] **2FA enabled for all team members**
  - [ ] GitHub
  - [ ] Deployment platform
  - [ ] Database platform
  - [ ] Domain registrar

---

## Deployment Execution Checklist

### Pre-Deployment (Day Before)

**Time: T-24 hours**

- [ ] **Final code freeze**
  - [ ] All PRs merged
  - [ ] All tests passing
  - [ ] All security scans clean

- [ ] **Verify checklist completion**
  - [ ] All CRITICAL items complete
  - [ ] All HIGH PRIORITY items complete
  - [ ] Document any skipped items

- [ ] **Stakeholder notification**
  - [ ] Email to stakeholders
  - [ ] Deployment window confirmed
  - [ ] Support team notified

- [ ] **Backup verification**
  - [ ] Database backup complete
  - [ ] Backup restoration tested
  - [ ] Backup stored securely

### Deployment Day

**Time: T-4 hours**

- [ ] **Pre-flight checks**
  - [ ] All monitoring systems operational
  - [ ] Team members available
  - [ ] Communication channels active

- [ ] **Final smoke test on staging**
  - [ ] All critical paths working
  - [ ] No console errors
  - [ ] Performance acceptable

**Time: T-1 hour**

- [ ] **Create release tag**
  ```bash
  git tag -a v1.0.0 -m "Production release v1.0.0"
  git push origin v1.0.0
  ```

- [ ] **Announce deployment starting**
  - [ ] Slack/Teams notification
  - [ ] Status page update (if applicable)

**Time: T (Deployment)**

- [ ] **Trigger production deployment**
  - [ ] Via platform dashboard OR
  - [ ] Via git push to production branch

- [ ] **Monitor deployment progress**
  - [ ] Watch build logs
  - [ ] Check for errors
  - [ ] Verify each step completes

- [ ] **Verify deployment success**
  - [ ] Platform shows deployment complete
  - [ ] Build status: SUCCESS
  - [ ] No error alerts triggered

**Time: T+5 minutes**

- [ ] **Immediate smoke tests**
  - [ ] Homepage loads
  - [ ] API health endpoint responds
  - [ ] Login page accessible
  - [ ] No JavaScript console errors

**Time: T+15 minutes**

- [ ] **Comprehensive verification**
  - [ ] Test all critical user flows
  - [ ] Verify database connectivity
  - [ ] Check error rates in monitoring
  - [ ] Verify performance metrics

**Time: T+30 minutes**

- [ ] **Extended monitoring**
  - [ ] Check Sentry for new errors
  - [ ] Review application logs
  - [ ] Monitor response times
  - [ ] Check resource usage

**Time: T+1 hour**

- [ ] **Announce deployment complete**
  - [ ] Slack/Teams notification
  - [ ] Stakeholder email
  - [ ] Status page update

### Post-Deployment (24-48 hours)

**Day 1:**

- [ ] **Continuous monitoring**
  - [ ] Check error rates every 2 hours
  - [ ] Review user feedback
  - [ ] Monitor performance metrics
  - [ ] Watch for anomalies

- [ ] **User acceptance**
  - [ ] Collect initial user feedback
  - [ ] Address any reported issues
  - [ ] Document any workarounds

**Day 2:**

- [ ] **Performance review**
  - [ ] Analyze response time trends
  - [ ] Check database query performance
  - [ ] Review resource utilization
  - [ ] Identify optimization opportunities

- [ ] **Post-deployment report**
  - [ ] Deployment success metrics
  - [ ] Issues encountered and resolved
  - [ ] Lessons learned
  - [ ] Recommendations for next deployment

---

## Rollback Procedure

**When to Rollback:**
- Critical functionality broken
- Data integrity issues
- Security vulnerability exposed
- Error rate > 5%
- Performance degradation > 50%

### Immediate Rollback (< 5 minutes)

**Netlify:**
1. Go to Netlify Dashboard → Deploys
2. Find last working deploy
3. Click "Publish deploy"
4. Verify rollback successful

**Vercel:**
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click ... menu → "Promote to Production"
4. Verify rollback successful

**Git Revert:**
```bash
git revert HEAD
git push origin main
# Wait for automatic redeployment
```

### Post-Rollback Actions

- [ ] **Verify application working**
  - [ ] Run smoke tests
  - [ ] Check error rates
  - [ ] Monitor user feedback

- [ ] **Communicate rollback**
  - [ ] Notify team
  - [ ] Update stakeholders
  - [ ] Update status page

- [ ] **Root cause analysis**
  - [ ] Identify what went wrong
  - [ ] Document findings
  - [ ] Create fix plan
  - [ ] Schedule new deployment

- [ ] **Database rollback (if needed)**
  - [ ] Restore from backup
  - [ ] Verify data integrity
  - [ ] Communicate data loss (if any)

---

## Emergency Contacts

**Primary On-Call:** ________________
**Phone:** ________________
**Email:** ________________

**Secondary On-Call:** ________________
**Phone:** ________________
**Email:** ________________

**Technical Lead:** Jonathan Anderson (PresidentAnderson)
**Email:** contact@axaiinovations.com

**Platform Support:**
- **Netlify:** support@netlify.com
- **Vercel:** support@vercel.com
- **Supabase:** support@supabase.com
- **GitHub:** support@github.com

---

## Sign-Off

**Pre-Deployment Approval:**

- [ ] Technical Lead: ________________ Date: ________
- [ ] Security Review: ________________ Date: ________
- [ ] Product Owner: ________________ Date: ________

**Deployment Executed By:**

Name: ________________
Date: ________________
Time: ________________

**Deployment Verified By:**

Name: ________________
Date: ________________
Time: ________________

---

## Notes and Observations

Use this section to document any issues, workarounds, or observations during deployment:

```
Date/Time | Issue/Observation | Resolution | Owner
----------|-------------------|-----------|-------
          |                   |           |
          |                   |           |
          |                   |           |
```

---

**Checklist Version:** 1.0.0
**Next Review Date:** After first production deployment
**Maintained By:** AXAI Innovations
**Last Updated:** October 29, 2025
