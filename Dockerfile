# Production-ready Dockerfile for Helix Regulatory Intelligence Platform
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files first for better caching
COPY package.json ./

# Install all dependencies
RUN npm install

# Copy configuration files
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Copy source code
COPY client/ ./client/
COPY shared/ ./shared/
COPY server/ ./server/

# Build the application
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S helix -u 1001 -G nodejs && \
    chown -R helix:nodejs /app

# Switch to non-root user
USER helix

# Expose the application port
EXPOSE 5173

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5173/api/health || exit 1

# Start the application
CMD ["node", "server/index.js"]