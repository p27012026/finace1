import os
import sys
import time
import subprocess
from datetime import datetime

# GitHub Config & Placeholders
GITHUB_USERNAME = "p27012026"
GITHUB_EMAIL = "p27012026@gmail.com"
REPOSITORY_NAME = "finace1"
BRANCH_NAME = "main"
POLL_INTERVAL_SECONDS = 15

def log(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}", flush=True)

def run_git_command(args):
    try:
        result = subprocess.run(
            ["git"] + args,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        log(f"Git command error ({' '.join(args)}): {e.stderr.strip()}")
        return None

def setup_git_config():
    log(f"Verifying Git config for repository '{REPOSITORY_NAME}'...")
    run_git_command(["config", "user.name", GITHUB_USERNAME])
    run_git_command(["config", "user.email", GITHUB_EMAIL])
    
    current_name = run_git_command(["config", "user.name"])
    current_email = run_git_command(["config", "user.email"])
    log(f"Git Configured User: {current_name} <{current_email}>")

    remote_url = run_git_command(["remote", "get-url", "origin"])
    log(f"Connected Remote Origin: {remote_url}")

def has_uncommitted_changes():
    status_output = run_git_command(["status", "--porcelain"])
    return bool(status_output and status_output.strip())

def sync_git():
    if not has_uncommitted_changes():
        return False

    log("File changes detected in workspace. Initializing auto-sync...")

    # Stage all changes
    run_git_command(["add", "."])

    # Commit with timestamped message
    commit_msg = f"Auto-sync: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} updates for {REPOSITORY_NAME}"
    commit_output = run_git_command(["commit", "-m", commit_msg])

    if commit_output:
        log(f"Committed changes: {commit_msg}")

    # Push to existing origin main branch
    log(f"Pushing commits to origin/{BRANCH_NAME}...")
    push_output = run_git_command(["push", "origin", BRANCH_NAME])
    
    log(f"[OK] Successfully synchronized changes to GitHub ({GITHUB_USERNAME}/{REPOSITORY_NAME})!")
    return True

def main():
    print("=" * 65)
    print(f"  AUTOMATIC GIT SYNC SYSTEM - {REPOSITORY_NAME}")
    print(f"  Target Repository: https://github.com/{GITHUB_USERNAME}/{REPOSITORY_NAME}.git")
    print(f"  User: {GITHUB_USERNAME} ({GITHUB_EMAIL})")
    print("=" * 65)

    setup_git_config()
    log(f"Monitoring project workspace for changes every {POLL_INTERVAL_SECONDS} seconds...")
    log("Press Ctrl+C to stop auto-sync.\n")

    try:
        while True:
            try:
                sync_git()
            except Exception as e:
                log(f"Sync error encountered: {e}")
            time.sleep(POLL_INTERVAL_SECONDS)
    except KeyboardInterrupt:
        log("\nAuto Git Sync service stopped cleanly.")

if __name__ == "__main__":
    main()
