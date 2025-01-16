from flask import Blueprint, request, jsonify, session, Response, stream_with_context, render_template
from app.models import *
from app import db
import requests
from sqlalchemy import or_

CLIENT_URL = "http://143.215.90.147:8080"

handle_client_server = Blueprint('handle_client_server', __name__)

@handle_client_server.route('create-multiple-files', methods=['GET', 'POST'])
def create_multiple_files():
    """
    Creates multiple file database images by searching the client's directory
    via extension.

    Args:
        path := base path for searching
        [] := extensions list

    Returns:
        json := Dictionary containing the files that were successfully created
    
    """
    data = request.get_json()

    user_base_path = data['base_path']
    extensions = data['extensions']
    user_id = session.get('user_id')

    if not user_id:
        ip = request.remote_addr
        tempUser = TempUser.query.filter(TempUser.ip_addr == ip).first()
        if not tempUser:
            register_temp_user(ip)

    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "NOK", "message": "User not found"}), 404
    
    user.base_path = user_base_path

    if not extensions:
        return jsonify({"error": "No file types specified."}), 400

    response = requests.get(
        f"{CLIENT_URL}/send-paths-by-extension",
        jsonify({
            'extensions': extensions, 
            'BASE_PATH': user_base_path
        }),
        timeout = 10
    )

    if response.status_code == 200:
        data = response.json()
        
        files = data['files']

        files_dict = []

        for file in files:
            file_name = file['file_name']
            file_path = file['file_path']
            content = file['content']
            ext = file['ext']

            newFile = File(fileName=file_name, owning_user_id=user_id, ext=ext, content=content)

            file.users.append(user)

            db.session.add(file)

            new_record = {
                "user_id": user.id,
                "file_id": newFile.id,
                "local_path": file_path
            }

            stmt = user_file_table.insert().values(new_record)

            try:
                db.session.execute(stmt)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                return jsonify({
                    "status": "NOK",
                    "message": f"An error occurred while committing the file: {str(e)}"
                }), 500
            
            file = jsonify({
                'id': file.id,
                "name": file.fileName,
                "extension": file.ext,
                "owner": file.owning_user.username
            })

            files_dict.append(file)

        return jsonify({
            "status": "OK",
            "message": "Files created successfully!",
            "files": files_dict
        }), 201
    
    
def get_file_path(user, file):
    try:
        query = db.select(user_file_table.c.local_path).where(
            user_file_table.c.user_id == user.id,
            user_file_table.c.file_id == file.id
        )
        result = db.session.execute(query).fetchone()
        return result[0] if result else None
    except Exception as e:
        print(f"Error retrieving file path: {e}")
        return None


@handle_client_server.route('/rename-file', methods=['PUT'])
def rename_file():
    """
    Renames a specified file in the client's path. Creates a new file
    if it can't find a file path for the old file.
    
    Args:
        String := New file name
        int := File id for the file to change

    Returns: 
        json := status, whether or not the file had to be changed, error logs
    """
    data = request.get_json()

    user_id = session.get('user_id')

    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "NOK", "message": "User not found"}), 404

    file_id = data['file_id']

    file = File.query.get(file_id)
    if not file:
        return jsonify({"status": "NOK", "message": "File not found"}), 404
    
    file_path = get_file_path(user, file)

    if not file_path:
        result = requests.get(
            f"{CLIENT_URL}/create-new-files-by-extension",
            jsonify({
                'files': [
                    jsonify({
                        'file_name': file.fileName,
                        'ext': file.ext,
                        'content': file.content,
                        'file_id': file.id
                    })
                ]
            }),
            timeout = 10
        )  

        if not result["error"]:
            return jsonify({
                'status': 'OK',
                'written': 'yes',
                'result': result
            }), 201
        else:  
            return jsonify({
                'status': 'NOK',
                'new': 'yes',
                'result': result
            }), 500

    newName = data['newName']

    response = request.get(
        f"{CLIENT_URL}/rename-file",
        jsonify({
            "oldPath": file_path,
            "newName": newName
        })
    )

    if not response["error"]:
        return jsonify({
            'status':'OK',
            'new': 'no',
            'result': response
        }), 200
    else:
        return jsonify({
            'status':'NOK',
            'new': 'no',
            'result': response
        }), 500
    

@handle_client_server.route('/sync-client-to-server', methods=['GET', 'POST'])
def sync_client_to_server():
    """
    Takes all of the files that can be viewed by the session user and
    updates them in the client's local path.

    Args: 
        [] := a list of extensions e.g. ['txt', 'bat', 'md']

    Returns:
        json := a dictionary of files written
    """
    data = request.get_json()

    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "NOK", "message": "User not found"}), 404
    
    extensions = data['extensions']

    files = File.query.filter(
        File.users.any(User.id == user.id),
        File.ext.in_(extensions)
    ).all()

    files_dict = []
    for file in files:
        payload = jsonify({
            'file_name': file.fileName,
            'ext': file.ext,
            'content': file.content,
            'file_id': file.id
        })
        files_dict += payload
    
    response = requests.get(
        f"{CLIENT_URL}/create-new-files-by-extension",
        jsonify({
            'files': files_dict,
        }),
        timeout = 10
    )

    if not response["error"]:
        return jsonify({
            'status':'OK',
            'result': response
        }), 200
    else:
        return jsonify({
            'status':'NOK',
            'result': response
        }), 500
    

@handle_client_server.route('/sync-server-to-client', methods=['GET'])
def sync_server_to_client():
    """
    Gets the return of all files by extension on the client machine,
    then filters those to find the files owned by the session user. Those
    files that are owned by the session user are then updated in the db.

    Args: 
        [] := a list of extensions e.g. ['txt', 'bat', 'md']

    Returns:
        json := Synced file names/ id
    """

    data = request.get_json()

    extensions = data.get['extensions']

    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "NOK", "message": "User not found"}), 404

    response = requests.get(
        f"{CLIENT_URL}/send-paths-by-extension",
        jsonify({
            'extensions': extensions, 
            'BASE_PATH': user.base_path
        }),
        timeout = 10
    )

    if response.status_code == 200:
        data = response.json()
        
        files = data['files']

        file_content_map = {file['file_name']: file['content'] for file in files}

        filenames = []

        for file in files:
            file_name = file['file_name']
            filenames.append(file_name)

        files_to_sync = File.query.filter(
            File.owning_user_id == user.id,
            File.fileName in filenames
        ).all()

        synced_files = []

        for file in files_to_sync:
            if file.fileName in file_content_map:
                file.content = file_content_map[file.fileName]
                synced_files.append(
                    jsonify({
                        "file_id": file.id,
                        "file_name": file.fileName
                    })
                )

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({
                "status": "NOK",
                "message": f"An error occurred while syncing files: {str(e)}"
            }), 500
        
        return jsonify({"status": "OK", "Synced Files": synced_files})