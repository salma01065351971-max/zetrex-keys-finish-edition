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
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ $line =~ ^#.*$ ]] && continue
        [[ -z $line ]] && continue
        
        # Split on first = to get key and value
        key="${line%%=*}"
        value="${line#*=}"
        
        # Skip if key is empty
        [[ -z $key ]] && continue
        
        # Remove inline comments from value
        value=$(echo "$value" | sed 's/ #.*$//')
        
        # Remove surrounding quotes if present
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        # Skip if value is empty after processing
        [[ -z $value ]] && continue
        
        # Remove existing variable if it exists, then add new value
        echo "Removing existing $key (if exists)..."
        vercel env rm "$key" production --yes &> /dev/null
        vercel env rm "$key" development --yes &> /dev/null
        
        # Set environment variable for production and development environments
        echo "Setting: $key for production"
        vercel env add "$key" production --value "$value"
        echo "Setting: $key for development"
        vercel env add "$key" development --value "$value"
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
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ $line =~ ^#.*$ ]] && continue
        [[ -z $line ]] && continue
        
        # Split on first = to get key and value
        key="${line%%=*}"
        value="${line#*=}"
        
        # Skip if key is empty
        [[ -z $key ]] && continue
        
        # Remove inline comments from value
        value=$(echo "$value" | sed 's/ #.*$//')
        
        # Remove surrounding quotes if present
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        # Skip if value is empty after processing
        [[ -z $value ]] && continue
        
        # Remove existing variable if it exists, then add new value
        echo "Removing existing $key (if exists)..."
        vercel env rm "$key" production --yes &> /dev/null
        vercel env rm "$key" development --yes &> /dev/null
        
        # Set environment variable for production and development environments
        echo "Setting: $key for production"
        vercel env add "$key" production --value "$value"
        echo "Setting: $key for development"
        vercel env add "$key" development --value "$value"
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
