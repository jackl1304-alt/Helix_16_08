#!/bin/bash
# Enhanced build script with complete cache isolation for Replit deployment

echo "🏗️ Enhanced build with complete cache isolation"

# Source the enhanced pre-build setup
source enhanced-pre-build.sh

# Install dependencies with enhanced isolation
echo "📦 Installing dependencies with enhanced isolation..."
npm ci \
  --cache=/tmp/.npm-deployment-cache \
  --tmp=/tmp \
  --no-audit \
  --no-fund \
  --loglevel=warn \
  --userconfig=/tmp/.npmrc-deployment-user \
  --globalconfig=/tmp/.npmrc-deployment-global \
  --prefer-offline=false \
  --ignore-scripts=false \
  --unsafe-perm=true \
  --no-optional \
  --no-shrinkwrap \
  --no-package-lock

if [ $? -ne 0 ]; then
  echo "⚠️ npm ci failed, trying npm install..."
  npm install \
    --cache=/tmp/.npm-deployment-cache \
    --tmp=/tmp \
    --no-audit \
    --no-fund \
    --loglevel=warn \
    --userconfig=/tmp/.npmrc-deployment-user \
    --globalconfig=/tmp/.npmrc-deployment-global \
    --prefer-offline=false \
    --ignore-scripts=false \
    --unsafe-perm=true \
    --no-optional \
    --no-shrinkwrap \
    --no-package-lock
  
  if [ $? -ne 0 ]; then
    echo "❌ Dependency installation failed completely"
    exit 1
  fi
fi

echo "✅ Dependencies installed with enhanced isolation"

# Build frontend with enhanced settings
echo "🎨 Building frontend with enhanced settings..."
NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=1024" \
NPM_CONFIG_CACHE="/tmp/.npm-deployment-cache" \
vite build

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed"
  exit 1
fi

echo "✅ Frontend build completed with enhanced settings"

# Build backend with enhanced settings
echo "⚙️ Building backend with enhanced settings..."
NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=1024" \
NPM_CONFIG_CACHE="/tmp/.npm-deployment-cache" \
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

if [ $? -ne 0 ]; then
  echo "❌ Backend build failed"
  exit 1
fi

echo "✅ Backend build completed with enhanced settings"

# Verify build output with enhanced checks
echo "🔍 Enhanced build verification..."
if [ -f "dist/index.js" ]; then
  echo "✅ Backend build verified"
  ls -la dist/index.js
else
  echo "❌ Backend build verification failed"
  exit 1
fi

if [ -d "dist/assets" ]; then
  echo "✅ Frontend build verified"
  ls -la dist/assets/ | head -5
else
  echo "❌ Frontend build verification failed"
  exit 1
fi

echo ""
echo "🎉 ENHANCED BUILD COMPLETED SUCCESSFULLY!"
echo "✅ Complete cache isolation maintained throughout build"
echo "✅ All permission issues bypassed"
echo "✅ Build output verified and ready"
echo "🚀 Ready for enhanced Replit deployment"