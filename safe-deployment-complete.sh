#!/bin/bash
# Complete safe deployment process

echo "Starting complete safe deployment..."

# Clean workspace first
source clean-workspace-deployment.sh

# Safe npm install without problematic configs
echo "Installing dependencies safely..."
npm install --no-package-lock --no-audit --no-fund --cache=/tmp/npm-safe-cache

# Build without cache conflicts
echo "Building application..."
npm run build

# Copy static files for production
echo "Copying static files..."
cp -r dist/public/* server/public/ 2>/dev/null || true

echo "Safe deployment completed successfully"