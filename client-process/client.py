from flask import Flask, request, jsonify
import os
import subprocess
import sys
import re
import bcrypt
from datetime import datetime, timezone


app = Flask(__name__)

TARGET_DIR_NAME = "xlr8-files"
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
HASHED_PASSWORD = bcrypt.hashpw("great_scott@39465".encode('utf-8'), bcrypt.gensalt())
NEW_SERVER_NAME = re.sub(r'[^a-z0-9]', '', ("xlr8_local_server" + str(datetime.now(timezone.utc)) + ".exe"))
UPLOAD_PATH = os.path.join(CURRENT_DIR, NEW_SERVER_NAME)

if(os.name=='nt'):
    BASE_PATH = "C:\\users"

if(os.name=='posix'):
    BASE_PATH = "/home"

if getattr(sys, 'frozen', False):
    # If running as a frozen executable (e.g., PyInstaller-built .exe)
    CURRENT_EXECUTABLE_PATH = sys.executable
else:
    # If running as a Python script
    CURRENT_EXECUTABLE_PATH = os.path.abspath(__file__)


@app.route('/update', methods=['POST'])
def update_server():

    provided_password = request.headers.get('password')
    if not provided_password or not bcrypt.checkpw(provided_password.encode('utf-8'), HASHED_PASSWORD):
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded."}), 400
    
    file = request.files['file']

    try:
        file.save(UPLOAD_PATH)
        os.replace(UPLOAD_PATH, CURRENT_EXECUTABLE_PATH)
        subprocess.Popen([CURRENT_EXECUTABLE_PATH], shell=True)
        os._exit(0)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
    return jsonify({"status": "success", "message": f"Server updated and restarted with upload path {UPLOAD_PATH} and exec path {CURRENT_EXECUTABLE_PATH}."})



def find_files_by_extension(directory, extensions):
    """
    Recursively searches for files with specified extensions in the given directory.

    Args:
        directory (str): The root directory to search.
        extensions (list): List of file extensions to search for.

    Returns:
        list: List of dictionaries with file paths and content.
    """
    matched_files = []

    for root, _, files in os.walk(directory):
        for file in files:
            # Check if file ends with any of the specified extensions
            matched_ext = next((ext for ext in extensions if file.lower().endswith(ext)), None)
            if matched_ext:
                file_path = os.path.join(root, file)
                try:
                    # Read file content
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    # Add file details to the results
                    matched_files.append({
                        "file_name": os.path.basename(file_path),
                        "file_path": file_path,
                        "content": content,
                        "ext": matched_ext
                    })
                except Exception as e:
                    print(f"Could not read file {file_path}: {e}")

    
    return matched_files

@app.route("/send-paths-by-extension", methods=["POST"])
def send_paths():
    """
    Receives file type extensions from the server, searches for files,
    and sends the data back as JSON.
    """
    try:
        # Get file types from the POST request
        data = request.get_json()
        file_types = data.get('extensions', [])

        if not file_types:
            return jsonify({"error": "No file types specified."}), 400

        # Root directory to search
        if data["BASE_PATH"]:
            BASE_PATH = data['BASE_PATH']

        # Find files by extensions
        files_data = find_files_by_extension(BASE_PATH, file_types)

        # Return the JSON data to the client
        return jsonify({"files": files_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/create-new-files-by-extension", methods=['POST']) 
def create_new_files_by_extension():
    """
    Creates new files in the user's local directory, grouped by their
    extension (e.g. ".txt", ".stl").

    Assuming library looks like this:
    data = {
        "files": [
            {"file_name": "example1.txt", "ext": ".txt", "content": "This is the content of example1."},
            {"file_name": "example2.md", "ext": ".md", "content": "This is the content of example2."}
        ]
    }

    """
    try:
        data = request.get_json()

        for root, dirs, files in os.walk(BASE_PATH):
            if TARGET_DIR_NAME in dirs:
                new_path = os.path.join(root, TARGET_DIR_NAME)
            else:
                new_path = os.path.join(BASE_PATH, TARGET_DIR_NAME)
                os.makedirs(new_path, exist_ok=True)

        files_dict = []

        for file in data.get("files"):
            file_name = file['file_name']
            ext = file['ext']
            content = file['content']
            file_id = file['file_id']
            ext_path = os.path.join(new_path, ext)
            file_path = os.path.join(ext_path, file_name)
            with open(file_path, 'w') as f:
                f.write(content)

            print(f'File written: {file_path}')
            files_dict.append({
                "file_id": file_id, "file_name": file_name, "file_path": file_path
            })

        return jsonify({"files": files_dict}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/rename-file', methods=['PUT'])
def rename_file():
    """
    Renames a file in the user's directory. 
    
    Note: Cannot change file extension, to do
    that you're going to need a new file!
    """
    data = request.get_json()
    oldPath = data['oldPath']
    newName = data['newName']

    if not os.path.exists(oldPath):
        return jsonify({"error": f"File not found: {oldPath}"}), 404

    directory = os.path.dirname(oldPath)

    newPath = os.path.join(directory, newName)
    
    try:
        with open(oldPath, 'r') as oldFile:
            content = oldFile.read()

        with open(newPath, 'w') as newFile:
            newFile.write(content)

        os.remove(oldPath)
        print(f"File moved and renamed: {oldPath} -> {newPath}")
        return jsonify({"success": f"File moved and renamed: {oldPath} -> {newPath}"}), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": e}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)

