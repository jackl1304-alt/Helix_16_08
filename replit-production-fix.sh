#!/bin/bash
echo "🔧 REPLIT PRODUCTION DATABASE FIX"
echo "=================================="

# Check current database status
echo "1. Checking database status..."
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL is available"
    echo "First 30 chars: ${DATABASE_URL:0:30}..."
else
    echo "❌ DATABASE_URL is missing"
    echo "Checking alternatives..."
    
    # Check for alternative environment variables
    for var in POSTGRES_URL DATABASE_CONNECTION_STRING DB_URL NEON_DATABASE_URL REPLIT_DB_URL; do
        if [ -n "${!var}" ]; then
            echo "✅ Found $var"
            echo "Setting DATABASE_URL=$var"
            export DATABASE_URL="${!var}"
            break
        fi
    done
fi

# Build for production
echo "2. Building for production..."
npm run build

# Copy static files
echo "3. Copying static files..."
cp -r dist/public/* server/public/

# Verify build
echo "4. Verifying build..."
if [ -f "dist/index.js" ]; then
    echo "✅ Production build ready: $(du -h dist/index.js | cut -f1)"
else
    echo "❌ Production build failed"
    exit 1
fi

if [ -d "server/public" ]; then
    echo "✅ Static files ready: $(ls server/public/ | wc -l) files"
else
    echo "❌ Static files missing"
    exit 1
fi

echo "5. Final check..."
echo "DATABASE_URL status: ${DATABASE_URL:+CONFIGURED}"
echo "Production files ready: ✅"
echo ""
echo "🚀 Ready for deployment!"
echo "Click the DEPLOY button now."