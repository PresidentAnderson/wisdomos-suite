# GitLab Setup & Docker Deployment Guide

## 🚀 WisdomOS Next.js Platform - GitLab Integration

This guide helps you set up the WisdomOS project on GitLab with Docker deployment.

---

## 1. Create GitLab Repository

### Option A: Using GitLab CLI (glab)
```bash
# Login to GitLab (requires token)
glab auth login

# Create repository
glab repo create wisdom-site-deployment \
  --public \
  --description "WisdomOS - Personal Transformation Platform with Next.js 14" \
  --defaultBranch main

# Add GitLab as remote
git remote add gitlab https://gitlab.com/YOUR_USERNAME/wisdom-site-deployment.git

# Push to GitLab
git push gitlab main
```

### Option B: Manual Setup
1. Go to [GitLab.com](https://gitlab.com)
2. Click "New Project" → "Create blank project"
3. Project name: `wisdom-site-deployment`
4. Description: `WisdomOS - Personal Transformation Platform with Next.js 14`
5. Visibility: Public
6. Initialize with README: No (we have one)
7. Click "Create project"

---

## 2. Add GitLab Remote & Push

```bash
# Add GitLab remote (replace YOUR_USERNAME)
git remote add gitlab https://gitlab.com/YOUR_USERNAME/wisdom-site-deployment.git

# Push to GitLab
git push gitlab main

# Verify remotes
git remote -v
```

---

## 3. Docker Image Setup

### Build Docker Image Locally
```bash
# Start Docker daemon first
open -a Docker

# Build image
docker build -t wisdomos:latest .

# Test image locally
docker run -p 3000:3000 wisdomos:latest
```

### Push to GitLab Container Registry
```bash
# Login to GitLab Container Registry
docker login registry.gitlab.com -u YOUR_USERNAME

# Tag image for GitLab registry
docker tag wisdomos:latest registry.gitlab.com/YOUR_USERNAME/wisdom-site-deployment:latest

# Push to GitLab registry
docker push registry.gitlab.com/YOUR_USERNAME/wisdom-site-deployment:latest
```

---

## 4. GitLab CI/CD Pipeline

Create `.gitlab-ci.yml` in project root:

```yaml
# GitLab CI/CD Pipeline for WisdomOS
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  DOCKER_LATEST: $CI_REGISTRY_IMAGE:latest

before_script:
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

build:
  stage: build
  script:
    - docker build -t $DOCKER_IMAGE -t $DOCKER_LATEST .
    - docker push $DOCKER_IMAGE
    - docker push $DOCKER_LATEST
  only:
    - main

test:
  stage: test
  script:
    - npm ci
    - npm run test
    - npm run lint
  only:
    - main

deploy:
  stage: deploy
  script:
    - echo "Deploying to production..."
    # Add your deployment commands here
  only:
    - main
  when: manual
```

---

## 5. Current Deployment Status

### ✅ Live Deployment
**Vercel URL**: https://wisdom-site-deployment-p144do9b6-axaiinovation.vercel.app

### 📊 Project Features
- ✅ Next.js 14 with TypeScript
- ✅ Modern development tools (ESLint, Prettier, Husky)
- ✅ Testing infrastructure (Jest, React Testing Library)
- ✅ Prisma ORM ready for database integration
- ✅ Professional component architecture
- ✅ Docker containerization ready
- ✅ Progressive Web App foundation

### 🔧 Tech Stack
```json
{
  "frontend": "Next.js 14 + TypeScript + Tailwind CSS",
  "testing": "Jest + React Testing Library",
  "database": "Prisma ORM (PostgreSQL ready)",
  "deployment": "Vercel + Docker",
  "ci_cd": "GitHub Actions + GitLab CI/CD",
  "monitoring": "Built-in analytics"
}
```

---

## 6. Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

### Docker Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 7. Environment Variables

Create `.env.local` for local development:

```env
# Database (when ready)
DATABASE_URL="postgresql://user:password@localhost:5432/wisdomos"

# Authentication (when implemented)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# External APIs
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## 8. Next Steps

1. **Complete GitLab Setup**: Create repository and add remotes
2. **Docker Testing**: Start Docker daemon and test image build
3. **CI/CD Pipeline**: Add `.gitlab-ci.yml` file
4. **Database Integration**: Set up PostgreSQL with Prisma
5. **Authentication**: Implement NextAuth.js
6. **Full-Stack Features**: Add API endpoints and dynamic functionality

---

## 📞 Support

For issues or questions:
1. Check the [GitHub Repository](https://github.com/PresidentAnderson/wisdom-course-personal)
2. View live deployment at the Vercel URL above
3. Review Docker logs: `docker-compose logs`

---

**Status**: ✅ Ready for GitLab integration and Docker deployment!
**Last Updated**: August 19, 2025
**Platform**: Next.js 14 Full-Stack Architecture