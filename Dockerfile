# Node.js 20 Alpine
FROM node:20-alpine

# Arbeitsverzeichnis
WORKDIR /app

# Package.json kopieren und Dependencies installieren
COPY package*.json ./
RUN npm ci --only=production

# Source Code kopieren
COPY . .

# Build ausführen
RUN npm run build

# Port exponieren
EXPOSE 5000

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/dashboard/stats || exit 1

# App starten
CMD ["npm", "start"]