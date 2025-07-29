#!/bin/bash
echo "🔄 FORCING REPLIT DEPLOYMENT UPDATE"
echo "=================================="

# Force rebuild
npm run build
cp -r dist/public/* server/public/

# Create deployment marker
echo "$(date): Production deployment ready" > .deployment-ready

echo "✅ Deployment forced. The Deploy button should now use the new version."
echo "👉 Click Deploy in the top-right corner to update the hosted version."