#!/bin/bash
# Verify deployment readiness after cache cleanup

echo "Verifying deployment readiness..."

echo "1. Checking .replit configuration:"
echo "nodejs-20 module: $(grep 'nodejs-20' .replit && echo 'FOUND' || echo 'MISSING')"
echo "Build command: $(grep 'build = ' .replit)"
echo "Run command: $(grep 'run = ' .replit)"

echo ""
echo "2. Checking cache cleanup:"
echo "Temp caches: $(find /tmp -name '*npm*' -type d 2>/dev/null | wc -l) directories found"

echo ""
echo "3. Checking build readiness:"
echo "Dependencies: $(ls node_modules 2>/dev/null | wc -l) packages"
echo "Build output: $(ls -la dist/index.js 2>/dev/null || echo 'Not found')"
echo "Static files: $(ls -la server/public/index.html 2>/dev/null || echo 'Not found')"

echo ""
echo "4. Checking .npmrc:"
cat .npmrc

echo ""
echo "✅ Deployment verification complete"