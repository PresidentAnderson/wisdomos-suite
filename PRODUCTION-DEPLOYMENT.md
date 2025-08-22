# WisdomOS Production Deployment Guide

## Overview
This guide covers deploying WisdomOS to production environments using Docker with security best practices and monitoring.

## Pre-deployment Checklist

### 1. Security Configuration
- [ ] Generate strong passwords for PostgreSQL and Redis
- [ ] Create a cryptographically secure JWT secret (32+ characters)
- [ ] Configure SSL/TLS certificates
- [ ] Set up a reverse proxy (nginx, Traefik, etc.)
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging

### 2. Infrastructure Requirements
- [ ] Docker and Docker Compose installed
- [ ] Minimum 2GB RAM, 10GB disk space
- [ ] SSL certificate for domain
- [ ] Backup storage configured
- [ ] Monitoring system ready

### 3. Environment Configuration
- [ ] Production `.env` file configured
- [ ] Database credentials secured
- [ ] Domain name and DNS configured
- [ ] Email service configured (if needed)

## Deployment Options

### Option 1: Docker Hub Deployment

#### Step 1: Build and Push to Docker Hub
```bash
# Build the production image
docker build -t wisdomos-web:latest .

# Tag for Docker Hub
docker tag wisdomos-web:latest your-username/wisdomos-web:latest
docker tag wisdomos-web:latest your-username/wisdomos-web:$(date +%Y%m%d)

# Push to Docker Hub
docker login
docker push your-username/wisdomos-web:latest
docker push your-username/wisdomos-web:$(date +%Y%m%d)
```

#### Step 2: Deploy on Production Server
```bash
# Create production directory
mkdir -p /opt/wisdomos
cd /opt/wisdomos

# Create production environment file
cat > .env.production << EOF
NODE_ENV=production
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=postgresql://postgres:\${POSTGRES_PASSWORD}@postgres:5432/wisdomos?schema=public
REDIS_URL=redis://:\${REDIS_PASSWORD}@redis:6379
EOF

# Create production docker-compose file
cat > docker-compose.prod.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: wisdomos
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - wisdomos_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d wisdomos"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - wisdomos_network

  app:
    image: your-username/wisdomos-web:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - JWT_SECRET=\${JWT_SECRET}
      - NEXT_PUBLIC_APP_URL=\${NEXT_PUBLIC_APP_URL}
      - REDIS_URL=\${REDIS_URL}
    depends_on:
      - postgres
      - redis
    networks:
      - wisdomos_network

volumes:
  postgres_data:
  redis_data:

networks:
  wisdomos_network:
    driver: bridge
EOF

# Start the services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Option 2: Build on Production Server

```bash
# Clone the repository
git clone https://github.com/your-username/wisdomos-fullstack.git
cd wisdomos-fullstack/wisdomos-web

# Create production environment
cp .env.example .env.production
# Edit .env.production with production values

# Build and start
docker-compose --env-file .env.production up -d --build
```

## Reverse Proxy Configuration

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

### Traefik Configuration (docker-compose)
```yaml
version: '3.8'
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=your-email@domain.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"

  app:
    image: your-username/wisdomos-web:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.wisdomos.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.wisdomos.entrypoints=websecure"
      - "traefik.http.routers.wisdomos.tls.certresolver=myresolver"
```

## Monitoring and Logging

### Health Monitoring Script
```bash
#!/bin/bash
# /opt/wisdomos/health-check.sh

HEALTH_URL="https://your-domain.com/api/health"
ALERT_EMAIL="admin@your-domain.com"

if ! curl -f -s $HEALTH_URL > /dev/null; then
    echo "WisdomOS health check failed at $(date)" | mail -s "WisdomOS Alert" $ALERT_EMAIL
    # Restart services if needed
    cd /opt/wisdomos
    docker-compose restart app
fi
```

### Log Aggregation with Docker
```yaml
# Add to your docker-compose.yml
services:
  app:
    # ... existing config
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### Prometheus Monitoring (Optional)
```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - wisdomos_network

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    networks:
      - wisdomos_network
```

## Backup Strategy

### Automated Database Backup
```bash
#!/bin/bash
# /opt/wisdomos/backup.sh

BACKUP_DIR="/opt/wisdomos/backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="wisdomos_db"

mkdir -p $BACKUP_DIR

# Create database backup
docker exec $CONTAINER_NAME pg_dump -U postgres wisdomos > $BACKUP_DIR/wisdomos_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/wisdomos_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: wisdomos_$DATE.sql.gz"
```

### Cron Job for Automated Backups
```bash
# Add to crontab (crontab -e)
0 2 * * * /opt/wisdomos/backup.sh >> /var/log/wisdomos-backup.log 2>&1
```

## Security Hardening

### 1. Container Security
```bash
# Set resource limits in docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
```

### 2. Network Security
```bash
# Create custom network with restricted access
docker network create --driver bridge --subnet=172.20.0.0/16 wisdomos_private
```

### 3. File System Security
```bash
# Set proper permissions
chmod 600 .env.production
chown root:root .env.production

# Use Docker secrets for sensitive data
echo "your-jwt-secret" | docker secret create jwt_secret -
```

## Scaling and High Availability

### Load Balancer Configuration
```yaml
services:
  app:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

### Database Replication (Advanced)
```yaml
services:
  postgres-primary:
    image: postgres:16-alpine
    environment:
      POSTGRES_REPLICATION_MODE: master
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: replication_pass

  postgres-replica:
    image: postgres:16-alpine
    environment:
      POSTGRES_REPLICATION_MODE: slave
      POSTGRES_MASTER_HOST: postgres-primary
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: replication_pass
```

## Troubleshooting

### Common Issues
1. **Application won't start**: Check environment variables and logs
2. **Database connection failed**: Verify credentials and network connectivity
3. **SSL certificate issues**: Check certificate validity and paths
4. **Performance issues**: Monitor resource usage and optimize

### Log Analysis
```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres

# Check system resources
docker stats

# Monitor disk usage
docker system df
```

### Recovery Procedures
```bash
# Restore from backup
docker exec -i wisdomos_db psql -U postgres wisdomos < backup.sql

# Rolling back deployment
docker-compose pull && docker-compose up -d

# Emergency shutdown
docker-compose down && docker system prune -f
```

## Maintenance

### Regular Maintenance Tasks
- [ ] Update Docker images monthly
- [ ] Review and rotate secrets quarterly
- [ ] Backup verification weekly
- [ ] Security audit quarterly
- [ ] Performance monitoring daily
- [ ] Log rotation weekly

### Update Process
```bash
# 1. Backup current data
./backup.sh

# 2. Pull latest images
docker-compose pull

# 3. Restart services with zero downtime
docker-compose up -d --no-deps app

# 4. Verify deployment
curl https://your-domain.com/api/health
```

This production deployment guide ensures a secure, scalable, and maintainable WisdomOS deployment.