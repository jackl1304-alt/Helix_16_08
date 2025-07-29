#!/bin/bash
echo "FORCING REPLIT HOSTING UPDATE"
echo "============================="

# 1. Rebuild everything
echo "Step 1: Clean rebuild..."
rm -rf dist/
npm run build

# 2. Force copy static files
echo "Step 2: Force copying static files..."
rm -rf server/public/*
cp -r dist/public/* server/public/

# 3. Create deployment trigger files
echo "Step 3: Creating deployment triggers..."
echo "$(date): Force update $(date +%s)" > DEPLOY_NOW.txt
echo "Production ready: $(date)" > server/PRODUCTION_READY

# 4. Verify production setup
echo "Step 4: Verifying production setup..."
echo "Static files:"
ls -la server/public/
echo ""
echo "Production server files:"
ls -la dist/

# 5. Test production locally
echo "Step 5: Testing production build..."
timeout 3s NODE_ENV=production node dist/index.js > /dev/null 2>&1 &
sleep 2
API_RESPONSE=$(curl -s http://localhost:5000/api/data-sources 2>/dev/null | head -c 50)
pkill -f "node dist/index.js" 2>/dev/null

if [[ "$API_RESPONSE" == *"bfarm_guidelines"* ]]; then
    echo "✅ Production API working: $API_RESPONSE"
else
    echo "❌ Production API failed"
fi

echo ""
echo "DEPLOYMENT FORCED - NOW DEPLOY!"
echo "==============================="
echo "The hosting version should update after deployment."