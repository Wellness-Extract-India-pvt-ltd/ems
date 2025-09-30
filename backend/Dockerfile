# ===========================================
# EMS Backend Production Dockerfile
# ===========================================
# Multi-stage build for optimized production image
# Security hardened with non-root user and minimal attack surface
# Author: EMS Development Team
# Version: 1.0.0
# ===========================================

# ===========================================
# Stage 1: Build Dependencies
# ===========================================
FROM node:20-alpine AS builder

# Install build dependencies and security updates
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    unixodbc-dev \
    && rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ems -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --include=dev && \
    npm cache clean --force

# Copy source code
COPY . .

# Build application (if needed)
# RUN npm run build

# ===========================================
# Stage 2: Production Image
# ===========================================
FROM node:20-alpine AS production

# Install runtime dependencies and security updates
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    tini \
    unixodbc \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ems -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Copy application code from builder stage
COPY --from=builder --chown=ems:nodejs /app ./

# Create necessary directories with proper permissions
RUN mkdir -p uploads/employees uploads/tickets logs temp && \
    chown -R ems:nodejs uploads logs temp && \
    chmod -R 755 uploads logs temp

# Set environment variables
ENV NODE_ENV=production \
    PORT=5000 \
    HOST=0.0.0.0 \
    NODE_OPTIONS="--max-old-space-size=512" \
    TZ=UTC

# Switch to non-root user
USER ems

# Expose port
EXPOSE 5000

# Add labels for better container management
LABEL maintainer="EMS Development Team" \
      version="1.0.0" \
      description="EMS Backend API Server" \
      org.opencontainers.image.title="EMS Backend" \
      org.opencontainers.image.description="Employee Management System Backend API" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="Wellness Extract" \
      org.opencontainers.image.licenses="MIT"

# ===========================================
# Health Check Configuration
# ===========================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

# ===========================================
# Security and Performance Optimizations
# ===========================================
# Set resource limits
ENV NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=64"

# ===========================================
# Application Startup
# ===========================================
# Use tini as init system for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start the application
CMD ["node", "index.js"]
