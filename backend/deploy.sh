#!/bin/bash

# Hostinger Deployment Script for ZetrexKeys
# This script prepares the project for upload to Hostinger File Manager

echo "🚀 Preparing ZetrexKeys for Hostinger deployment..."
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps for Hostinger deployment:"
echo ""
echo "1. Upload these files to Hostinger File Manager:"
echo "   - All files in the backend directory (including node_modules)"
echo "   - DO NOT upload: .env, node_modules/.cache"
echo ""
echo "2. In Hostinger hPanel:"
echo "   - Go to Setup → Node.js Selector"
echo "   - Create a new Node.js application"
echo "   - Set the startup file to: server.js"
echo "   - Set the document root to: public"
echo ""
echo "3. Add environment variables in Hostinger:"
echo "   - Set FRONTEND_URL to your Hostinger domain"
echo "   - Add all variables from backend/.env (MONGODB_URI, JWT_SECRET, etc.)"
echo ""
echo "4. MongoDB Atlas Whitelist:"
echo "   - Go to MongoDB Atlas → Network Access"
echo "   - Add IP: 0.0.0.0/0 (allows all IPs including Hostinger)"
echo ""
echo "5. Restart the Node.js application in Hostinger"
echo ""
echo "🌐 Your site should be live at your Hostinger domain!"
