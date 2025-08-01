@echo off
REM Development startup script

echo 🚀 Starting Genius Smart App Development Environment...
echo.

REM Start Backend
echo ========================================
echo 📦 Starting Backend Server
echo ========================================
cd backend
start "Backend Server" cmd /k "npm run dev"
echo Backend server starting on http://localhost:5000
echo.

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend
echo ========================================
echo 🌐 Starting Frontend Development Server
echo ========================================
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"
echo Frontend server starting on http://localhost:5173
echo.

echo ========================================
echo 🎉 DEVELOPMENT SERVERS STARTED!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul