# Node.js 20 Alpine
FROM node:20-alpine

# Set environment variables to fix cache permission issues
ENV NPM_CONFIG_CACHE=/tmp/.npm
ENV NPM_CONFIG_TMP=/tmp
ENV NPM_CONFIG_INIT_CACHE=/tmp/.npm-init
ENV DISABLE_NPM_CACHE=true
ENV DISABLE_OPENCOLLECTIVE=true
ENV NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=1024"
ENV PORT=5000
ENV KEEP_DEV_DEPENDENCIES=true
ENV NPM_CONFIG_PROGRESS=false
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Arbeitsverzeichnis
WORKDIR /app

# Create npm cache directories with proper permissions
RUN mkdir -p /tmp/.npm /tmp/.npm-init && chmod 755 /tmp/.npm /tmp/.npm-init

# Package.json kopieren und Dependencies installieren
COPY package*.json ./

# Clear any existing cache and install dependencies with enhanced cache settings
RUN rm -rf ~/.npm/_cacache && npm ci --cache=/tmp/.npm --tmp=/tmp --no-audit --no-fund

# Source Code kopieren
COPY . .

# Clear cache directories and build the application
RUN rm -rf node_modules/.cache && rm -rf .cache && npm run build

# Port exponieren
EXPOSE 5000

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/dashboard/stats || exit 1

# App starten with production environment and all cache fixes
CMD ["sh", "-c", "export NPM_CONFIG_CACHE=/tmp/.npm && export NPM_CONFIG_TMP=/tmp && export NODE_OPTIONS='--max-old-space-size=4096 --max-semi-space-size=1024' && export PORT=5000 && export NODE_ENV=production && npm start"]