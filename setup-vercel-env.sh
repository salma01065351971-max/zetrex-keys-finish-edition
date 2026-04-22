#!/bin/bash

# Script to automatically push environment variables to Vercel
# Usage: ./setup-vercel-env.sh

echo "🚀 Setting up Vercel environment variables..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

echo ""
echo "📝 Setting Backend Environment Variables..."
echo ""

# Read backend .env file and set variables
if [ -f "backend/.env" ]; then
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        
        # Remove surrounding quotes if present
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        # Set environment variable for all environments (production, preview, development)
        echo "Setting: $key"
        vercel env add "$key" <<< "$value
production
preview
development
y" &> /dev/null || echo "  ⚠️  Failed to set $key"
    done < backend/.env
else
    echo "❌ backend/.env file not found!"
    exit 1
fi

echo ""
echo "📝 Setting Frontend Environment Variables..."
echo ""

# Read frontend .env file and set variables
if [ -f "frontend/.env" ]; then
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        
        # Remove surrounding quotes if present
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        # Set environment variable for all environments
        echo "Setting: $key"
        vercel env add "$key" <<< "$value
production
preview
development
y" &> /dev/null || echo "  ⚠️  Failed to set $key"
    done < frontend/.env
else
    echo "⚠️  frontend/.env file not found!"
fi

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review your environment variables in Vercel Dashboard"
echo "2. Trigger a new deployment to apply the changes"
echo "3. Your backend URL in vercel.json should point to: https://zetrexkey-backend.vercel.app"
