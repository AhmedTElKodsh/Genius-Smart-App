@echo off
echo Starting Genius Smart Backend Server...
cd server
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting server...
node server.js
pause