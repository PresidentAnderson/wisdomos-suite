# WisdomOS Phase 3 - 1Password Credentials Guide

## How to Store in 1Password

Create a new **Secure Note** or **Server** item in 1Password with the following structure:

---

## Item Name: WisdomOS Phase 3 - Development Environment

### Supabase Configuration

**Project URL:**
```
https://yvssmqyphqgvpkwudeoa.supabase.co
```

**Project Reference:**
```
yvssmqyphqgvpkwudeoa
```

**Anon/Public Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c3NtcXlwaHFndnBrd3VkZW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMDU4NjQsImV4cCI6MjA3MTU4MTg2NH0.3sPL2dBVvs6prTLb5hIjrPjoJRKOoSR4XSpYPZbFl-k
```

**Service Role Key (Private):**
```
[TO BE ADDED - Get from Supabase Dashboard → Project Settings → API]
```

**JWT Secret:**
```
[TO BE ADDED - Get from Supabase Dashboard → Project Settings → API → JWT Settings]
```

**Database Password:**
```
[TO BE ADDED - Password you set when creating Supabase project]
```

**Database URL:**
```
postgresql://postgres.yvssmqyphqgvpkwudeoa:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

### Application Secrets

**NextAuth Secret:**
```
[TO BE GENERATED - Run: openssl rand -base64 32]
```

**JWT Secret (App):**
```
[TO BE GENERATED - Run: openssl rand -base64 32]
```

**Master Encryption Key:**
```
[TO BE GENERATED - Run: openssl rand -base64 32]
```

---

### API Configuration

**Development URLs:**
- Web App: http://localhost:3000
- API Server: http://localhost:4000
- Community Hub: http://localhost:3002

**Production URLs:**
- Frontend: https://wisdomos-phoenix-frontend.vercel.app
- API: https://api-hehupjoe3-axaiinovation.vercel.app

---

### Third-Party Integrations (Optional)

**HubSpot:**
- Access Token: [TO BE ADDED]
- Portal ID: [TO BE ADDED]
- Private App Key: [TO BE ADDED]

**OpenAI:**
- API Key: [TO BE ADDED]

**Vercel:**
- Token: [TO BE ADDED]
- Org ID: [TO BE ADDED]
- Project ID: [TO BE ADDED]

**Analytics:**
- GA4 ID: [TO BE ADDED]
- GTM ID: [TO BE ADDED]

---

## 1Password CLI Integration

If you want to use 1Password CLI to inject secrets into your environment:

### Step 1: Install 1Password CLI
```bash
brew install --cask 1password-cli
```

### Step 2: Sign in
```bash
op signin
```

### Step 3: Create References in .env.local

Instead of storing secrets directly, use 1Password references:

```bash
# Example .env.local with 1Password references
NEXT_PUBLIC_SUPABASE_URL=op://Private/WisdomOS-Phase3/Supabase/url
NEXT_PUBLIC_SUPABASE_ANON_KEY=op://Private/WisdomOS-Phase3/Supabase/anon-key
SUPABASE_SERVICE_KEY=op://Private/WisdomOS-Phase3/Supabase/service-key
```

### Step 4: Run commands with 1Password
```bash
# Run dev server with secrets injected
op run -- npm run dev

# Run database commands
op run -- npm run db:generate
op run -- npm run db:push
```

---

## Security Best Practices

1. ✅ **Never commit .env.local to git** (already in .gitignore)
2. ✅ **Use different credentials for dev/staging/prod**
3. ✅ **Rotate the anon key** - it was exposed in conversation
4. ✅ **Use 1Password CLI for CI/CD pipelines**
5. ✅ **Enable 2FA on Supabase account**
6. ✅ **Restrict Supabase API keys by domain in production**
7. ✅ **Store Vercel tokens separately with minimal permissions**

---

## Quick Setup Checklist

- [ ] Store this document in 1Password as a Secure Note
- [ ] Add Supabase service_role key from dashboard
- [ ] Add database password from Supabase setup
- [ ] Generate NextAuth secret: `openssl rand -base64 32`
- [ ] Generate JWT secret: `openssl rand -base64 32`
- [ ] Generate Master Encryption Key: `openssl rand -base64 32`
- [ ] Update .env.local with all secrets
- [ ] Test database connection: `npm run db:test`
- [ ] Optional: Set up 1Password CLI for secret injection
- [ ] Optional: Add third-party API keys (HubSpot, OpenAI, etc.)

---

## Environment Variable Reference

Copy these to your .env.local after filling in the secrets:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yvssmqyphqgvpkwudeoa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from 1Password]
SUPABASE_SERVICE_KEY=[from 1Password]
SUPABASE_JWT_SECRET=[from 1Password]
DATABASE_URL=postgresql://postgres.yvssmqyphqgvpkwudeoa:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Security
JWT_SECRET=[from 1Password]
NEXTAUTH_SECRET=[from 1Password]
NEXTAUTH_URL=http://localhost:3000

# API
NEXT_PUBLIC_API_BASE=http://localhost:4000
API_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000

# Development
NODE_ENV=development
LOG_LEVEL=debug
PORT=4000
```

---

## Retrieving Secrets from 1Password

### Using 1Password App:
1. Open 1Password
2. Search for "WisdomOS Phase 3"
3. Copy the needed credential
4. Paste into .env.local

### Using 1Password CLI:
```bash
# Get a specific secret
op item get "WisdomOS-Phase3" --fields label=anon-key

# Inject all secrets and run command
op run -- npm run dev
```

---

## Support & Documentation

- **1Password CLI Docs**: https://developer.1password.com/docs/cli
- **Supabase Dashboard**: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa
- **WisdomOS Setup Guide**: ./SETUP_INSTRUCTIONS.md

---

**Created**: 2025-10-28
**Last Updated**: 2025-10-28
**Status**: Ready for credential population
