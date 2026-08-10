import time
import subprocess
import sys
import io

# Force UTF-8 stdout for Windows console compatibility
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

print("==================================================")
print("Starting Auto Git Sync Service")
print("Repository: https://github.com/p27012026/finace1.git")
print("==================================================")

def get_current_branch():
    try:
        res = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True, text=True)
        return res.stdout.strip() or "main"
    except Exception:
        return "main"

while True:
    try:
        branch = get_current_branch()
        subprocess.run(["git", "add", "."], check=False)
        status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
        if status.stdout.strip():
            print(f"[SYNC] Changes detected! Committing and pushing to branch '{branch}'...")
            subprocess.run(["git", "commit", "-m", "Auto sync updates"], check=False)
            push_res = subprocess.run(["git", "push", "origin", branch], capture_output=True, text=True)
            if push_res.returncode == 0:
                print(f"[SUCCESS] Pushed updates to GitHub ({branch})!")
            else:
                print(f"[STATUS] {push_res.stderr.strip() or push_res.stdout.strip()}")
        else:
            print(f"[IDLE] Everything up to date on '{branch}'. (Checking in 30s)")
    except Exception as e:
        print(f"[ERROR] Sync exception: {e}")
    
    time.sleep(30)
