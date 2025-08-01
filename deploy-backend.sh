#!/bin/bash

# Backend Deployment Script
echo "🚀 Starting backend deployment..."

# Navigate to backend directory
cd backend

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install --production

# Create necessary directories if they don't exist
echo "📁 Creating necessary directories..."
mkdir -p server/data
mkdir -p server/exports
mkdir -p server/data/backups

# Check if essential data files exist
echo "🔍 Checking data files..."
if [ ! -f "server/data/teachers.json" ]; then
    echo "⚠️  Warning: teachers.json not found in server/data/"
fi

if [ ! -f "server/data/subjects.json" ]; then
    echo "⚠️  Warning: subjects.json not found in server/data/"
fi

if [ ! -f "server/data/requests.json" ]; then
    echo "⚠️  Warning: requests.json not found in server/data/"
fi

# Create .env template if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env template..."
    cat > .env << EOL
PORT=5000
NODE_ENV=production

# Email configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secure-jwt-secret-here

# Clerk Authentication (if using)
CLERK_SECRET_KEY=your_clerk_secret_key
EOL
    echo "⚠️  Please edit .env file with your actual configuration"
fi

echo "✅ Backend deployment preparation completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your production configuration"
echo "2. Ensure your data files are in server/data/ directory"
echo "3. Start the server with: npm start"
echo "4. Or use a process manager like PM2: pm2 start server/server.js"