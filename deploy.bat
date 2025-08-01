@echo off
REM Windows Deployment Batch Script

echo 🚀 Starting full deployment process...
echo.

REM Deploy Backend
echo ========================================
echo 📦 BACKEND DEPLOYMENT
echo ========================================
cd backend
echo Installing backend dependencies...
call npm install --production
if %errorlevel% neq 0 (
    echo ❌ Backend deployment failed!
    pause
    exit /b 1
)

REM Create necessary directories
if not exist "server\data" mkdir server\data
if not exist "server\exports" mkdir server\exports
if not exist "server\data\backups" mkdir server\data\backups

echo ✅ Backend deployment completed!
echo.

REM Deploy Frontend
echo ========================================
echo 🌐 FRONTEND DEPLOYMENT
echo ========================================
cd ..\frontend
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed!
    pause
    exit /b 1
)

echo Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo ✅ Frontend build completed!
echo.

REM Go back to root
cd ..

echo ========================================
echo 🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Frontend build files: frontend\build\
echo Backend server: backend\server\server.js
echo.
echo Next steps:
echo 1. Configure environment variables in backend\.env
echo 2. Start backend: cd backend ^&^& npm start
echo 3. Deploy frontend build files to your web server
echo.
pause