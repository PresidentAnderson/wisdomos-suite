# 🚀 Step 3: Deploy WisdomOS Web to Netlify

## Prerequisites ✅
- ✅ GitHub repositories created
- ✅ Supabase secrets configured  
- ✅ Real-time WebSocket URLs added
- ✅ Netlify account ready

## 🔗 Quick Deploy Options

### Option 1: One-Click Deploy (Recommended)
```bash
# Deploy directly from GitHub
https://app.netlify.com/start/deploy?repository=https://github.com/presidentanderson/wisdomos-web
```

### Option 2: Netlify CLI Deploy
```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from current directory
netlify deploy --prod --dir=apps/web/out
```

## 📋 Netlify Configuration

### Build Settings
- **Base directory**: ` ` (leave empty)
- **Build command**: `pnpm install && pnpm db:generate && pnpm --filter @wisdomos/web build`
- **Publish directory**: `apps/web/out`
- **Node version**: `20`

### Environment Variables to Add in Netlify
Copy these from your repository secrets to Netlify dashboard:

```bash
# Required for build
NODE_ENV=production
PNPM_VERSION=8.15.0

# Supabase Configuration  
SUPABASE_URL=https://dcvpixqvzqibwwobyfji.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js Public Variables
NEXT_PUBLIC_SUPABASE_URL=https://dcvpixqvzqibwwobyfji.supabase.co  
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_REALTIME_URL=wss://dcvpixqvzqibwwobyfji.supabase.co/realtime/v1/websocket

# NextAuth (generate random string)
NEXTAUTH_SECRET=your-nextauth-secret-32-characters-min
NEXTAUTH_URL=https://your-site.netlify.app

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

## 🔧 Real-time Features Configuration

Your cursor tracking code will work with this setup:

```typescript
// apps/web/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// Real-time cursor tracking
const channel = supabase.channel('collaboration-room')
  .on('broadcast', { event: 'cursor-pos' }, payload => {
    console.log('Cursor position received!', payload)
  })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      channel.send({
        type: 'broadcast',
        event: 'cursor-pos', 
        payload: { x: Math.random(), y: Math.random() },
      })
    }
  })

export { supabase, channel }
```

## 🌐 Deployment Steps

### 1. Connect Repository to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import from Git"
3. Choose GitHub and select `presidentanderson/wisdomos-web`
4. Configure build settings (see above)

### 2. Add Environment Variables
1. Go to Site Settings → Environment Variables
2. Add all the variables listed above
3. Click "Save"

### 3. Deploy!
1. Trigger deploy from Netlify dashboard
2. Or push changes to your GitHub repository
3. Netlify will auto-deploy on every push to main

## 📊 Expected Build Output

```bash
✅ Installing dependencies with pnpm
✅ Generating Prisma client
✅ Building Next.js application  
✅ Static export complete
✅ Deploy successful!
```

## 🔍 Testing Your Deployment

### 1. Basic Functionality
- Visit your Netlify URL
- Check that the site loads without errors
- Verify Supabase connection in Network tab

### 2. Real-time Features  
```javascript
// Test in browser console
supabase
  .channel('test-channel')
  .on('broadcast', { event: 'test' }, console.log)
  .subscribe()
```

### 3. Database Connectivity
```javascript  
// Test database query
const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(1)
```

## 🚨 Troubleshooting

### Build Failures
- **"pnpm not found"**: Ensure `PNPM_VERSION=8.15.0` is set
- **"Prisma client not found"**: Check `db:generate` runs before build
- **"Environment variable missing"**: Verify all Next.js public vars are set

### Runtime Errors
- **Supabase connection failed**: Check URL and anon key
- **Real-time not working**: Verify WebSocket URL and enable realtime in Supabase
- **404 on routes**: Ensure `output: 'export'` in next.config.mjs

### Performance Issues
- Enable Netlify's image optimization
- Configure proper caching headers (already in netlify.toml)
- Use Supabase CDN for media files

## 🎯 Success Metrics

After successful deployment, you should have:
- ✅ **Live WisdomOS web application**  
- ✅ **Supabase database connectivity**
- ✅ **Real-time collaboration features**
- ✅ **Phoenix-themed UI rendering**
- ✅ **Mobile-responsive design**
- ✅ **SSL certificate (automatic)**

## 🔄 Continuous Deployment

### Auto-deploy Setup
- ✅ **GitHub integration** - Deploy on push to main
- ✅ **Environment isolation** - Different configs for staging/production  
- ✅ **Preview deployments** - Every PR gets a preview URL
- ✅ **Rollback capability** - One-click rollback to previous versions

---

🔥 **Your Phoenix is ready to rise on the web!**

Once deployed, share your Netlify URL and let's verify everything is working perfectly.