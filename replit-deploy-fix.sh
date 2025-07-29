#!/bin/bash
# Replit deployment fix script to handle Node.js runtime module cache permission issues

echo "🔧 Applying Replit deployment fixes for Node.js module access..."

# Set environment variables to fix cache permission issues
export NPM_CONFIG_CACHE="/tmp/.npm-replit-cache"
export NPM_CONFIG_TMP="/tmp"
export NPM_CONFIG_INIT_CACHE="/tmp/.npm-replit-init"
export NPM_CONFIG_GLOBALCONFIG="/tmp/.npmrc-replit-global"
export NPM_CONFIG_USERCONFIG="/tmp/.npmrc-replit-user"
export NPM_CONFIG_PREFIX="/tmp/.npm-replit-prefix"
export NPM_CONFIG_STORE_DIR="/tmp/.npm-replit-store"
export DISABLE_NPM_CACHE="true"
export DISABLE_OPENCOLLECTIVE="true"
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=1024"
export NPM_CONFIG_PROGRESS="false"
export NPM_CONFIG_LOGLEVEL="warn"
export NPM_CONFIG_AUDIT="false"
export NPM_CONFIG_FUND="false"
export NPM_CONFIG_UPDATE_NOTIFIER="false"
export NPM_CONFIG_PACKAGE_LOCK="false"
export NPM_CONFIG_SHRINKWRAP="false"

echo "✅ Environment variables set for cache redirection"

# Create writable cache directories with proper permissions
echo "📁 Creating cache directories with proper permissions..."
mkdir -p /tmp/.npm-replit-cache
mkdir -p /tmp/.npm-replit-init  
mkdir -p /tmp/.npm-replit-prefix
mkdir -p /tmp/.npm-replit-store
mkdir -p /tmp/.npm-replit-global
mkdir -p /tmp/.npm-replit-user
chmod -R 755 /tmp/.npm-replit*

echo "✅ Cache directories created with 755 permissions"

# Create npm configuration files in writable locations
echo "📝 Creating npm configuration files..."
cat > /tmp/.npmrc-replit-global << 'EOF'
cache=/tmp/.npm-replit-cache
tmp=/tmp
prefix=/tmp/.npm-replit-prefix
store-dir=/tmp/.npm-replit-store
fund=false
audit=false
update-notifier=false
disable-opencollective=true
progress=false
loglevel=warn
package-lock=false
shrinkwrap=false
prefer-online=true
unsafe-perm=true
EOF

cat > /tmp/.npmrc-replit-user << 'EOF'
cache=/tmp/.npm-replit-cache
tmp=/tmp
fund=false
audit=false
EOF

echo "✅ NPM configuration files created"

# Clear any problematic existing cache without touching protected system directories
echo "🧹 Clearing problematic cache files..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true

# Clear npm cache with new configuration
npm cache clean --force --userconfig=/tmp/.npmrc-replit-user --globalconfig=/tmp/.npmrc-replit-global 2>/dev/null || true

echo "✅ Cache cleared successfully"

# Install dependencies with cache fixes
echo "📦 Installing dependencies with cache fixes..."
npm install --cache=/tmp/.npm-replit-cache \
  --tmp=/tmp \
  --no-audit \
  --no-fund \
  --loglevel=warn \
  --userconfig=/tmp/.npmrc-replit-user \
  --globalconfig=/tmp/.npmrc-replit-global \
  --include=dev

if [ $? -eq 0 ]; then
  echo "✅ Dependencies installed successfully"
else
  echo "❌ Dependency installation failed"
  exit 1
fi

# Build the application with cache fixes
echo "🏗️ Building application with cache fixes..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully"
  echo "🚀 Replit deployment ready!"
else
  echo "❌ Build failed"
  exit 1
fi

# Start the application
echo "🚀 Starting application..."
exec npm run start