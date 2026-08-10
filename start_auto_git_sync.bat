@echo off
title Auto Git Sync Service - finace1 (p27012026)
cd /d "%~dp0"
echo ============================================================
echo   Starting Auto Git Sync for Repository: finace1
echo   User: p27012026 (p27012026@gmail.com)
echo ============================================================
echo.

git config user.name "p27012026"
git config user.email "p27012026@gmail.com"

if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe auto_git_sync.py
) else (
    python auto_git_sync.py
)

pause
