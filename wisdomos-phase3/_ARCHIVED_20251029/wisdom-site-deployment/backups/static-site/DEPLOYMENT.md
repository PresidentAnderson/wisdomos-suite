# WisdomOS Deployment Documentation

**Last Updated**: January 19, 2025  
**Repository**: https://github.com/PresidentAnderson/wisdom-course-personal

## 🚀 Deployment Status

### ✅ GitHub
- **Repository**: https://github.com/PresidentAnderson/wisdom-course-personal
- **Branch**: main
- **Status**: Pushed successfully
- **Latest Commit**: Docker configuration added

### ✅ Vercel Production
- **URL**: https://wisdom-site-deployment-cnpx6stc8-axaiinovation.vercel.app
- **Status**: Deployed successfully
- **Deployment Time**: January 19, 2025
- **Features**:
  - Automatic SSL/TLS
  - Global CDN
  - Auto-scaling
  - GitHub integration for CI/CD

### 🐳 Docker Configuration
- **Image**: wisdom-site:latest
- **Port**: 8080:80
- **Status**: Configuration ready (Docker daemon required to build)
- **Files Created**:
  - `Dockerfile` - Multi-stage build with nginx
  - `nginx.conf` - Production-ready nginx configuration
  - `docker-compose.yml` - Container orchestration
  - `.dockerignore` - Build optimization
  - `build-docker.sh` - Build automation script

## 📦 Deployment Methods

### 1. Vercel Deployment (Recommended for Production)

```bash
# Deploy to production
npx vercel --prod

# Deploy preview
npx vercel

# Link to existing project
vercel link
```

**Features**:
- Zero-config deployment
- Automatic HTTPS
- Global edge network
- Preview deployments for PRs
- Environment variables support

### 2. Docker Deployment (For Self-Hosting)

```bash
# Build Docker image
./build-docker.sh

# Or manually:
docker build -t wisdom-site:latest .

# Run container
docker run -d -p 8080:80 --name wisdom-site wisdom-site:latest

# Using docker-compose
docker-compose up -d

# Stop container
docker-compose down
```

**Docker Hub Push** (Optional):
```bash
# Tag for Docker Hub
docker tag wisdom-site:latest yourusername/wisdom-site:latest

# Push to Docker Hub
docker push yourusername/wisdom-site:latest
```

### 3. GitHub Pages (Alternative)

Since this is a static site, it can also be deployed to GitHub Pages:

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"scripts": {
  "deploy-gh": "gh-pages -d ."
}

# Deploy
npm run deploy-gh
```

## 🔧 Configuration Files

### vercel.json
- Clean URLs enabled
- Security headers configured
- Trailing slashes disabled
- Public deployment

### nginx.conf
- Gzip compression enabled
- Security headers (CSP, X-Frame-Options, etc.)
- Static asset caching (30 days)
- Health check endpoint (/health)
- SPA fallback routing

### docker-compose.yml
- Container orchestration
- Volume mounting for data persistence
- Network isolation
- Auto-restart policy

## 🌐 Access URLs

### Production Environments
1. **Vercel Production**: https://wisdom-site-deployment-cnpx6stc8-axaiinovation.vercel.app
2. **GitHub Repository**: https://github.com/PresidentAnderson/wisdom-course-personal
3. **Docker Local**: http://localhost:8080 (when running)

### Features Deployed
- ✅ Enhanced navigation with dropdowns
- ✅ Mobile hamburger menu
- ✅ Service pages (Coaching, Workshops, Consulting)
- ✅ Smooth animations and transitions
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Multi-language ready

## 📊 Performance Optimizations

### Vercel Optimizations
- Automatic image optimization
- Edge caching
- Brotli compression
- Prefetching

### Docker/Nginx Optimizations
- Gzip compression
- Browser caching for static assets
- HTTP/2 support ready
- Minimal Alpine Linux base

## 🔐 Security Features

### Headers Configured
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy (CSP)
- Referrer-Policy

### HTTPS/SSL
- Automatic on Vercel
- Configure SSL certificates for Docker deployment

## 🔄 Continuous Deployment

### GitHub to Vercel
Automatic deployments on push to main branch:
1. Push code to GitHub
2. Vercel automatically builds and deploys
3. Preview URLs for pull requests

### Manual Deployment
```bash
# From project directory
cd '/Volumes/DevOps/07-personal/wisdom-site-deployment'

# Deploy to Vercel
npx vercel --prod

# Build Docker
./build-docker.sh
```

## 📝 Environment Variables

For production deployments, set these in Vercel dashboard or Docker environment:

```env
# Analytics (if needed)
NEXT_PUBLIC_GA_ID=your-ga-id
NEXT_PUBLIC_GTM_ID=your-gtm-id

# API endpoints (if needed)
API_BASE_URL=https://api.example.com
```

## 🐛 Troubleshooting

### Vercel Issues
- Clear cache: `vercel --force`
- Check build logs: https://vercel.com/dashboard
- Verify domain settings

### Docker Issues
- Ensure Docker daemon is running
- Check port availability: `lsof -i :8080`
- View logs: `docker logs wisdom-site`
- Rebuild without cache: `docker build --no-cache -t wisdom-site .`

## 📈 Monitoring

### Vercel Analytics
- Built-in analytics dashboard
- Real-time performance metrics
- Error tracking

### Docker Monitoring
```bash
# Container stats
docker stats wisdom-site

# View logs
docker logs -f wisdom-site

# Health check
curl http://localhost:8080/health
```

## 🔄 Updates and Maintenance

### Update Process
1. Make changes locally
2. Test thoroughly
3. Commit to GitHub: `git add . && git commit -m "Update message"`
4. Push to GitHub: `git push origin main`
5. Vercel auto-deploys (or manual: `npx vercel --prod`)
6. Rebuild Docker if needed: `./build-docker.sh`

### Rollback Process
```bash
# Vercel rollback
vercel rollback

# Docker rollback
docker run -d -p 8080:80 wisdom-site:previous-tag

# Git rollback
git revert HEAD
git push origin main
```

## 📧 Support

For deployment issues or questions:
- GitHub Issues: https://github.com/PresidentAnderson/wisdom-course-personal/issues
- Vercel Support: https://vercel.com/support
- Docker Documentation: https://docs.docker.com

---

**Deployment Status**: ✅ Successfully deployed to GitHub and Vercel  
**Docker**: ⚠️ Configuration ready (requires Docker daemon to build and run)