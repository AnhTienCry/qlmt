@echo off
title Set API URL
cd /d %~dp0

echo ========================================
echo  SET BACKEND URL FOR FRONTEND
echo ========================================
echo.
echo Paste URL backend (vd: https://xxx-xxx.trycloudflare.com)
echo.
set /p BACKEND_URL=URL: 

echo VITE_API_URL=%BACKEND_URL%/api> frontend\.env.local

echo.
echo ========================================
echo  DONE! Now run 4-start-frontend-tunnel.bat
echo ========================================
pause
