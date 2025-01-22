# Startup script, run from Ubuntu
echo "Starting..."
python3 -m venv xlr8-env
source xlr8-env/bin/activate
pip install -r requirements.txt
python3 run.py
