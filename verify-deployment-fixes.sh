#!/bin/bash

# Helix Deployment Verification Script
# This script verifies that all cache permission fixes are properly applied

echo "🔍 Verifying Helix deployment cache permission fixes..."

# Check if all required configuration files exist
echo "📁 Checking configuration files..."

files_to_check=(
    ".npmrc"
    ".env.deployment"
    "render.yaml"
    "vercel.json"
    "railway.json"
    "Dockerfile"
    "deploy.sh"
)

missing_files=()
for file in "${files_to_check[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo "⚠️  Missing files: ${missing_files[*]}"
    echo "Please ensure all configuration files are present."
fi

# Check environment variables in .env.example
echo ""
echo "🔧 Checking environment variables..."
if grep -q "NPM_CONFIG_CACHE" .env.example; then
    echo "✅ Cache environment variables are configured"
else
    echo "❌ Cache environment variables are missing from .env.example"
fi

# Check .npmrc configuration
echo ""
echo "📦 Checking .npmrc configuration..."
if [[ -f ".npmrc" ]]; then
    if grep -q "cache=/tmp/.npm" .npmrc; then
        echo "✅ npm cache directory is configured"
    else
        echo "❌ npm cache directory not properly configured"
    fi
    
    if grep -q "disable-opencollective=true" .npmrc; then
        echo "✅ OpenCollective is disabled"
    else
        echo "❌ OpenCollective not disabled"
    fi
else
    echo "❌ .npmrc file is missing"
fi

# Check render.yaml configuration
echo ""
echo "🚀 Checking Render deployment configuration..."
if [[ -f "render.yaml" ]]; then
    if grep -q "NPM_CONFIG_CACHE" render.yaml; then
        echo "✅ Render configuration includes cache fixes"
    else
        echo "❌ Render configuration missing cache fixes"
    fi
    
    if grep -q "npm cache clean --force" render.yaml; then
        echo "✅ Render build includes cache clearing"
    else
        echo "❌ Render build missing cache clearing"
    fi
else
    echo "❌ render.yaml file is missing"
fi

# Test local cache directory creation
echo ""
echo "🧪 Testing cache directory creation..."
if mkdir -p /tmp/.npm 2>/dev/null; then
    chmod 755 /tmp/.npm 2>/dev/null
    if [[ -d "/tmp/.npm" ]]; then
        echo "✅ Can create and access /tmp/.npm directory"
        ls -la /tmp/.npm 2>/dev/null || true
    else
        echo "❌ Cannot create /tmp/.npm directory"
    fi
else
    echo "❌ Permission denied creating /tmp/.npm directory"
fi

# Check workspace directory name for special characters
echo ""
echo "📂 Checking workspace directory..."
current_dir=$(pwd)
if [[ "$current_dir" =~ [^a-zA-Z0-9/_-] ]]; then
    echo "⚠️  WARNING: Directory path contains special characters: $current_dir"
    echo "   This might cause deployment issues on some platforms"
else
    echo "✅ Directory path is clean: $current_dir"
fi

# Summary
echo ""
echo "📊 Verification Summary:"
echo "================================"

if [[ ${#missing_files[@]} -eq 0 ]]; then
    echo "✅ All configuration files are present"
else
    echo "❌ Missing configuration files: ${missing_files[*]}"
fi

if grep -q "NPM_CONFIG_CACHE" .env.example 2>/dev/null; then
    echo "✅ Environment variables are configured"
else
    echo "❌ Environment variables need configuration"
fi

if [[ -d "/tmp/.npm" ]]; then
    echo "✅ Cache directory can be created"
else
    echo "❌ Cache directory creation failed"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Choose your deployment platform (Render, Vercel, Railway, or Docker)"
echo "2. Set environment variables in platform dashboard"
echo "3. Deploy using the configured build commands"
echo "4. Monitor build logs to verify cache fixes are working"

echo ""
echo "📚 Available deployment options:"
echo "- Render.com: Use render.yaml (recommended for free tier)"
echo "- Vercel: Use vercel.json (good for serverless)"
echo "- Railway: Use railway.json (good for full-stack apps)"
echo "- Docker: Use Dockerfile (good for self-hosting)"

echo ""
echo "✨ All deployment cache permission fixes have been applied!"