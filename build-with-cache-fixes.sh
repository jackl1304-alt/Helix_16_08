#!/bin/bash
# Build script with all cache fixes applied for Replit deployment

echo "🏗️ Building application with cache fixes for Replit deployment..."

# Source the pre-build fixes
source pre-build-replit.sh

# Install dependencies with cache fixes
echo "📦 Installing dependencies with cache fixes..."
npm install \
  --cache=/tmp/.npm-replit-cache \
  --tmp=/tmp \
  --no-audit \
  --no-fund \
  --loglevel=warn \
  --userconfig=/tmp/.npmrc-replit-user \
  --globalconfig=/tmp/.npmrc-replit-global \
  --include=dev

if [ $? -ne 0 ]; then
  echo "❌ Dependency installation failed"
  exit 1
fi

echo "✅ Dependencies installed successfully"

# Build frontend
echo "🎨 Building frontend with Vite..."
npm run build 2>&1 | tee build.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "❌ Frontend build failed"
  cat build.log
  exit 1
fi

echo "✅ Frontend build completed"

# Build backend
echo "⚙️ Building backend with esbuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

if [ $? -ne 0 ]; then
  echo "❌ Backend build failed"
  exit 1
fi

echo "✅ Backend build completed"

# Verify build output
if [ -f "dist/index.js" ] && [ -d "dist/assets" ]; then
  echo "✅ Build verification passed"
  echo "📦 Build files:"
  ls -la dist/
else
  echo "❌ Build verification failed"
  exit 1
fi

echo ""
echo "🎉 BUILD COMPLETED SUCCESSFULLY WITH ALL CACHE FIXES!"
echo "🚀 Ready for Replit deployment"