# CI/CD Setup for Autobiography AI Enhancements

Complete guide for the CI/CD pipeline powering the Autobiography AI features in WisdomOS.

---

## 🎯 Overview

This CI/CD pipeline enables:
- ✅ Automated testing and linting on all branches
- ✅ Docker builds and pushes to DockerHub on main branch
- ✅ Vercel preview deployments for feature branches
- ✅ Feature flag control per environment
- ✅ Manual rollback capability

---

## 🌳 Branching Strategy

### Branch Structure

```
main (production)
│
├── feature/autobiography-ai-enhancements (main feature branch)
│   ├── feature/autobiography-bulk-generation
│   ├── feature/autobiography-curation-mode
│   ├── feature/autobiography-regional-relevance
│   └── feature/autobiography-memory-linking
```

### Branch Purposes

| Branch | Purpose | Deployment Target |
|--------|---------|-------------------|
| `main` | Production code | Docker + Vercel Production |
| `feature/autobiography-ai-enhancements` | Main development branch | Vercel Preview |
| `feature/autobiography-bulk-generation` | Bulk event generation feature | Vercel Preview |
| `feature/autobiography-curation-mode` | Manual curation UI | Vercel Preview |
| `feature/autobiography-regional-relevance` | Regional filtering | Vercel Preview |
| `feature/autobiography-memory-linking` | Memory connections | Vercel Preview |

---

## 🚀 CI/CD Workflows

### 1. CI Pipeline (`ci.yml`)

**Trigger**: Push to `main` or `feature/**`, Pull Requests to `main`

**Jobs**:
- **lint-and-test**: Runs ESLint, type checking, tests
- **security-scan**: npm audit + secret scanning
- **status-check**: Final status aggregation

**Duration**: ~3-5 minutes

### 2. Deploy Workflow (`deploy.yml`)

**Trigger**: Push to `main`

**Jobs**:
- **docker-build-and-push**: Builds Docker image, pushes to DockerHub

**Artifacts**:
- `{DOCKERHUB_USER}/wisdomos-web:latest`
- `{DOCKERHUB_USER}/wisdomos-web:{commit-sha}`

**Duration**: ~5-8 minutes

### 3. Vercel Preview (`vercel-preview.yml`)

**Trigger**: Push to `feature/**`

**Jobs**:
- **deploy-preview**: Deploys to Vercel, comments preview URL on PR

**URL Format**: `https://wisdomos-{branch}-{random}.vercel.app`

**Duration**: ~2-4 minutes

### 4. Rollback (`rollback.yml`)

**Trigger**: Manual workflow dispatch

**Inputs**:
- `commit_sha`: The commit to roll back to

**Jobs**:
- **rollback**: Resets to specified commit, force pushes

**Duration**: ~1 minute

---

## 🎛️ Feature Flags

### Configuration

Feature flags are controlled via environment variables:

| Flag | Environment Variable | Default | Purpose |
|------|---------------------|---------|---------|
| **Bulk Generation** | `NEXT_PUBLIC_FEATURE_BULK_GENERATION` | `false` | Generate events for multiple years at once |
| **Curation Mode** | `NEXT_PUBLIC_FEATURE_CURATION_MODE` | `false` | Manual review/edit of AI-generated content |
| **Regional Relevance** | `NEXT_PUBLIC_FEATURE_REGION_RELEVANCE` | `false` | Filter events by user's region |
| **Memory Linking** | `NEXT_PUBLIC_FEATURE_MEMORY_LINKING` | `false` | Auto-link events to journal entries |

---

## 🔐 Required Secrets

### GitHub Secrets

Configure these in: **GitHub Repository → Settings → Secrets and variables → Actions**

| Secret | Purpose | How to Get |
|--------|---------|------------|
| `OPENAI_API_KEY` | AI event generation | OpenAI Platform |
| `DOCKERHUB_USER` | Docker registry login | Your DockerHub username |
| `DOCKERHUB_TOKEN` | Docker registry auth | DockerHub Access Tokens |
| `VERCEL_TOKEN` | Vercel deployments | Vercel Account Tokens |

---

## 📊 Deployment Flow

### Normal Development Flow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Develop & Commit**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/my-new-feature
   ```

3. **Automated Actions**
   - CI pipeline runs (lint, test, build)
   - Vercel preview deploys
   - Preview URL posted in GitHub

4. **Manual Testing**
   - Open preview URL
   - Test feature with flags enabled
   - Verify functionality

5. **Create Pull Request**
   - PR triggers CI again
   - Request code review
   - Make changes if needed

6. **Merge to Main**
   - Docker image builds automatically
   - Pushes to DockerHub
   - Vercel production deployment

---

## 🔄 Rollback Procedures

### Method 1: Manual Workflow Dispatch

1. Go to **GitHub → Actions → Rollback Deployment**
2. Click "Run workflow"
3. Enter the commit SHA to roll back to
4. Click "Run workflow"
5. Wait ~1 minute for completion

### Method 2: Git Commands (Local)

```bash
# Find the commit to roll back to
git log --oneline

# Revert to that commit
git reset --hard <commit-sha>

# Force push (use with caution)
git push origin main --force
```

---

## 🛠️ Troubleshooting

### CI Failing on Lint

**Solution**:
```bash
npm run lint
npm run lint -- --fix
```

### Docker Build Failing

**Solution**:
1. Verify `DOCKERHUB_USER` and `DOCKERHUB_TOKEN` secrets
2. Regenerate token in DockerHub if expired
3. Update GitHub secrets

### Feature Flags Not Working

**Solution**:
1. Verify environment variable starts with `NEXT_PUBLIC_`
2. Rebuild application (env vars are baked in at build time)
3. Check browser console for feature flag values

---

## ✅ Checklist: First-Time Setup

- [ ] Create GitHub repository secrets
- [ ] Link Vercel project to repository
- [ ] Create DockerHub repository
- [ ] Configure Vercel environment variables
- [ ] Test CI workflow on feature branch
- [ ] Verify Docker build on main branch
- [ ] Test Vercel preview deployment
- [ ] Verify feature flags work correctly
- [ ] Test rollback procedure

---

**Last Updated**: 2025-10-29  
**Version**: 1.0.0  
**Maintained By**: AXAI Innovations Dev Team
