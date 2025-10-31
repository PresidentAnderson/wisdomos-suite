# WisdomOS Vercel Deployment Fix

## Issues Identified and Fixed

### 1. Package Manager Conflicts
- **Problem**: Mixed pnpm workspace with npm package-lock.json files causing registry errors
- **Solution**: Configured Vercel to use npm exclusively for deployment while keeping pnpm for local development

### 2. Monorepo Configuration
- **Problem**: Root vercel.json not properly configured for monorepo structure
- **Solution**: Updated to point specifically to `apps/web` directory with correct build commands

### 3. Registry Errors (ERR_INVALID_THIS)
- **Problem**: npm registry issues during Vercel build
- **Solution**: 
  - Added explicit registry configuration
  - Used `npm ci --prefer-offline --no-audit` to avoid registry timeouts
  - Set environment variables to ensure consistent npm behavior

## Configuration Files Updated

### `/vercel.json` (Root)
```json
{
  "buildCommand": "cd apps/web && npm ci --prefer-offline --no-audit && npm run build",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "installCommand": "cd apps/web && npm ci --prefer-offline --no-audit",
  "nodeVersion": "18.x",
  "env": {
    "NPM_CONFIG_CACHE": "/tmp/.npm",
    "NEXT_TELEMETRY_DISABLED": "1",
    "NPM_CONFIG_REGISTRY": "https://registry.npmjs.org/"
  }
}
```

### `/apps/web/vercel.json`
```json
{
  "buildCommand": "npm ci && npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm ci --prefer-offline --no-audit",
  "nodeVersion": "18.x",
  "functions": {
    "app/**": {
      "maxDuration": 30
    }
  },
  "env": {
    "NPM_CONFIG_CACHE": "/tmp/.npm",
    "NEXT_TELEMETRY_DISABLED": "1"
  }
}
```

### `/apps/web/.npmrc`
```
registry=https://registry.npmjs.org/
audit=false
fund=false
loglevel=error
prefer-offline=true
cache=/tmp/.npm
```

### `/.vercelignore`
Optimizes deployment by excluding unnecessary directories:
- `apps/api/`, `apps/mobile/`, `apps/community/`
- `database/`, `docker/`, `scripts/`, `supabase/`
- Cache directories and development files

## Deployment Steps

### Option 1: Using Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy from project root
vercel --prod
```

### Option 2: Using Git Integration
1. Connect your repository to Vercel
2. Push changes to your main branch
3. Vercel will automatically deploy using the new configuration

### Option 3: Using Deployment Script
```bash
# Run the deployment preparation script
./deploy-vercel.sh

# Then deploy with Vercel CLI
vercel --prod
```

## Key Changes Made

1. **Registry Configuration**: Explicitly set npm registry to avoid ERR_INVALID_THIS errors
2. **Build Optimization**: Use `npm ci` instead of `npm install` for faster, deterministic builds
3. **Cache Management**: Configure npm cache to `/tmp/.npm` for Vercel environment
4. **Monorepo Support**: Properly point to `apps/web` as the deployment target
5. **Error Prevention**: Disable audit and fund to avoid unnecessary network calls

## Environment Variables (Optional)

Add these to your Vercel project if needed:
- `NEXT_TELEMETRY_DISABLED=1` (already in vercel.json)
- Any database URLs or API keys your app requires

## Testing the Deployment

1. Ensure the configuration works locally:
   ```bash
   cd apps/web
   npm ci
   npm run build
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## Troubleshooting

### If deployment still fails:
1. Check Vercel build logs for specific errors
2. Ensure all required environment variables are set
3. Verify that `apps/web/package.json` has all necessary dependencies
4. Try deploying with `--debug` flag: `vercel --prod --debug`

### Common Issues:
- **Missing dependencies**: Ensure all imports in your code have corresponding packages in `package.json`
- **Environment variables**: Add any required env vars in Vercel dashboard
- **Build timeout**: Increase function timeout in vercel.json if needed

The deployment should now work without the previous npm registry errors.