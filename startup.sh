#!/bin/bash
# Azure App Service startup script for Node.js

echo "Starting GitHubSpark application..."

# Ensure we're in the app directory
cd /home/site/wwwroot

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Check if dist directory exists, if not build the application
if [ ! -d "dist" ]; then
    echo "Building application..."
    npm run build
fi

# Start the application
echo "Starting Node.js server..."
npm start
