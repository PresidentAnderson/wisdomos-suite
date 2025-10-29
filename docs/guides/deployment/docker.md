# Docker Deployment Guide

Deploy WisdomOS using Docker for self-hosted or cloud infrastructure.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Domain with DNS access
- SSL certificate (Let's Encrypt recommended)

## Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/wisdomos.git
cd wisdomos

# Copy environment file
cp .env.example .env.production

# Edit environment variables
nano .env.production

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f
```

Access at: http://localhost (or your domain)

## Docker Compose Setup

### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: ./apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://api:8080
    env_file:
      - .env.production
    depends_on:
      - api
      - db
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: ./apps/api/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/wisdomos
    env_file:
      - .env.production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=your-secure-password
      - POSTGRES_DB=wisdomos
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/docker/ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
      - api
    restart: unless-stopped

volumes:
  postgres_data:
```

## Dockerfiles

### Web App Dockerfile

Create `apps/web/Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm db:generate
RUN pnpm --filter @wisdomos/web build

FROM base AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
```

### API Dockerfile

Create `apps/api/Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

RUN npm install -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm db:generate
RUN pnpm --filter @wisdomos/api build

FROM base AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

EXPOSE 8080

CMD ["node", "dist/main.js"]
```

## Nginx Configuration

Create `config/docker/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream web {
        server web:3000;
    }

    upstream api {
        server api:8080;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com *.yourdomain.com;
        return 301 https://$host$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com *.yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security Headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000" always;

        # API Routes
        location /api/ {
            proxy_pass http://api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Web App
        location / {
            proxy_pass http://web;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

## SSL Certificate Setup

### Using Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d *.yourdomain.com \
  --email your-email@example.com \
  --agree-tos

# Copy to nginx volume
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./config/docker/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./config/docker/ssl/

# Set permissions
sudo chmod 644 ./config/docker/ssl/fullchain.pem
sudo chmod 600 ./config/docker/ssl/privkey.pem
```

### Auto-Renewal

Add to crontab:
```bash
0 0 * * * certbot renew --quiet && docker-compose restart nginx
```

## Environment Configuration

Create `.env.production`:

```env
# Database
DATABASE_URL=postgresql://postgres:your-secure-password@db:5432/wisdomos

# Supabase (or use local PostgreSQL)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters
NEXTAUTH_URL=https://yourdomain.com

# API
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Optional
HUBSPOT_API_KEY=pat-na1-xxxxx
SENDGRID_API_KEY=SG.xxxxx
```

## Deployment Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart service
docker-compose restart web

# Stop all
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v
```

## Database Migrations

```bash
# Run migrations
docker-compose exec api pnpm db:migrate deploy

# Seed database
docker-compose exec api pnpm db:seed:demo
```

## Scaling with Docker Swarm

Initialize swarm:
```bash
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml wisdomos

# Scale services
docker service scale wisdomos_web=3
docker service scale wisdomos_api=2
```

## Kubernetes Deployment

See `deployment-configs/` for Kubernetes manifests:

```bash
# Apply configurations
kubectl apply -f deployment-configs/web/
kubectl apply -f deployment-configs/api/
kubectl apply -f deployment-configs/database/

# Check status
kubectl get pods
kubectl get services
```

## Monitoring

### Health Checks

Add to docker-compose.yml:

```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Logging

View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web

# Last 100 lines
docker-compose logs --tail=100 api
```

### Resource Usage

```bash
# Container stats
docker stats

# Specific service
docker stats wisdomos-web-1
```

## Backup Strategy

### Database Backups

```bash
# Create backup
docker-compose exec db pg_dump -U postgres wisdomos > backup.sql

# Restore backup
docker-compose exec -T db psql -U postgres wisdomos < backup.sql

# Automated daily backup
0 2 * * * /path/to/backup-script.sh
```

### Volume Backups

```bash
# Backup volume
docker run --rm -v wisdomos_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data

# Restore volume
docker run --rm -v wisdomos_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs web

# Inspect container
docker inspect wisdomos-web-1

# Check if port is in use
lsof -i :3000
```

### Database Connection Issues

```bash
# Test database connection
docker-compose exec api psql $DATABASE_URL

# Check database is running
docker-compose ps db
```

### Out of Memory

Increase Docker memory in Docker Desktop settings or:

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          memory: 2G
```

## Security Hardening

1. **Use secrets management**:
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

2. **Non-root user** (already in Dockerfiles)

3. **Read-only filesystem**:
```yaml
services:
  web:
    read_only: true
    tmpfs:
      - /tmp
```

4. **Network isolation**:
```yaml
networks:
  frontend:
  backend:
```

## Production Checklist

- [ ] SSL certificates configured
- [ ] Environment variables set
- [ ] Database backups automated
- [ ] Health checks configured
- [ ] Log aggregation setup
- [ ] Monitoring enabled
- [ ] Firewall rules configured
- [ ] Domain DNS configured

## Next Steps

1. ✅ Deploy with Docker Compose
2. ✅ Configure SSL
3. ✅ Set up backups
4. ✅ Configure monitoring
5. ✅ Review [Production Checklist](./production-checklist.md)

---

**Docker deployment complete?** Continue to [Production Checklist](./production-checklist.md) →
