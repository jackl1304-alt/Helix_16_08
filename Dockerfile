# Simple Node.js deployment for Helix Platform
FROM node:18-alpine

WORKDIR /app

# Install system tools
RUN apk add --no-cache curl git

# Copy package.json
COPY package.json ./

# Install dependencies using npm install (works without package-lock.json)
RUN npm install

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Create user and set permissions
RUN adduser -S helix && chown -R helix /app
USER helix

# Expose port
EXPOSE 5173

# Start application
CMD ["node", "server/index.js"]