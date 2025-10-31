# Audit Reports

## Purpose
Security and dependency audit reports for monitoring project health.

## What's Inside

### Audit Files
- **audit-api.json** - API dependencies audit
- **audit-root.json** - Root package audit
- **audit-web.json** - Web app dependencies audit

## File Format
JSON files containing npm/pnpm audit results with:
- Vulnerability reports
- Severity levels (low, moderate, high, critical)
- Affected packages
- Recommended fixes

## When to Use
- Reviewing security vulnerabilities
- Planning dependency updates
- Security compliance checks
- Understanding security posture

## How to Update
```bash
# Run audits
pnpm audit --json > config/audits/audit-root.json
pnpm --filter @wisdomos/api audit --json > config/audits/audit-api.json
pnpm --filter @wisdomos/web audit --json > config/audits/audit-web.json
```

## Importance: ⭐⭐⭐⭐
Critical for maintaining security and identifying vulnerable dependencies.
