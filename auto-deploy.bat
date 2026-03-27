@echo off
setlocal
set PATH=%PATH%;"C:\Program Files\Git\cmd";"C:\Program Files (x86)\Git\cmd";"%USERPROFILE%\AppData\Local\Programs\Git\cmd"

echo 🚀 Pre-configuring Git...
git config --global user.email "musoke-hacker@users.noreply.github.com"
git config --global user.name "musoke-hacker"

echo 🚀 Starting Automatic Git Deployment...
git init
git add .
git commit -m "🚀 Complete Final App - 200 Products Seeded"
git branch -M main
git remote set-url origin https://github.com/musoke-hacker/agri-products-invest-rab.rw.git || git remote add origin https://github.com/musoke-hacker/agri-products-invest-rab.rw.git
git push origin main --force

echo ✅ Deployment Finished!
pause
