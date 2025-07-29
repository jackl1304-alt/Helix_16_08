# Node.js 20 Alpine
FROM node:20-alpine

# Set environment variables to fix cache permission issues
ENV NPM_CONFIG_CACHE=/tmp/.npm
ENV DISABLE_NPM_CACHE=true
ENV DISABLE_OPENCOLLECTIVE=true
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV KEEP_DEV_DEPENDENCIES=true
ENV NPM_CONFIG_PROGRESS=false
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Arbeitsverzeichnis
WORKDIR /app

# Create npm cache directory with proper permissions
RUN mkdir -p /tmp/.npm && chmod 755 /tmp/.npm

# Package.json kopieren und Dependencies installieren
COPY package*.json ./

# Clear any existing cache and install dependencies with cache disabled
RUN rm -rf ~/.npm && npm cache clean --force && npm ci --no-cache

# Source Code kopieren
COPY . .

# Clear cache directories and build the application
RUN rm -rf node_modules/.cache && rm -rf .cache && npm run build

# Port exponieren
EXPOSE 5000

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/dashboard/stats || exit 1

# App starten with production environment
CMD ["sh", "-c", "export NPM_CONFIG_CACHE=/tmp/.npm && export NODE_OPTIONS='--max-old-space-size=4096' && export NODE_ENV=production && npm start"]