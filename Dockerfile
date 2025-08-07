# Use Node.js 18 Alpine for production deployment
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY client/ ./client/
COPY shared/ ./shared/
COPY server/ ./server/

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S helix -u 1001 -G nodejs

# Change ownership and switch user
RUN chown -R helix:nodejs /app
USER helix

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5173/api/health || exit 1

# Start command
CMD ["node", "server/index.js"]