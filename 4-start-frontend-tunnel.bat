@echo off
title Frontend + Tunnel
cd /d %~dp0

echo ========================================
echo  STARTING FRONTEND SERVER + TUNNEL
echo ========================================
echo.

:: Kill any existing process on port 5173
echo Killing existing process on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
echo Done!
echo.

:: Start frontend with PRODUCTION env
cd frontend
echo Starting frontend with .env.production...
start "Frontend Server" cmd /c "npm run dev -- --host --mode production"

:: Wait for server to start
echo Waiting for frontend to start...
timeout /t 8 /nobreak >nul

:: Start cloudflare tunnel
echo.
echo ========================================
echo  SHARE THIS URL TO ACCESS YOUR WEBSITE
echo ========================================
echo.
cloudflared tunnel --url http://localhost:5173
