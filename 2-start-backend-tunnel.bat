@echo off
title Backend + Tunnel
cd /d %~dp0backend

echo ========================================
echo  STARTING BACKEND SERVER + TUNNEL
echo ========================================
echo.

:: Start backend server in background
start "Backend Server" cmd /c "npm run dev"

:: Wait for server to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

:: Start cloudflare tunnel
echo.
echo ========================================
echo  COPY URL BELOW FOR set-api-url.bat
echo ========================================
echo.
cloudflared tunnel --url http://localhost:5000
