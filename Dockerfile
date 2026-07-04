# ==========================================
# Stage 1 - Build
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build


# ==========================================
# Stage 2 - Production
# ==========================================
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy dependency files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev \
    && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy script files
COPY --from=builder /app/src/scripts ./src/scripts

# Create non-root user
RUN addgroup -S nestjs \
    && adduser -S nestjs -G nestjs

USER nestjs

# Application port
EXPOSE 4000

# ECS/ALB health checks are usually preferred over Docker HEALTHCHECK.
# Uncomment if you specifically want container-level health checks.
#
# HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
# CMD node -e "require('http').get('http://localhost:4000/health',res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main.js"]