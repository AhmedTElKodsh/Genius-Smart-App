#!/bin/bash

# Frontend Deployment Script
echo "🚀 Starting frontend deployment..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully!"
    echo "📁 Build files are ready in frontend/build/ directory"
    echo ""
    echo "Next steps:"
    echo "1. Upload the contents of frontend/build/ to your web server"
    echo "2. Configure your web server to serve index.html for all routes"
    echo "3. Set environment variables for production if needed"
else
    echo "❌ Frontend build failed!"
    exit 1
fi