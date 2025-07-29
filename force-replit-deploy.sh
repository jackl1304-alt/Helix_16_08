#!/bin/bash
echo "🚀 FORCE REPLIT PRODUCTION DEPLOYMENT"
echo "===================================="

# Ensure production build
echo "Building production version..."
npm run build

# Copy static files
echo "Copying static files to server/public/..."
cp -r dist/public/* server/public/

# Check if files exist
echo "Verifying production files:"
ls -la server/public/
ls -la dist/

# Show current environment variables (safe parts)
echo "Environment check:"
echo "DATABASE_URL configured: ${DATABASE_URL:+YES}"
echo "NODE_ENV: $NODE_ENV"

echo ""
echo "✅ PRODUCTION BUILD COMPLETE"
echo "Ready for Replit deployment!"
echo ""
echo "🔥 CLICK DEPLOY BUTTON NOW!"