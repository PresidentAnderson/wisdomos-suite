# Docker Setup for WisdomOS

## Overview
This guide covers running WisdomOS using Docker for both development and production environments.

## Quick Start

### 1. Development with Docker Compose
```bash
# Start all services (database + app)
docker-compose up -d

# Or start only the database for local development
docker-compose up -d postgres

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
docker-compose -f docker-compose.yml up -d

# Or build the image manually
docker build -t wisdomos-web .
docker run -p 3000:3000 wisdomos-web
```

## Service Details

### PostgreSQL Database
- **Container**: `wisdomos_db`
- **Port**: `5432`
- **Database**: `wisdomos`
- **User**: `postgres`
- **Password**: `postgres`
- **Data Volume**: `postgres_data`

### Redis (Optional)
- **Container**: `wisdomos_redis`
- **Port**: `6379`
- **Data Volume**: `redis_data`
- **Purpose**: Future caching/sessions

### WisdomOS Application
- **Container**: `wisdomos_app`
- **Port**: `3000`
- **Health Check**: `/api/health`
- **Environment**: Production-ready build

## Environment Variables

### Required Variables
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/wisdomos?schema=public
JWT_SECRET=your-secure-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Variables
```env
NODE_ENV=production
REDIS_URL=redis://redis:6379
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

### Docker Registry Push
```bash
# Build production image
docker build -t your-registry/wisdomos-web:latest .

# Push to registry
docker push your-registry/wisdomos-web:latest
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

### Production Security
- **Environment Variables**: Use Docker secrets or external secret management
- **Non-root User**: Application runs as `nextjs` user (UID 1001)
- **Network Isolation**: Services communicate via Docker network
- **Health Monitoring**: Built-in health checks for all services

### Development Security
- **Database Isolation**: Database not exposed externally by default
- **Volume Permissions**: Proper file permissions on mounted volumes
- **Secret Management**: Development secrets separate from production

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