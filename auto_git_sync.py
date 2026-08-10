import time
import subprocess
import sys
import io
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Force UTF-8 stdout with instant flushing
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

GIT_NAME = "p27012026"
GIT_EMAIL = "p27012026@gmail.com"
REPO_URL = "https://github.com/p27012026/finace1.git"

print("==================================================", flush=True)
print("⚡ Real-Time Instant Auto Git Sync Service Active", flush=True)
print(f"User: {GIT_NAME} <{GIT_EMAIL}>", flush=True)
print(f"Repository: {REPO_URL}", flush=True)
print("==================================================", flush=True)

# Configure credentials
subprocess.run(["git", "config", "user.name", GIT_NAME], check=False)
subprocess.run(["git", "config", "user.email", GIT_EMAIL], check=False)

def get_current_branch():
    try:
        res = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True, text=True)
        return res.stdout.strip() or "main"
    except Exception:
        return "main"

def sync_now(reason="File change detected"):
    try:
        branch = get_current_branch()
        subprocess.run(["git", "add", "."], check=False)
        status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
        if status.stdout.strip():
            print(f"\n⚡ [INSTANT SYNC] {reason}! Pushing immediately to GitHub ({branch})...", flush=True)
            subprocess.run(["git", "commit", "-m", f"Real-time sync: {reason}"], check=False)
            push_res = subprocess.run(["git", "push", "origin", branch], capture_output=True, text=True)
            if push_res.returncode == 0:
                print(f"✅ [SUCCESS] Pushed instantly to GitHub ({branch})!", flush=True)
            else:
                print(f"⚠️ [STATUS] {push_res.stderr.strip() or push_res.stdout.strip()}", flush=True)
    except Exception as e:
        print(f"⚠️ [ERROR] Sync exception: {e}", flush=True)

class InstantGitSyncHandler(FileSystemEventHandler):
    def __init__(self):
        super().__init__()
        self.last_sync = 0

    def on_any_event(self, event):
        # Ignore git, node_modules, venv, pycache, dist, and log files
        path = event.src_path.replace('\\', '/')
        if any(ignored in path for ignored in ['/.git/', '/node_modules/', '/venv/', '/__pycache__/', '/dist/', '/.gemini/']):
            return
        
        now = time.time()
        # Debounce multiple rapid file events within 0.5 seconds
        if now - self.last_sync > 0.5:
            self.last_sync = now
            filename = os.path.basename(path)
            sync_now(f"Modified {filename}")

# Perform initial sync check on startup
sync_now("Startup sync check")

print("👀 Watching workspace for instant file changes (Save any file to trigger instant push)...", flush=True)

event_handler = InstantGitSyncHandler()
observer = Observer()
observer.schedule(event_handler, path='.', recursive=True)
observer.start()

try:
    while True:
        time.sleep(0.5)
except KeyboardInterrupt:
    observer.stop()

observer.join()
