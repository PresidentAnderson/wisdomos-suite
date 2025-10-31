# WisdomOS API - Production Docker Image
# Phoenix Transformation System - Backend API
# Author: Jonathan Anderson <contact@axaiinnovations.com>
# License: PROPRIETARY - All rights reserved.
# Copyright: © 2025 AXAI Innovations.

# ========================================
# Build Stage
# ========================================

FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production --prefer-offline --no-audit

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and clean cache
RUN npm prune --production && \
    npm cache clean --force

# ========================================
# Production Stage
# ========================================

FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    dumb-init \
    tini

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S wisdomos -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=wisdomos:nodejs /app/dist ./dist
COPY --from=builder --chown=wisdomos:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=wisdomos:nodejs /app/package*.json ./
COPY --from=builder --chown=wisdomos:nodejs /app/prisma ./prisma

# Create logs directory
RUN mkdir -p logs && chown wisdomos:nodejs logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV TZ=UTC

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/health', (res) => { \
        res.statusCode === 200 ? process.exit(0) : process.exit(1) \
    }).on('error', () => process.exit(1))"

# Switch to non-root user
USER wisdomos

# Expose port
EXPOSE 4000

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start the application
CMD ["node", "dist/main.js"]

# ========================================
# Labels for metadata
# ========================================

LABEL \
    org.opencontainers.image.title="WisdomOS API" \
    org.opencontainers.image.description="Phoenix Transformation System - Backend API" \
    org.opencontainers.image.vendor="AXAI Innovations" \
    org.opencontainers.image.version="1.0.0" \
    org.opencontainers.image.licenses="PROPRIETARY" \
    org.opencontainers.image.source="https://github.com/presidentanderson/wisdomos-api" \
    org.opencontainers.image.documentation="https://github.com/presidentanderson/wisdomos-api/blob/main/README.md" \
    maintainer="Jonathan Anderson <contact@axaiinnovations.com>"