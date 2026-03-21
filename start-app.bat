@echo off
title AGRI-PRODUCTS INVEST EXCHANGE - Dev Server
color 0A
echo.
echo  ============================================
echo   AGRI-PRODUCTS INVEST EXCHANGE
echo   Starting development server...
echo  ============================================
echo.

:: Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Remove stale lock file if exists
if exist ".next\dev\lock" del /f ".next\dev\lock" >nul 2>&1

:: Start the Next.js server in background
echo  [1/2] Starting Next.js server on http://localhost:3000 ...
start "AgriInvest Server" /min E:\PROGRAMS\node.exe E:\PROGRAMS\node_modules\npm\bin\npm-cli.js run dev

:: Wait for the server to be ready
echo  [2/2] Waiting for server to be ready...
:WAIT_LOOP
timeout /t 3 /nobreak >nul
E:\PROGRAMS\node.exe -e "const http=require('http');const req=http.get('http://localhost:3000',()=>{process.exit(0)});req.on('error',()=>{process.exit(1)});req.end();" >nul 2>&1
if errorlevel 1 (
    echo      Still starting... please wait...
    goto WAIT_LOOP
)

:: Open Chrome
echo.
echo  ============================================
echo   App is READY! Opening Chrome...
echo  ============================================
echo.
start chrome.exe http://localhost:3000/login

echo  Server is running. Close this window to STOP the server.
echo  Or keep it open to see logs.
pause > nul
