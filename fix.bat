
@echo off
echo ==============================================
echo FIXING GIT DEPLOYMENT
echo ==============================================
echo.
echo [*] Cleaning up stuck Git processes...
taskkill /F /IM git.exe >nul 2>&1
timeout /T 2 /NOBREAK > nul

echo [*] Deleting the corrupted 120MB history...
rmdir /s /q .git

echo [*] Setting up a clean Git deployment...
git init
git add .
git commit -m "Clean Deployment without bloated cache files"
git branch -M main
git remote add origin https://github.com/musoke-hacker/agri-products-invest-rab.rw.git

echo [*] Starting the GitHub upload...
call auto-deploy.bat

echo.
echo ==============================================
echo FIX APPLIED SUCCESSFULLY.
echo Proceed to your Vercel Dashboard to deploy!
echo ==============================================
pause
