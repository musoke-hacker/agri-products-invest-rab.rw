@echo off
setlocal
title AGRI-PRODUCTS INVEST EXCHANGE - Auto-Run

echo  ============================================
echo   AGRI-PRODUCTS INVEST EXCHANGE
echo   Stabilizing environment...
echo  ============================================

:: Close existing instances
echo  [*] Cleaning up old processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

:: Remove lock files
if exist ".next\dev\lock" (
    echo  [*] Removing stale lock file...
    del /f /q ".next\dev\lock" >nul 2>&1
)

:: Start Server
echo  [*] Starting Next.js Dev Server...
:: Using absolute path to node and npm-cli as identified on this system
start "AgriInvest Server" /min "E:\PROGRAMS\node.exe" "E:\PROGRAMS\node_modules\npm\bin\npm-cli.js" run dev

echo  [*] Waiting for server to initialize at http://localhost:3000...
echo      (This may take 1-2 minutes on first start)

:WAIT_PORT
timeout /t 5 /nobreak >nul
netstat -ano | findstr :3000 | findstr LISTENING >nul
if errorlevel 1 (
    echo      Server still booting... please wait...
    goto WAIT_PORT
)

echo.
echo  ============================================
echo   SUCCESS: App is READY!
echo   Launching and redirecting to Login...
echo  ============================================
echo.

:: Open the default browser to the login page
start "" "http://localhost:3000/login"

echo.
echo  Keep this window open to maintain the server.
echo  Press any key to EXIT and STOP the server.
pause > nul

:: When user presses key, kill the server
taskkill /F /IM node.exe /T >nul 2>&1
exit
