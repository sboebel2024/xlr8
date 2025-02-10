import sys
import os
import subprocess

def open_new_tab(url):
    try:
        if sys.platform.startswith("linux"):
            subprocess.run(["xdg-open", url], check=True)  # Linux
        elif sys.platform.startswith("win"):
            os.startfile(url)  # Windows
        elif sys.platform.startswith("darwin"):
            subprocess.run(["open", url], check=True)  # macOS
        else:
            print("Unsupported OS")
            sys.exit(1)

        print(f"Opened: {url}")
    except Exception as e:
        print(f"Error opening browser: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python execute_ovlf.py <URL>")
        sys.exit(1)

    url = sys.argv[1]
    open_new_tab(url)
