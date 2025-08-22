# Docker Setup for WisdomOS

## Overview
This guide covers running WisdomOS using Docker for both development and production environments. The Docker setup includes production-optimized multi-stage builds, security best practices, and comprehensive monitoring.

## Recent Improvements (Latest Update)
- **Enhanced Security**: Non-root user, read-only filesystem, security options
- **Production Optimization**: Multi-stage builds with Node.js 20, proper signal handling
- **Better Health Checks**: Improved health check timings and reliability
- **Environment Variables**: Comprehensive .env support with defaults
- **Network Isolation**: Dedicated Docker network for service communication
- **Latest Images**: Updated to PostgreSQL 16 and Redis 7

## Quick Start

### Prerequisites
1. **Environment Setup**: Copy `.env.example` to `.env` and update values
   ```bash
   cp .env.example .env
   # Edit .env with your secure passwords and configuration
   ```

2. **Security Note**: Always change default passwords in production!

### 1. Development with Docker Compose
```bash
# Start all services (database + app)
docker-compose up -d

# Or start only the database for local development
docker-compose up -d postgres redis

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### 2. Development Mode (Local App + Docker Database)
```bash
# Start only the database
docker-compose up -d postgres

# Run the app locally
npm install
npm run dev
```

### 3. Production Build
```bash
# Build and run production containers
docker-compose up -d

# Or build the image manually
docker build -t wisdomos-web:latest .
docker run -p 3000:3000 --env-file .env wisdomos-web:latest

# Test the production build
curl http://localhost:3000/api/health
```

## Service Details

### PostgreSQL Database
- **Container**: `wisdomos_db`
- **Image**: `postgres:16-alpine`
- **Port**: `5432` (configurable via `POSTGRES_PORT`)
- **Database**: `wisdomos`
- **User**: `postgres`
- **Password**: Configurable via `POSTGRES_PASSWORD`
- **Data Volume**: `postgres_data`
- **Security**: SCRAM-SHA-256 authentication, no-new-privileges

### Redis (Optional)
- **Container**: `wisdomos_redis`
- **Image**: `redis:7-alpine`
- **Port**: `6379` (configurable via `REDIS_PORT`)
- **Data Volume**: `redis_data`
- **Purpose**: Future caching/sessions
- **Security**: Password protection, persistence enabled

### WisdomOS Application
- **Container**: `wisdomos_app`
- **Image**: Built from `node:20-alpine`
- **Port**: `3000` (configurable via `APP_PORT`)
- **Health Check**: `/api/health`
- **Environment**: Production-ready build
- **Security**: Non-root user, read-only filesystem, signal handling

## Environment Variables

All environment variables can be configured using a `.env` file. Copy `.env.example` to `.env` and customize as needed.

### Required Variables
```env
# Security (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-very-secure-jwt-secret-key
POSTGRES_PASSWORD=your_secure_postgres_password

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:your_secure_postgres_password@postgres:5432/wisdomos?schema=public
```

### Optional Variables
```env
# Ports
APP_PORT=3000
POSTGRES_PORT=5432
REDIS_PORT=6379

# Redis (if using)
REDIS_PASSWORD=your_secure_redis_password
REDIS_URL=redis://:your_secure_redis_password@redis:6379

# Development
DEV_PORT=3001
DEV_APP_URL=http://localhost:3001
```

## Database Setup

### Initial Setup
```bash
# Start the database
docker-compose up -d postgres

# Wait for database to be ready
docker-compose logs postgres

# Run Prisma migrations
npm run prisma:push

# Seed the database
npm run prisma:seed
```

### Reset Database
```bash
# Remove database volume
docker-compose down -v

# Restart and reinitialize
docker-compose up -d postgres
npm run prisma:push
npm run prisma:seed
```

## Development Workflows

### Option 1: Full Docker Development
```bash
# Start all services
docker-compose --profile dev up -d

# The app will be available at http://localhost:3001
# Hot reloading enabled with volume mounts
```

### Option 2: Hybrid Development (Recommended)
```bash
# Start only database services
docker-compose up -d postgres redis

# Run app locally for faster development
npm run dev
```

### Option 3: Production Testing
```bash
# Build and run production containers
docker-compose up -d

# Test at http://localhost:3000
```

## Build Optimization

### Multi-stage Build Process
1. **Dependencies Stage**: Install only production dependencies
2. **Builder Stage**: Build the Next.js application
3. **Runner Stage**: Minimal runtime image with built application

### Build Features
- **Standalone Output**: Self-contained build
- **Security**: Non-root user (nextjs:nodejs)
- **Health Checks**: Built-in application monitoring
- **Small Image Size**: Alpine Linux base (~100MB final image)

## Monitoring & Health Checks

### Application Health Check
```bash
# Check application health
curl http://localhost:3000/api/health

