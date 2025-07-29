#!/bin/bash
# Verify all cache fixes are working

echo "🔍 Verifying all NPM deployment fixes..."

echo "1️⃣ NPM Configuration:"
cat .npmrc
echo ""

echo "2️⃣ Cache Directories:"
ls -la /tmp/npm-safe-cache 2>/dev/null || echo "Cache directory not found"
echo ""

echo "3️⃣ NPM Config Test:"
npm config get cache
echo ""

echo "4️⃣ Package Installation Test:"
npm ls --depth=0 | head -5

echo "✅ Verification complete"