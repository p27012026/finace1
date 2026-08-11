import time
import subprocess
import sys
import io
import os
from datetime import datetime

# Force UTF-8 stdout for Windows console compatibility
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# User & Repository Parameters
USERNAME = "p27012026"
EMAIL = "p27012026@gmail.com"
REPO_NAME = "finace1"
TARGET_BRANCH = "main"

print("==================================================")
print("🔄 Auto Git Sync Service")
print(f"User: {USERNAME} <{EMAIL}>")
print(f"Repository: {REPO_NAME} | Branch: {TARGET_BRANCH}")
print("==================================================")

# 1. Configure Git credentials locally if needed
subprocess.run(["git", "config", "user.name", USERNAME], check=False)
subprocess.run(["git", "config", "user.email", EMAIL], check=False)

def get_remote_origin():
    try:
        res = subprocess.run(["git", "remote", "get-url", "origin"], capture_output=True, text=True)
        return res.stdout.strip()
    except Exception:
        return "Unknown"

def get_current_branch():
    try:
        res = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True, text=True)
        return res.stdout.strip() or TARGET_BRANCH
    except Exception:
        return TARGET_BRANCH

remote_url = get_remote_origin()
current_branch = get_current_branch()
print(f"📌 Active Remote: {remote_url}")
print(f"📌 Active Branch: {current_branch}")
print("==================================================")

def check_and_sync():
    try:
        # Check for uncommitted or untracked changes
        status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
        if status.stdout.strip():
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n📦 [{now_str}] Changes detected! Staging and committing...", flush=True)
            
            # Stage changes
            subprocess.run(["git", "add", "."], check=False)
            
            # Commit with clear timestamped message
            commit_msg = f"Auto sync updates: {now_str}"
            subprocess.run(["git", "commit", "-m", commit_msg], check=False)
            
            # Push to existing remote origin main
            print(f"🚀 Pushing to origin/{current_branch}...", flush=True)
            push_res = subprocess.run(["git", "push", "origin", current_branch], capture_output=True, text=True)
            
            if push_res.returncode == 0:
                print(f"✅ [{now_str}] Successfully synchronized with GitHub ({REPO_NAME})!", flush=True)
            else:
                err_out = push_res.stderr.strip() or push_res.stdout.strip()
                print(f"⚠️ [{now_str}] Push notice: {err_out}", flush=True)
        else:
            # Working tree is clean - avoid empty commits
            pass
    except Exception as e:
        print(f"⚠️ [{datetime.now().strftime('%H:%M:%S')}] Sync exception: {e}", flush=True)

# Main loop checking for changes every 5 seconds
print("👀 Active monitoring started. Save any file to trigger auto-sync (Press Ctrl+C to stop)...", flush=True)

# Initial sync check on launch
check_and_sync()

try:
    while True:
        check_and_sync()
        time.sleep(5)
except KeyboardInterrupt:
    print("\n🛑 Auto Git Sync Service stopped by user.")
