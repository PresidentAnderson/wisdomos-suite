# Security Overview

WisdomOS security practices and policies.

## Security Features

- **Encryption**: Data encrypted at rest and in transit
- **Authentication**: JWT with token rotation
- **Authorization**: Role-based access control (RBAC)
- **RLS**: Row-level security in database
- **HTTPS**: TLS 1.3 enforced
- **Headers**: Security headers configured
- **Rate Limiting**: DDoS protection
- **Input Validation**: Zod schemas

## Best Practices

### For Users
- Use strong passwords (12+ characters)
- Enable 2FA when available
- Don't share credentials
- Review access regularly

### For Developers
- Never commit secrets
- Use environment variables
- Rotate API keys regularly
- Follow principle of least privilege
- Keep dependencies updated

## Reporting Vulnerabilities

Email: security@wisdomos.app

**Do NOT** open public issues for security vulnerabilities.

See [Vulnerability Reporting](./vulnerability-reporting.md) for details.

## Compliance

- GDPR compliant (data export/deletion)
- SOC 2 Type II (in progress)
- HIPAA compliant architecture (available)

See [IP Protection](./ip-protection.md) and [Secrets Management](./secrets-management.md).
