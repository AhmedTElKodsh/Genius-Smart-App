@echo off
echo Starting Genius Smart Backend Server...
echo.
node server.js 2>&1
if errorlevel 1 (
    echo.
    echo Server failed to start. Check the error message above.
    pause
) else (
    echo Server is running...
)