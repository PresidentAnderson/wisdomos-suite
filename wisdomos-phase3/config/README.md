# WisdomOS Configuration Files

All YAML configuration files organized by purpose.

## Directory Structure

```
config/
├── docker/              # Docker Compose configurations
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── docker-compose.production.yml
│
└── ci-cd/              # CI/CD pipeline configurations
    └── .gitlab-ci.yml
```

**Note:** GitHub Actions workflows remain in `.github/workflows/` (standard location)

---

## Docker Configurations

### `docker/docker-compose.yml`
**Purpose:** Development environment Docker Compose configuration
**Usage:**
```bash
docker-compose -f config/docker/docker-compose.yml up
```
**Environment:** Development
**Services:** Typically includes:
- Web application
- API server
- PostgreSQL database
- Redis (if used)

### `docker/docker-compose.prod.yml`
**Purpose:** Production environment configuration (simplified)
**Usage:**
```bash
docker-compose -f config/docker/docker-compose.prod.yml up -d
```
**Environment:** Production
**Optimizations:**
- Production builds
- Optimized resource limits
- No development tools

### `docker/docker-compose.production.yml`
**Purpose:** Full production environment configuration
**Usage:**
```bash
docker-compose -f config/docker/docker-compose.production.yml up -d
```
**Environment:** Production
**Features:**
- Complete production setup
- SSL/TLS configuration
- Monitoring and logging
- Backup services

---

## CI/CD Configurations

### `ci-cd/.gitlab-ci.yml`
**Purpose:** GitLab CI/CD pipeline configuration
**Triggers:**
- Git push to repository
- Merge requests
- Manual pipeline runs

**Stages Typically Include:**
1. **Build** - Compile and build applications
2. **Test** - Run test suites
3. **Deploy** - Deploy to staging/production

**Usage:** Automatically runs on GitLab, or manually:
```bash
# View pipeline status
gitlab-ci-multi-runner exec docker build

# Manual trigger via GitLab UI or CLI
```

---

## GitHub Actions Workflows

**Location:** `.github/workflows/`

These remain in the standard GitHub Actions location:

### `api-deploy.yml`
- Deploys API backend
- Runs on push to main branch
- Includes API tests

### `web-deploy.yml`
- Deploys web frontend
- Builds Next.js application
- Deploys to Vercel/hosting platform

### `mobile-ios.yml`
- iOS app build and deployment
- Runs on mobile/* branches
- TestFlight distribution

### `docker-publish.yml`
- Builds and publishes Docker images
- Pushes to Docker registry
- Multi-platform builds

---

## Root Configuration Files

Some YAML files must remain in project root:

### `pnpm-workspace.yaml` (Root)
**Purpose:** pnpm workspace configuration
**Location:** Must be in project root
**Content:** Defines workspace packages
```yaml
packages:
  - 'wisdom/shared/*'
  - 'wisdom/platforms/*'
  - 'wisdom/editions/*/*'
