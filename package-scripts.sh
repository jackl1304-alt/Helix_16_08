#!/bin/bash
# Package script workarounds for enhanced cache clearing and deployment

echo "📦 Package script workarounds for Replit deployment"

# Script: build with cache clearing
build_with_cache_clear() {
  echo "🧹 Clearing cache before build..."
  rm -rf node_modules/.cache || true
  npm cache clean --force --cache=/tmp/.npm-deployment-cache || true
  
  echo "🏗️ Building with enhanced cache settings..."
  NPM_CONFIG_CACHE="/tmp/.npm-deployment-cache" vite build
  NPM_CONFIG_CACHE="/tmp/.npm-deployment-cache" npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
}

# Script: start with enhanced settings
start_replit() {
  NODE_OPTIONS='--max-old-space-size=4096 --max-semi-space-size=1024' \
  NODE_ENV=production \
  NPM_CONFIG_CACHE="/tmp/.npm-deployment-cache" \
  node dist/index.js
}

# Script: deploy for Replit
deploy_replit() {
  echo "🚀 Replit deployment with enhanced cache fixes..."
  source enhanced-pre-build.sh
  build_with_cache_clear
  echo "✅ Ready for Replit deployment"
}

# Script: verify deployment readiness
verify_deployment() {
  echo "🔍 Verifying deployment readiness..."
  source enhanced-pre-build.sh
  bash verify-cache-fixes.sh
}

# Execute based on first argument
case "$1" in
  "build")
    build_with_cache_clear
    ;;
  "start")
    start_replit
    ;;
  "deploy")
    deploy_replit
    ;;
  "verify")
    verify_deployment
    ;;
  *)
    echo "Usage: $0 {build|start|deploy|verify}"
    echo "  build  - Build with cache clearing"
    echo "  start  - Start with enhanced settings"
    echo "  deploy - Deploy for Replit"
    echo "  verify - Verify deployment readiness"
    ;;
esac