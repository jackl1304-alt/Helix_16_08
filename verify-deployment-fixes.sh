#!/bin/bash
# Verify deployment fixes are working

echo "🔍 Verifying deployment cache fixes..."

# Check environment variables
echo "Cache Environment Variables:"
env | grep NPM_CONFIG || echo "No NPM_CONFIG vars found"

# Check .npmrc
echo "NPM Configuration:"
cat .npmrc

# Check cache directories
echo "Cache Directories:"
ls -la /tmp/npm-* 2>/dev/null || echo "No cache dirs in /tmp"

# Test npm without cache
echo "Testing NPM without cache access:"
npm config get cache

echo "✅ Verification complete"