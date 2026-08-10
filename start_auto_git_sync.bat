@echo off
title Auto Git Sync Service
echo Starting Auto Git Sync Service...
cd /d "%~dp0"
python auto_git_sync.py
pause
