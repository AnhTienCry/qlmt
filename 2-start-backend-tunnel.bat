@echo off
title Backend + Tunnel
cd /d %~dp0

echo ========================================
echo  STARTING BACKEND SERVER + TUNNEL
echo ========================================
echo.

:: Kill any existing process on port 5000
echo Killing existing process on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
echo Done!
echo.

:: Start backend server in background
cd backend
start "Backend Server" cmd /c "npm run dev"

:: Wait for server to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

:: Start cloudflare tunnel
echo.
echo ========================================
echo  COPY URL BELOW AND UPDATE .env.production
echo  Then run 3-set-api-url.bat
echo ========================================
echo.
cloudflared tunnel --url http://localhost:5000
