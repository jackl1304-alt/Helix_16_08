#!/bin/bash
# Replit startup script with all cache fixes applied

echo "🚀 Starting Helix Regulatory Platform with Replit cache fixes..."

# Apply pre-build fixes
echo "🔧 Applying pre-build cache fixes..."
source pre-build-replit.sh

# Set production environment
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=1024"

# Start the application
echo "🌟 Starting production server..."
exec node dist/index.js