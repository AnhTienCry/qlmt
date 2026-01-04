@echo off
title Set API URL
cd /d %~dp0

echo ========================================
echo  SET BACKEND URL FOR PRODUCTION
echo ========================================
echo.
echo Paste URL backend tunnel (vd: https://xxx-xxx.trycloudflare.com)
echo.
set /p BACKEND_URL=URL: 

:: Update .env.production
echo VITE_API_URL=%BACKEND_URL%/api> frontend\.env.production

echo.
echo ========================================
echo  DONE! Updated .env.production
echo  Now run 4-start-frontend-tunnel.bat
echo ========================================
pause
