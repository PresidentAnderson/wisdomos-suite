# Frequently Asked Questions

Common questions about WisdomOS.

## General Questions

### What is WisdomOS?

WisdomOS is a life transformation platform based on phoenix mythology. It helps you track 13 life areas, journal your journey, and transform from breakdown (ashes) to thriving (flight).

### Is WisdomOS free?

Yes, there's a free tier with basic features. Premium tiers offer:
- AI-powered reframing
- HubSpot integration
- Multi-user organizations
- API access
- Custom branding

### What's the Phoenix Cycle?

The Phoenix Cycle is a four-phase transformation framework:

1. **Ashes**: Reflection on breakdowns and upsets
2. **Fire**: Breakthrough conversations and reframing
3. **Rebirth**: Tracking fulfillment and progress
4. **Flight**: Archiving wisdom and legacy

### How is this different from a journal app?

WisdomOS combines:
- Structured life area tracking
- AI-powered insight detection
- Gamification and motivation
- CRM integration (HubSpot)
- Multi-tenant organization support
- Transformation methodology (Phoenix Cycle)

## Installation & Setup

### What are the system requirements?

- Node.js 18+
- 4GB RAM minimum (8GB recommended)
- 2GB disk space
- Modern browser (Chrome, Firefox, Safari, Edge)

### Do I need a database?

Yes. WisdomOS requires PostgreSQL. We recommend Supabase (free tier available) for easy setup.

### Can I use it offline?

The web app requires internet connection. The mobile app (coming soon) will support offline mode with sync when online.

### How do I update WisdomOS?

```bash
git pull origin main
pnpm install
pnpm db:migrate
pnpm dev
```

## Usage Questions

### How do I know if a life area is red, yellow, or green?

Color status is calculated from:
- Your self-assessment score (1-10)
- Recent journal entries (upset detection)
- Commitment status (kept vs broken)

Algorithm:
- **Green**: Score 8-10, no broken commitments
- **Yellow**: Score 4-7, or some upsets
- **Red**: Score 1-3, or multiple broken commitments

### Can I customize the life areas?

Currently the 13 canonical life areas are fixed. Custom life areas are planned for a future release.

### How does AI reframing work?

When you journal an upset, AI:
1. Detects emotional language patterns
2. Identifies the core breakdown
3. Generates reframing questions
4. Helps you see new perspectives

AI reframing requires API keys and is available in premium tiers.

### What's a "contribution"?

A contribution is something you're actively giving to a life area:
- **Work**: Leading a project
- **Health**: Daily exercise routine
- **Relationships**: Weekly quality time

Tracking contributions helps you see where you're investing energy.

### How do I earn badges?

Badges unlock automatically as you:
- Complete journal entries
- Keep commitments
- Transform life areas
- Maintain consistency

View all badges in Profile → Achievements.

### Can I export my data?

Yes. Go to Settings → Export Data to download:
- All journal entries (PDF or JSON)
- Life area history (CSV)
- Commitment tracking (CSV)
- Badge achievements (PDF)

## Technical Questions

### What technology stack is used?

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: NestJS, tRPC, Prisma
- **Database**: PostgreSQL (Supabase)
- **Mobile**: React Native (Expo)
- **Deployment**: Vercel, Netlify, Docker

### Is the code open source?

WisdomOS uses a hybrid model:
- **Core platform**: Proprietary
- **UI components**: Open source (MIT)
- **Plugins**: Open source (MIT)

See [IP Protection](../security/ip-protection.md) for details.

### How do I contribute code?

