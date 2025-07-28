FROM node:18-alpine

WORKDIR /app

# Package files kopieren
COPY package*.json ./
RUN npm ci --only=production

# Source code kopieren
COPY . .

# Build das Projekt
RUN npm run build

# Port exposieren
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# App starten
CMD ["npm", "start"]
