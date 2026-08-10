@echo off
title AI Finance Project Launcher
echo ==================================================
echo 🚀 Launching AI Finance Management System
echo ==================================================

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on http://localhost:8000...
start "FastAPI Backend" cmd /k "python -m uvicorn backend.main:app --port 8000 --reload"

timeout /t 3 >nul

echo [2/2] Starting React Frontend on http://localhost:5173...
cd frontend
start "React Frontend" cmd /k "npm run dev"

echo ==================================================
echo ✅ Project Launched Successfully!
echo • Frontend UI: http://localhost:5173
echo • Backend API: http://localhost:8000/docs
echo ==================================================
pause
