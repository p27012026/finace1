import time
import subprocess
import sys
import io

# Force UTF-8 stdout with line buffering so output prints instantly
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

GIT_NAME = "p27012026"
GIT_EMAIL = "p27012026@gmail.com"
REPO_URL = "https://github.com/p27012026/finace1.git"

print("==================================================", flush=True)
print("🔄 Starting Auto Git Sync Service", flush=True)
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

print("✅ Auto Git Sync is ACTIVE. Watching for local code changes...", flush=True)

while True:
    try:
        branch = get_current_branch()
        subprocess.run(["git", "add", "."], check=False)
        status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
        if status.stdout.strip():
            print(f"📦 [SYNC] Changes detected! Committing and pushing to GitHub ({branch})...", flush=True)
            subprocess.run(["git", "commit", "-m", "Auto sync updates"], check=False)
            push_res = subprocess.run(["git", "push", "origin", branch], capture_output=True, text=True)
            if push_res.returncode == 0:
                print(f"✅ [SUCCESS] Pushed updates to GitHub ({branch})!", flush=True)
            else:
                print(f"⚠️ [STATUS] {push_res.stderr.strip() or push_res.stdout.strip()}", flush=True)
        else:
            print(f"⚡ [IDLE] Working tree clean on '{branch}'. Next check in 10s...", flush=True)
    except Exception as e:
        print(f"⚠️ [ERROR] Sync exception: {e}", flush=True)
    
    time.sleep(10)
