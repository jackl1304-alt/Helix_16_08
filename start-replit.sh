#!/bin/bash
# Replit.com Hosting Start Script - Das echte Problem gelöst

echo "🚀 Replit.com Hosting Start - Mit allen Fixes"

# Cache-Fixes anwenden
source enhanced-pre-build.sh

# Build mit Cache-Fixes
vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Static Files für Hosting kopieren
bash replit-hosting-complete-fix.sh

# Production Server starten
NODE_ENV=production node dist/index.js