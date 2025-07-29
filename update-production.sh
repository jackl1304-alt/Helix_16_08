#!/bin/bash
echo "🚀 UPDATING PRODUCTION FOR REPLIT HOSTING"
echo "========================================"

# Ensure static files are in the right place
echo "📁 Ensuring static files are ready..."
mkdir -p server/public
cp -r dist/public/* server/public/ 2>/dev/null || echo "Static files already copied"

# Verify files exist
echo "✅ Production files status:"
echo "  - dist/index.js: $([ -f dist/index.js ] && echo 'EXISTS' || echo 'MISSING')"
echo "  - server/public/index.html: $([ -f server/public/index.html ] && echo 'EXISTS' || echo 'MISSING')"
echo "  - server/public/assets/: $([ -d server/public/assets ] && echo 'EXISTS' || echo 'MISSING')"

# Force Replit to recognize the change
touch .replit-deploy-$(date +%s)

echo ""
echo "🎯 PRODUCTION UPDATE COMPLETE!"
echo "================================"
echo "Next step: Click the DEPLOY button to update the hosted version."
echo "The changes will be live at: https://helixv1-delta.replit.app"