```

### `.github/workflows/*.yml` (Standard Location)
**Purpose:** GitHub Actions workflows
**Location:** Must be in `.github/workflows/`
**Reason:** GitHub requires this exact path

---

## Usage Examples

### Development

**Start development environment:**
```bash
docker-compose -f config/docker/docker-compose.yml up
```

**Stop development environment:**
```bash
docker-compose -f config/docker/docker-compose.yml down
```

**Rebuild containers:**
```bash
docker-compose -f config/docker/docker-compose.yml up --build
```

### Production

**Start production stack:**
```bash
docker-compose -f config/docker/docker-compose.production.yml up -d
```

**View logs:**
```bash
docker-compose -f config/docker/docker-compose.production.yml logs -f
```

**Scale services:**
```bash
docker-compose -f config/docker/docker-compose.production.yml up -d --scale web=3
```

### CI/CD

**Test locally (GitLab CI):**
```bash
# Using gitlab-runner
gitlab-runner exec docker build
gitlab-runner exec docker test
```

**GitHub Actions:**
```bash
# Install act (local GitHub Actions runner)
brew install act

# Run workflow locally
act push
```

---

## Environment Variables

All Docker configurations require environment variables:

### Development (.env.development)
```bash
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/wisdomos_dev
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Production (.env.production)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod-host:5432/wisdomos_prod
NEXT_PUBLIC_API_URL=https://api.wisdomos.com
```

**⚠️ Never commit .env files to version control!**

---

## Docker Compose Commands Reference

### Common Commands

```bash
# Start services
docker-compose -f config/docker/docker-compose.yml up

# Start in background
docker-compose -f config/docker/docker-compose.yml up -d

# Stop services
docker-compose -f config/docker/docker-compose.yml down

# Stop and remove volumes
docker-compose -f config/docker/docker-compose.yml down -v

# View logs
docker-compose -f config/docker/docker-compose.yml logs

# Follow logs
docker-compose -f config/docker/docker-compose.yml logs -f

# Execute command in container
docker-compose -f config/docker/docker-compose.yml exec web sh

# Rebuild specific service
docker-compose -f config/docker/docker-compose.yml build web

# Restart service
docker-compose -f config/docker/docker-compose.yml restart web
```

### Production Commands

```bash
# Deploy production stack
docker-compose -f config/docker/docker-compose.production.yml up -d

# Update single service
docker-compose -f config/docker/docker-compose.production.yml up -d --no-deps web

# Check service health
docker-compose -f config/docker/docker-compose.production.yml ps

# View resource usage
docker stats
```

---

## Configuration Best Practices

### Security
- ✅ Use environment variables for secrets
- ✅ Never commit API keys or passwords
- ✅ Use Docker secrets for production
- ✅ Limit container permissions
- ✅ Scan images for vulnerabilities

### Performance
- ✅ Use multi-stage builds
- ✅ Optimize layer caching
- ✅ Set resource limits
- ✅ Use health checks
- ✅ Enable logging rotation

### Maintenance
- ✅ Keep base images updated
- ✅ Document custom configurations
- ✅ Version control all configs
- ✅ Test changes in staging first
- ✅ Monitor container metrics

---

## Troubleshooting

### Port Conflicts
```bash
# Check ports in use
lsof -i :3000
lsof -i :5432

# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # host:container
```

### Container Won't Start
```bash
# Check logs
docker-compose -f config/docker/docker-compose.yml logs web

# Rebuild from scratch
docker-compose -f config/docker/docker-compose.yml build --no-cache web

# Remove volumes and restart
docker-compose -f config/docker/docker-compose.yml down -v
docker-compose -f config/docker/docker-compose.yml up
```

### Permission Issues
```bash
# Fix file permissions
docker-compose -f config/docker/docker-compose.yml exec web chown -R node:node /app

# Run as root (debugging only)
docker-compose -f config/docker/docker-compose.yml exec -u root web sh
```

### Network Issues
```bash
# Recreate network
docker network rm wisdomos_default
docker-compose -f config/docker/docker-compose.yml up

# Inspect network
docker network inspect wisdomos_default
```

---

## Updating Configurations

### When to Update

Update configurations when:
- Adding new services
- Changing environment variables
- Updating dependencies
- Modifying resource limits
- Changing networking setup

### Update Process

1. **Test locally first:**
   ```bash
   docker-compose -f config/docker/docker-compose.yml config
   ```

2. **Validate syntax:**
   ```bash
   docker-compose -f config/docker/docker-compose.yml config --quiet
   ```

3. **Deploy to staging:**
   ```bash
   docker-compose -f config/docker/docker-compose.prod.yml up -d
   ```

4. **Monitor and verify:**
   ```bash
   docker-compose -f config/docker/docker-compose.prod.yml logs -f
   ```

5. **Deploy to production:**
   ```bash
   docker-compose -f config/docker/docker-compose.production.yml up -d
   ```

---

## Related Documentation

- **Scripts:** See `scripts/README.md` for deployment scripts
- **GitHub Actions:** See `.github/workflows/` for workflow details
- **Docker:** See `Dockerfile` in project root
- **Environment:** See `.env.example` for required variables

---

**Last Updated:** October 25, 2025
**Organization:** AXAI Innovations
**Project:** WisdomOS 2025
