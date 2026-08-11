@echo off
title Auto Git Sync Service - finace1
echo ==================================================
echo 🔄 Starting Auto Git Sync Service for finace1
echo ==================================================

cd /d "%~dp0"
python auto_git_sync.py

pause
