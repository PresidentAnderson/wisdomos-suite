# YAML Configuration Files - Quick Reference

All YAML configuration files have been organized for easy access.

## 📂 File Locations

### Docker Compose Files
```
config/docker/
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production (simplified)
└── docker-compose.production.yml # Production (full stack)
```

**Usage:**
```bash
# Development
docker-compose -f config/docker/docker-compose.yml up

# Production
docker-compose -f config/docker/docker-compose.production.yml up -d
```

---

### CI/CD Pipelines
```
config/ci-cd/
└── .gitlab-ci.yml              # GitLab CI/CD pipeline

.github/workflows/              # GitHub Actions (standard location)
├── api-deploy.yml              # API deployment
├── web-deploy.yml              # Web deployment
├── mobile-ios.yml              # iOS build
└── docker-publish.yml          # Docker image publishing
```

**Note:** GitHub Actions must remain in `.github/workflows/` (GitHub requirement)

---

### Workspace Configuration
```
./ (project root)
└── pnpm-workspace.yaml         # pnpm workspace config (must stay in root)
```

---

## 🚀 Quick Commands

### Development
```bash
# Start dev environment
docker-compose -f config/docker/docker-compose.yml up

# Stop dev environment
docker-compose -f config/docker/docker-compose.yml down

# View logs
docker-compose -f config/docker/docker-compose.yml logs -f
```

### Production
```bash
# Deploy to production
docker-compose -f config/docker/docker-compose.production.yml up -d

# Check status
docker-compose -f config/docker/docker-compose.production.yml ps

# View logs
docker-compose -f config/docker/docker-compose.production.yml logs -f web
```

### CI/CD
```bash
# Test GitLab CI locally
gitlab-runner exec docker build

# Test GitHub Actions locally (requires 'act')
act push
```

---

## 📖 Documentation

**Detailed documentation:** See `config/README.md`

**Contents:**
- Complete Docker Compose command reference
- CI/CD pipeline configuration
- Environment variable setup
- Troubleshooting guide
- Best practices

---

## 🔄 Migration Note

Files have been moved from:
- ❌ `./docker-compose*.yml`
- ✅ `config/docker/docker-compose*.yml`

- ❌ `./.gitlab-ci.yml`
- ✅ `config/ci-cd/.gitlab-ci.yml`

Update any scripts or documentation that reference these files!

---

## ⚠️ Important Notes

1. **pnpm-workspace.yaml** must stay in project root (pnpm requirement)
2. **GitHub Actions** must stay in `.github/workflows/` (GitHub requirement)
3. All other YAML configs now in `config/` directory
4. Update deployment scripts to use new paths

---

**See also:**
- `config/README.md` - Full configuration documentation
- `scripts/deployment/` - Deployment scripts (may need path updates)
- `.env.example` - Required environment variables
