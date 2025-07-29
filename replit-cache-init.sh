#!/bin/bash
# Initialize Replit-safe cache directories with proper permissions

echo "📁 Initializing Replit-safe cache directories..."

# Create all necessary cache directories in /tmp (writable on Replit)
CACHE_DIRS=(
  "/tmp/.npm-replit-cache"
  "/tmp/.npm-replit-init"
  "/tmp/.npm-replit-prefix"
  "/tmp/.npm-replit-store"
  "/tmp/.npm-replit-global"
  "/tmp/.npm-replit-user"
  "/tmp/.cache-replit"
)

for dir in "${CACHE_DIRS[@]}"; do
  if mkdir -p "$dir" 2>/dev/null; then
    chmod 755 "$dir" 2>/dev/null || true
    echo "✅ Created: $dir"
  else
    echo "⚠️ Could not create: $dir"
  fi
done

# Create npm configuration files in writable locations
echo "📝 Creating npm configuration files..."

# Global npm config for Replit
cat > /tmp/.npmrc-replit-global << 'EOF'
cache=/tmp/.npm-replit-cache
tmp=/tmp
prefix=/tmp/.npm-replit-prefix
store-dir=/tmp/.npm-replit-store
init-cache=/tmp/.npm-replit-init
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
cache-max=0
cache-min=0
ignore-scripts=false
EOF

# User npm config for Replit
cat > /tmp/.npmrc-replit-user << 'EOF'
cache=/tmp/.npm-replit-cache
tmp=/tmp
fund=false
audit=false
update-notifier=false
progress=false
EOF

echo "✅ NPM configuration files created"

# Test cache directory access
echo "🧪 Testing cache directory access..."
if [ -w "/tmp/.npm-replit-cache" ]; then
  echo "✅ Cache directory is writable"
  touch "/tmp/.npm-replit-cache/.test" && rm "/tmp/.npm-replit-cache/.test" 2>/dev/null
  echo "✅ Cache directory write test passed"
else
  echo "❌ Cache directory is not writable"
fi

echo "🚀 Cache initialization complete"