# Quick Deploy to Vercel - WisePlay Marketplace

## ONE-TIME SETUP (Do this first!)

### 1. Vercel Project Settings
```
Go to: Vercel Dashboard → Project Settings → General

Root Directory: apps/wiseplay-marketplace
```
**THIS IS CRITICAL** - Without this, Vercel won't find Next.js!

### 2. Add Environment Variables
```
Vercel Dashboard → Settings → Environment Variables

Required:
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
```

### 3. Deploy
Click "Deploy" or push to main branch.

## VERIFICATION

After deployment, check:
1. Build logs show "Next.js build succeeded"
2. No "No Next.js version detected" error
3. Prisma Client generated successfully
4. App loads at deployment URL

## TROUBLESHOOTING

### Error: "No Next.js version detected"
**Fix**: Set Root Directory to `apps/wiseplay-marketplace` in Vercel settings

### Error: "Prisma Client not generated"
**Fix**: Ensure `prisma` is in devDependencies and schema exists

### Error: "Module not found"
**Fix**: Clear build cache in Vercel and redeploy

## QUICK TEST

Test locally first:
```bash
cd apps/wiseplay-marketplace
pnpm install
prisma generate
pnpm build
```

If this works, Vercel deployment will work too!

## NEED HELP?
See full guide: `DEPLOYMENT.md`
