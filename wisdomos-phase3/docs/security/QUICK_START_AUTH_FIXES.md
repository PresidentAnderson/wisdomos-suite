# Quick Start: Authentication Fixes & Date of Birth Feature

## 🚀 What Was Fixed

1. ✅ **Analyzed authentication flow** - Registration and login APIs working correctly
2. ✅ **Added Date of Birth field** - For personalized 120-year life calendar
3. ✅ **Created life calendar utilities** - Age-based Phoenix phase mapping
4. ✅ **Built diagnostic tools** - Debug API for troubleshooting
5. ✅ **Fixed Netlify deployment** - Corrected build paths and configuration

---

## ⚡ Quick Setup (2 Minutes)

### 1. Update Database Schema
```bash
cd apps/web
npx prisma generate
npx prisma db push
```

### 2. Restart Dev Server
```bash
npm run dev
```

### 3. Test Registration
1. Go to http://localhost:3011/auth/register
2. Fill out form including Date of Birth
3. Create account
4. Should redirect to dashboard

---

## 🔍 Troubleshooting "User Not Found"

### Quick Diagnostic
```bash
# Check if user exists (development only)
curl "http://localhost:3011/api/debug/auth?email=your@email.com"
```

### Common Fixes

**If user not found after registration**:
```bash
# 1. Regenerate Prisma
cd apps/web && npx prisma generate

# 2. Check database connection
echo $DATABASE_URL

# 3. Restart server
npm run dev
```

**If date field not showing**:
```bash
# Clear cache and restart
rm -rf apps/web/.next
npm run dev
```

---

## 📚 Key Files Changed

| File | What Changed |
|------|-------------|
| `prisma/schema.prisma` | Added `dateOfBirth DateTime?` to User model |
| `app/api/auth/register/route.ts` | Accept and validate date of birth |
| `app/auth/register/page.tsx` | Added DOB field to registration form |
| `lib/life-calendar-utils.ts` | NEW: Age calculation & life stage mapping |
| `app/api/debug/auth/route.ts` | NEW: Diagnostic endpoint (dev only) |

---

## 🎯 Using Life Calendar Utils

```typescript
import { initializeLifeCalendar, formatLifeCalendar } from '@/lib/life-calendar-utils'

// On user registration or profile load
const dob = new Date('1990-05-15')
const calendar = initializeLifeCalendar(dob)

console.log(calendar)
// {
//   age: 35,
//   yearsPassed: 35,
//   yearsRemaining: 85,
//   percentComplete: 29.2,
//   currentLifeStage: { name: 'Ignition (Fire)', ... },
//   milestones: [...],
//   ...
// }
```

---

## 🐛 Debug Commands

```bash
# Check user exists
curl "http://localhost:3011/api/debug/auth?email=test@example.com"

# Test registration will work
curl -X POST http://localhost:3011/api/debug/auth/test-registration \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass1234","name":"Test","dateOfBirth":"1990-01-01"}'

# Check Prisma status
cd apps/web && npx prisma studio
```

---

## 📖 Full Documentation

- **Detailed Guide**: `AUTH_IMPROVEMENTS_SUMMARY.md`
- **Deployment**: `NETLIFY_DEPLOYMENT.md`
- **Checklist**: `NETLIFY_CHECKLIST.md`

---

## ✅ Testing Checklist

- [ ] Database updated (`npx prisma db push`)
- [ ] Dev server restarted
- [ ] Registration form shows DOB field
- [ ] Can create account with DOB
- [ ] User record saved in database
- [ ] Can login after registration
- [ ] Debug endpoint works (dev only)

---

## 🚢 Deploying to Netlify

```bash
# 1. Ensure environment variables set in Netlify dashboard
# 2. Push changes
git add .
git commit -m "feat: Add Date of Birth field and auth improvements"
git push origin main

# 3. Netlify will auto-deploy
# 4. Check build logs for any errors
```

**Required Netlify Environment Variables**:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

See `.env.netlify.example` for complete list.

---

## 💡 Pro Tips

1. **Life Calendar**: Call `initializeLifeCalendar()` once on login, cache in state
2. **DOB Optional**: Field is optional - gracefully handle null values
3. **Debug Tools**: Only work in development (NODE_ENV !== 'production')
4. **Privacy**: Consider GDPR implications of storing birth dates
5. **Future Enhancement**: Add profile page to let users update DOB

---

## 🆘 Still Having Issues?

1. Check browser console for errors
2. Check server logs: `npm run dev`
3. Use debug endpoint to check database
4. Verify DATABASE_URL is correct
5. Try with a different email address
6. Contact: contact@axaiinovations.com

---

**Quick Reference**: This is a condensed guide. For detailed information, see `AUTH_IMPROVEMENTS_SUMMARY.md`.
