import os
import sys
import shutil
import subprocess

LOCK_FILE = "myApi.lock"

def find_chrome_executable():
    """Find the Google Chrome executable path across different OS"""
    if sys.platform.startswith("win"):
        # Common Windows locations
        possible_paths = [
            os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe")
        ]
        for path in possible_paths:
            if os.path.exists(path):
                return path

        # Try locating with `where` command
        try:
            path = subprocess.check_output(["where", "chrome"], text=True).strip()
            return path.split("\n")[0] if path else None
        except Exception:
            return None

    elif sys.platform.startswith("darwin"):
        # macOS default location
        mac_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        return mac_path if os.path.exists(mac_path) else None

    elif sys.platform.startswith("linux"):
        # Try common Linux paths
        linux_path = shutil.which("google-chrome") or shutil.which("chromium-browser") or shutil.which("chrome")
        return linux_path

    return None

def find_chrome_profile():
    """Find the user's Chrome profile directory across different OS"""
    if sys.platform.startswith("win"):
        return os.path.expandvars(r"%LocalAppData%\Google\Chrome\User Data")
    elif sys.platform.startswith("darwin"):
        return os.path.expanduser("~/Library/Application Support/Google/Chrome")
    elif sys.platform.startswith("linux"):
        return os.path.expanduser("~/.config/google-chrome")

    return None

chrome_path = find_chrome_executable()
chrome_profile = find_chrome_profile()


# Check if lock file exists
if os.path.exists(LOCK_FILE):
    print("⚠️ Script is already running. Exiting.")
    sys.exit(1)

# Create the lock file
open(LOCK_FILE, "w").close()

try:
    # Your script logic here
    print("✅ Python script is running...")
    print(f"✅ Chrome Executable: {chrome_path if chrome_path else 'Not Found'}")
    print(f"✅ Chrome Profile Path: {chrome_profile if chrome_profile else 'Not Found'}")

    
    

finally:
    os.remove(LOCK_FILE)  # Remove lock when script exits
