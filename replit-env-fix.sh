#!/bin/bash
echo "REPLIT ENVIRONMENT VARIABLE FIX"
echo "==============================="

# Check current environment
echo "Current DATABASE_URL: ${DATABASE_URL:0:20}..."
echo "Current NODE_ENV: $NODE_ENV"
echo "Current PWD: $PWD"

# Create environment file for deployment
cat > .env.deployment << EOF
DATABASE_URL=$DATABASE_URL
NODE_ENV=production
PORT=5000
EOF

echo "Created .env.deployment file"
echo "Environment variables configured for deployment"