# Docker health check
docker ps # Look for "healthy" status
```

### Database Health Check
```bash
# Check database connectivity
docker-compose exec postgres pg_isready -U postgres
```

### Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f postgres
```

## Production Deployment

### Docker Hub Deployment

#### 1. Build and Tag for Docker Hub
```bash
# Build production image
docker build -t wisdomos-web:latest .

# Tag for Docker Hub (replace 'username' with your Docker Hub username)
docker tag wisdomos-web:latest username/wisdomos-web:latest
docker tag wisdomos-web:latest username/wisdomos-web:$(date +%Y%m%d)

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push username/wisdomos-web:latest
docker push username/wisdomos-web:$(date +%Y%m%d)
```

#### 2. Pull and Run from Docker Hub
```bash
# Pull the latest image
docker pull username/wisdomos-web:latest

# Run with environment file
docker run -d \
  --name wisdomos-app \
  --env-file .env \
  -p 3000:3000 \
  username/wisdomos-web:latest
```

### Private Registry Push
```bash
# Build production image
docker build -t your-registry.com/wisdomos-web:latest .

# Push to private registry
docker push your-registry.com/wisdomos-web:latest
```

### Kubernetes Deployment (Example)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wisdomos-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wisdomos-web
  template:
    metadata:
      labels:
        app: wisdomos-web
    spec:
      containers:
      - name: wisdomos-web
        image: your-registry/wisdomos-web:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: wisdomos-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: wisdomos-secrets
              key: jwt-secret
```

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify connection string
echo $DATABASE_URL
```

#### Application Won't Start
```bash
# Check application logs
docker-compose logs app

# Verify environment variables
docker-compose exec app env | grep DATABASE_URL

# Restart services
docker-compose restart app
```

#### Build Failures
```bash
# Clean build cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache app
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor container health
docker-compose ps

# Check disk space
docker system df
```

## Security Considerations

### Production Security Features
- **Non-root User**: Application runs as `nextjs` user (UID 1001)
- **Read-only Filesystem**: Application container filesystem is read-only
- **Security Options**: `no-new-privileges` enabled for all containers
- **Signal Handling**: Proper signal handling with `dumb-init`
- **Network Isolation**: Services communicate via dedicated Docker network
- **Health Monitoring**: Built-in health checks for all services
- **Latest Base Images**: Using Node.js 20, PostgreSQL 16, Redis 7

### Production Security Checklist
- [ ] **Change Default Passwords**: Update all passwords in `.env`
- [ ] **Use Strong JWT Secret**: Generate a cryptographically secure JWT secret
- [ ] **Enable HTTPS**: Configure SSL/TLS termination (reverse proxy)
- [ ] **Limit Container Resources**: Set memory and CPU limits
- [ ] **Regular Updates**: Keep base images and dependencies updated
- [ ] **Secret Management**: Use Docker secrets or external services (not env files)
- [ ] **Database Backups**: Implement automated backup strategy
- [ ] **Log Management**: Configure centralized logging
- [ ] **Monitoring**: Set up application and infrastructure monitoring

### Development Security
- **Database Isolation**: Database not exposed externally by default
- **Volume Permissions**: Proper file permissions on mounted volumes
- **Secret Management**: Development secrets separate from production
- **Network Segmentation**: Services isolated in Docker network

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres wisdomos > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres wisdomos < backup.sql
```

### Volume Backup
```bash
# Backup volume data
docker run --rm -v wisdomos_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume data
docker run --rm -v wisdomos_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## Commands Reference

### Docker Compose Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service]

# Execute commands in containers
docker-compose exec app bash
docker-compose exec postgres psql -U postgres wisdomos

# Rebuild services
docker-compose build [service]

# Scale services
docker-compose up -d --scale app=3
```

### Docker Commands
```bash
# Build image
docker build -t wisdomos-web .

# Run container
docker run -p 3000:3000 wisdomos-web

# List containers
docker ps

# View logs
docker logs <container-id>

# Execute commands
docker exec -it <container-id> bash
```

## Best Practices

1. **Use .dockerignore**: Exclude unnecessary files from build context
2. **Multi-stage builds**: Minimize final image size
3. **Health checks**: Monitor application and database health
4. **Volume management**: Use named volumes for data persistence
5. **Environment variables**: Never hardcode secrets in images
6. **Security**: Run as non-root user, keep images updated
7. **Monitoring**: Implement logging and monitoring for production
8. **Backup strategy**: Regular database and volume backups