#!/bin/bash

# Genius Smart App - Project Reorganization Script
# This script reorganizes the project structure for better maintainability

echo "🚀 Starting Genius Smart App reorganization..."

# Create new directory structure
echo "📁 Creating new directory structure..."

# Create client directory for frontend
mkdir -p client/public
mkdir -p client/src

# Create docs directory structure
mkdir -p docs/development
mkdir -p docs/api
mkdir -p docs/database
mkdir -p docs/guides
mkdir -p docs/credentials
mkdir -p docs/design/mockups

# Create resources directory
mkdir -p resources/datasets

# Move frontend files to client directory
echo "📦 Moving frontend files to client directory..."

# Move frontend configuration files
mv package.json client/package.json 2>/dev/null || echo "package.json already in client"
mv package-lock.json client/package-lock.json 2>/dev/null || echo "package-lock.json already in client"
mv tsconfig.json client/tsconfig.json 2>/dev/null || echo "tsconfig.json already in client"
mv tsconfig.node.json client/tsconfig.node.json 2>/dev/null || echo "tsconfig.node.json already in client"
mv vite.config.ts client/vite.config.ts 2>/dev/null || echo "vite.config.ts already in client"
mv index.html client/index.html 2>/dev/null || echo "index.html already in client"

# Move src directory
mv src/* client/src/ 2>/dev/null || echo "src files already in client/src"
rm -rf src 2>/dev/null

# Move public directory
mv public/* client/public/ 2>/dev/null || echo "public files already in client/public"
rm -rf public 2>/dev/null

# Move documentation files
echo "📚 Organizing documentation..."

# Move development docs
mv ACTIVITY_TAB_IMPLEMENTATION.md docs/development/ 2>/dev/null
mv ADD_TEACHER_*.md docs/development/ 2>/dev/null
mv ALI_ARABIC_TEACHER_FIX.md docs/development/ 2>/dev/null
mv ALL_PAGES_TRANSLATION_FIXES.md docs/development/ 2>/dev/null
mv ANALYTICS_*.md docs/development/ 2>/dev/null
mv ARABIC_*.md docs/development/ 2>/dev/null
mv ATTENDANCE_DATASET_SUMMARY.md docs/development/ 2>/dev/null
mv BACKEND_FRONTEND_INTEGRATION_TEST.md docs/development/ 2>/dev/null
mv CHART_IMPROVEMENTS_AND_COMPARISON.md docs/development/ 2>/dev/null
mv CLERK_*.md docs/development/ 2>/dev/null
mv COMPREHENSIVE_ANALYTICS_RECOMMENDATIONS.md docs/development/ 2>/dev/null
mv DASHBOARD_SUBJECTS_TRANSLATION.md docs/development/ 2>/dev/null
mv DATABASE_ERP_DOCUMENTATION.md docs/database/ 2>/dev/null
mv DROPDOWN_TEXT_VISIBILITY_FIXES.md docs/development/ 2>/dev/null
mv DUPLICATE_DECLARATION_*.md docs/development/ 2>/dev/null
mv DYNAMIC_WEEKENDS_HOLIDAYS_IMPLEMENTATION.md docs/development/ 2>/dev/null
mv EDIT_TEACHER_MODAL_UI_UPGRADE.md docs/development/ 2>/dev/null
mv EMAIL_*.md docs/development/ 2>/dev/null
mv ENHANCED_HOLIDAY_*.md docs/development/ 2>/dev/null
mv FINAL_MODAL_IMPROVEMENTS.md docs/development/ 2>/dev/null
mv FIREBASE_REMOVAL_COMPLETE.md docs/development/ 2>/dev/null
mv HIERARCHICAL_MANAGEMENT_IMPLEMENTATION.md docs/development/ 2>/dev/null
mv HOLIDAY_SELECTION_INTERFACE_UPDATE.md docs/development/ 2>/dev/null
mv IMPROVED_SUCCESS_MESSAGE.md docs/development/ 2>/dev/null
mv KPI_*.md docs/development/ 2>/dev/null
mv LANGUAGE_SEPARATION_COMPLETE.md docs/development/ 2>/dev/null
mv LTR_DIRECTION_IMPLEMENTATION.md docs/development/ 2>/dev/null
mv NEW_TEACHER_NOTIFICATIONS_FIX.md docs/development/ 2>/dev/null
mv PASSWORD_RESET_TEST_GUIDE.md docs/guides/ 2>/dev/null
mv REAL_DATA_IMPORT_*.md docs/development/ 2>/dev/null
mv REQUESTS_*.md docs/development/ 2>/dev/null
mv RTL_*.md docs/development/ 2>/dev/null
mv SECURITY_TRANSLATION_FIXES_SUMMARY.md docs/development/ 2>/dev/null
mv SERVER_FIX_STATUS.md docs/development/ 2>/dev/null
mv SETTINGS_PAGE_IMPLEMENTATION_SUMMARY.md docs/development/ 2>/dev/null
mv SIDEBAR_AND_TRANSLATION_FIXES.md docs/development/ 2>/dev/null
mv STATISTICS_TAB_*.md docs/development/ 2>/dev/null
mv SUBJECT_*.md docs/development/ 2>/dev/null
mv SUBJECTS_TRANSLATION_FIXES.md docs/development/ 2>/dev/null
mv TRANSLATION_*.md docs/development/ 2>/dev/null
mv UI_*.md docs/development/ 2>/dev/null
mv WEEKEND_HOLIDAYS_FIXES.md docs/development/ 2>/dev/null

# Move design assets
mv Managers-pics/* docs/design/mockups/ 2>/dev/null
rm -rf Managers-pics 2>/dev/null

# Move datasets
echo "💾 Moving datasets to resources..."
mv *.csv resources/datasets/ 2>/dev/null
mv *.json resources/datasets/ 2>/dev/null
mv *.txt resources/datasets/ 2>/dev/null
mv *.html resources/datasets/ 2>/dev/null

# Keep specific JSON files in root that are needed
mv resources/datasets/package.json . 2>/dev/null || true
mv resources/datasets/package-lock.json . 2>/dev/null || true

# Move existing docs files to appropriate locations
mv docs/*.md docs/credentials/ 2>/dev/null || true
mv docs/*.csv docs/credentials/ 2>/dev/null || true

# Move the newly created documentation
mv PROJECT_ORGANIZATION_PLAN.md docs/ 2>/dev/null
mv docs/PROJECT_ARCHITECTURE.md docs/ 2>/dev/null
mv docs/DATABASE_DOCUMENTATION.md docs/database/ 2>/dev/null
mv docs/BACKEND_API_DOCUMENTATION.md docs/api/ 2>/dev/null

# Create client environment template
echo "VITE_CLERK_PUBLISHABLE_KEY=pk_***
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Genius Smart App" > client/.env.example

# Create root package.json for workspace
echo '{
  "name": "genius-smart-workspace",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "client",
    "server"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "build": "cd client && npm run build",
    "start": "cd server && npm start",
    "install:all": "npm install && cd client && npm install && cd ../server && npm install"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}' > package.json

# Create .gitignore if it doesn't exist
echo "# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist
client/dist

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Editor directories and files
.idea
.vscode
*.swp
*.swo
*~

# OS files
Thumbs.db

# Backup files
*.backup
*.bak

# Temporary files
*.tmp
*.temp
" > .gitignore

echo "✅ Project reorganization complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm run install:all"
echo "3. Update import paths in your code files"
echo "4. Update any hardcoded paths in configuration files"
echo "5. Test the application to ensure everything works"
echo ""
echo "📁 New structure:"
echo "  - client/     → Frontend application"
echo "  - server/     → Backend application"
echo "  - docs/       → All documentation"
echo "  - resources/  → Datasets and resources" 