# 🚀 Auth0 Quick Start Guide

## Prerequisites

- Auth0 account with WisdomOS API configured
- Node.js 18+ installed
- WisdomOS Phase 3 project cloned

## 5-Minute Setup

### 1. Install Auth0 SDK (30 seconds)

```bash
cd apps/web
npm install @auth0/nextjs-auth0
```

### 2. Configure Environment (2 minutes)

Create `apps/web/.env.local`:

```bash
AUTH0_SECRET='<run: openssl rand -hex 32>'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://dev-m3j455d2hx0gmorh.us.auth0.com'
AUTH0_CLIENT_ID='<from Auth0 dashboard>'
AUTH0_CLIENT_SECRET='<from Auth0 dashboard>'
AUTH0_AUDIENCE='https://api.wisdomos.com'
AUTH0_SCOPE='openid profile email read:users update:users'
NEXT_PUBLIC_ENABLE_AUTH0='true'
```

### 3. Create Files (2 minutes)

Follow the detailed guide: `AUTH0_INTEGRATION_GUIDE.md`

**Required files:**
1. `app/api/auth/[auth0]/route.ts` - Auth0 handler
2. `app/api/auth/sync-user/route.ts` - User mapper
3. `components/auth/Auth0LoginButton.tsx` - Login button
4. `components/auth/LoginModeSelector.tsx` - Mode switcher
5. `lib/auth0-user-mapper.ts` - Mapping utilities

**Update existing files:**
1. `lib/auth.ts` - Add `auth0Sub?: string` to User interface
2. `app/auth/login/page.tsx` - Add mode selector
3. `lib/auth-context.tsx` - Check Auth0 session
4. `app/layout.tsx` - Wrap with UserProvider

### 4. Test (30 seconds)

```bash
npm run dev
```

Visit: `http://localhost:3000/auth/login`

**Test Demo Mode:**
- Email: `demo@wisdomos.com`
- Password: `password123`

**Test Auth0:**
- Click "Enterprise SSO"
- Login with Auth0 account

## File Checklist

### New Files (Create These)
- [ ] `app/api/auth/[auth0]/route.ts`
- [ ] `app/api/auth/sync-user/route.ts`
- [ ] `components/auth/Auth0LoginButton.tsx`
- [ ] `components/auth/LoginModeSelector.tsx`
- [ ] `lib/auth0-user-mapper.ts`

### Modified Files (Update These)
- [ ] `lib/auth.ts` - Add `auth0Sub` to User
- [ ] `app/auth/login/page.tsx` - Add mode selector
- [ ] `lib/auth-context.tsx` - Check Auth0 session
- [ ] `app/layout.tsx` - Add UserProvider
- [ ] `.env.example` - Add Auth0 variables

## Auth0 Dashboard Setup

1. **Applications → Applications → Settings**
   - Add callback: `http://localhost:3000/api/auth/callback`
   - Add logout: `http://localhost:3000`
   - Add origin: `http://localhost:3000`

2. **APIs → WisdomOS API**
   - Copy Identifier → `AUTH0_AUDIENCE`

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           WisdomOS Login Page                   │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  Login Mode Selector                    │  │
│  │  [ Demo Mode ] [ Enterprise SSO ]       │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  IF Demo Mode:                                  │
│  ┌─────────────────┐                            │
│  │ Email/Password  │ → localStorage Auth        │
│  └─────────────────┘                            │
│                                                 │
│  IF Enterprise SSO:                             │
│  ┌─────────────────┐                            │
│  │ Auth0 Button    │ → /api/auth/login          │
│  └─────────────────┘    ↓                       │
│                         Auth0 Universal Login   │
│                         ↓                        │
│                         /api/auth/callback      │
│                         ↓                        │
│                         /api/auth/sync-user     │
│                         ↓                        │
│                         Create/Update User      │
│                         ↓                        │
│                         Redirect to Dashboard   │
└─────────────────────────────────────────────────┘
```

## Key Benefits

✅ **Dual Mode Support:**
- Demo account for testing (no signup needed)
- Auth0 for production users

✅ **Auto-Provisioning:**
- New Auth0 users → Auto-create WisdomOS account + tenant
- Existing users → Update last login

✅ **Seamless Integration:**
- Preserves multi-tenant architecture
- Works with existing demo data
- No breaking changes

## Common Commands

```bash
# Install dependency
npm install @auth0/nextjs-auth0

# Generate secret
openssl rand -hex 32

# Start dev server
npm run dev

# Check Auth0 SDK version
npm list @auth0/nextjs-auth0

# Build for production
npm run build
```

## Environment Variables Quick Reference

```bash
# Required
AUTH0_SECRET=                    # Secret key (32 bytes hex)
AUTH0_BASE_URL=                  # Your app URL
AUTH0_ISSUER_BASE_URL=           # Auth0 tenant URL
AUTH0_CLIENT_ID=                 # Application Client ID
AUTH0_CLIENT_SECRET=             # Application Client Secret
AUTH0_AUDIENCE=                  # API Identifier
AUTH0_SCOPE=                     # Requested permissions
NEXT_PUBLIC_ENABLE_AUTH0=        # Enable/disable feature
```

## Troubleshooting

**Issue:** Mode selector not showing
- Check: `NEXT_PUBLIC_ENABLE_AUTH0='true'` in `.env.local`

**Issue:** Auth0 callback error
- Check: Callback URL in Auth0 dashboard matches exactly

**Issue:** User not syncing
- Check: Browser console for errors
- Check: `/api/auth/sync-user` logs

**Issue:** Session not persisting
- Check: `appSession` cookie exists
- Check: `AUTH0_BASE_URL` is correct

## Full Documentation

For complete implementation details, see:
- `AUTH0_INTEGRATION_GUIDE.md` - Comprehensive guide
- `LOGIN_FIX_SUMMARY.md` - Recent auth fixes
- `AUTH_DEBUG_REPORT.md` - Debugging guide

## Support

- **Auth0 Docs:** https://auth0.com/docs/quickstart/webapp/nextjs
- **GitHub Issues:** Report bugs with "[Auth0]" prefix
- **Demo Video:** Coming soon

---

**Ready to implement? Open `AUTH0_INTEGRATION_GUIDE.md` and follow step-by-step!**
