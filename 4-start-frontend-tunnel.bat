@echo off
title Frontend + Tunnel
cd /d %~dp0frontend

echo ========================================
echo  STARTING FRONTEND SERVER + TUNNEL
echo ========================================
echo.

:: Start frontend server in background
start "Frontend Server" cmd /c "npm run dev -- --host"

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