1. Read [Contributing Guide](../contributing/README.md)
2. Check [open issues](https://github.com/yourusername/wisdomos/issues)
3. Fork repository
4. Submit pull request

### What's the monorepo structure?

WisdomOS uses Turborepo:
```
apps/
  ├── web/       # Next.js web app
  ├── api/       # NestJS API
  └── mobile/    # React Native app
packages/
  ├── database/  # Prisma schemas
  ├── ui/        # Shared components
  └── core/      # Business logic
```

### How do I run tests?

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

## Deployment Questions

### Where can I deploy WisdomOS?

Supported platforms:
- **Vercel** (recommended for web)
- **Netlify**
- **Docker** (any cloud)
- **Railway** (API server)
- **Render**

See [Deployment Guide](../guides/deployment/README.md).

### How do I set up multi-tenancy?

1. Enable in config: `FEATURE_MULTI_TENANCY=true`
2. Configure wildcard DNS: `*.yourdomain.com`
3. Set app domain: `NEXT_PUBLIC_APP_DOMAIN=yourdomain.com`
4. Each organization gets subdomain: `org.yourdomain.com`

See [Multi-Tenancy Guide](../features/multi-tenancy.md).

### What about SSL/HTTPS?

- **Vercel/Netlify**: Automatic SSL
- **Docker**: Use Nginx with Let's Encrypt
- **Custom domain**: Configure in platform settings

### How do I configure HubSpot integration?

1. Create HubSpot Private App
2. Add API key to `.env.local`:
   ```
   HUBSPOT_API_KEY=pat-na1-xxxxx
   HUBSPOT_WEBHOOK_SECRET=your-secret
   ```
3. Configure webhook URL in HubSpot:
   ```
   https://yourdomain.com/api/webhooks/hubspot
   ```

See [HubSpot Integration](../features/hubspot-integration.md).

## Security Questions

### How is my data protected?

- **Encryption**: Data encrypted at rest and in transit
- **RLS**: Row-level security policies in database
- **Auth**: JWT-based authentication
- **Isolation**: Multi-tenant data isolation
- **Backups**: Automatic daily backups

See [Security Overview](../security/README.md).

### Who can see my journal entries?

Journal entries are:
- Private by default
- Only visible to you
- Encrypted in database
- Not shared with other users

Organization admins can see:
- Aggregated metrics (no entry content)
- Life area trends
- Commitment completion rates

### How do I report a security vulnerability?

Email: security@wisdomos.app

See [Vulnerability Reporting](../security/vulnerability-reporting.md).

### Are environment variables secure?

Never commit secrets to git:
- Use `.env.local` (gitignored)
- Use platform secret managers in production
- Rotate keys regularly
- Use least-privilege access

See [Secrets Management](../security/secrets-management.md).

## Troubleshooting

### Development server won't start

Check:
1. Node.js version: `node --version` (should be 18+)
2. Dependencies installed: `pnpm install`
3. Port not in use: `lsof -ti:3011`
4. Environment variables set: Check `.env.local`

### Database connection fails

1. Verify Supabase project is active
2. Check connection string is correct
3. Ensure IP is allowlisted (Supabase → Settings → Database)
4. Test connection: `psql "$DATABASE_URL"`

### API requests failing

1. Check API is running: `curl http://localhost:8080/health`
2. Verify CORS settings
3. Check `NEXT_PUBLIC_API_URL` matches API port
4. Look at browser console for errors

### Prisma schema sync issues

```bash
# Reset and regenerate
rm -rf node_modules/.prisma
pnpm db:generate
pnpm db:push
```

### Build errors in production

1. Check all environment variables are set
2. Verify Node.js version matches
3. Clear build cache: `rm -rf .next`
4. Check logs for specific errors

### Mobile app issues

```bash
# Clear cache
rm -rf node_modules
pnpm install

# Reset Expo cache
cd apps/mobile
npx expo start --clear
```

## Performance Questions

### How do I improve load time?

- Enable caching: `CACHE_ENABLED=true`
- Use CDN for assets
- Optimize images (WebP format)
- Enable Next.js ISR (Incremental Static Regeneration)

### Database queries are slow

1. Check indexes are created
2. Use Prisma query analyzer
3. Enable query logging: `ENABLE_QUERY_LOGGING=true`
4. Add database connection pooling

### Can it handle large organizations?

Yes. WisdomOS scales to:
- Thousands of users per tenant
- Millions of journal entries
- Real-time updates
- Horizontal scaling (Docker/K8s)

## Feature Requests

### How do I request a feature?

1. Check [existing issues](https://github.com/yourusername/wisdomos/issues)
2. Create new issue with "Feature Request" label
3. Describe use case and benefits
4. Join discussion in GitHub Discussions

### What's on the roadmap?

See [Project Roadmap](../README.md#roadmap) for planned features:
- Custom life areas
- Team collaboration features
- Advanced analytics
- Mobile apps (iOS/Android)
- Plugin marketplace
- White-label options

### Can I build custom integrations?

Yes! Options:
1. Use the tRPC API endpoints
2. Build webhooks
3. Create plugins (coming soon)
4. Fork and customize (check license)

## Still Have Questions?

- **Documentation**: Browse [full documentation](./README.md)
- **Community**: [GitHub Discussions](https://github.com/yourusername/wisdomos/discussions)
- **Support**: support@wisdomos.app
- **Bugs**: [GitHub Issues](https://github.com/yourusername/wisdomos/issues)

---

**Didn't find your answer?** Ask in [GitHub Discussions](https://github.com/yourusername/wisdomos/discussions) →
