from flask import Blueprint, request, jsonify, session, Response, stream_with_context, render_template
from app.models import *
from app import db
import requests


CLIENT_URL = "http://143.215.90.147:8080"

user_dashboard_bp = Blueprint('user_dashboard', __name__)


def generate_unique_path(path):
    """
    Generate a unique file path by appending a numerical suffix if the path already exists.
    """
    base, ext = path.rsplit('.', 1) if '.' in path else (path, '')
    counter = 1
    new_path = f"{base}({counter}).{ext}" if ext else f"{base}({counter})"
    while File.query.filter_by(path=new_path).first():
        counter += 1
        new_path = f"{base}({counter}).{ext}" if ext else f"{base}({counter})"
    return new_path

@user_dashboard_bp.route('/render-site', methods=['GET', 'POST'])
def render_site():
    return render_template('user_dashboard.html')


@user_dashboard_bp.route('/get-file-data', methods=['GET', 'POST'])
def get_file_data():
    """
    Gets file data for the cards or for the list in the browser.

    Args:
        Bool := isCards -- render cards or list? True for cards

    Returns:
        json := dictionary of files containing name, owning user, id, and image

    """
    data = request.get_json()

    if session['user_id'] and session['org_id']:
        user_id = session['user_id']
        org_id = session['org_id']
    else:
        return jsonify({"status": "NOK", "message": "user_id or org_id Not Found"}), 401
    
    user = User.query.filter_by(id=user_id).first()
    org = Org.query.filter_by(id=org_id).first()
    if (not user) or (not org):
        return jsonify({"status": "NOK", "message": "User or Org Not Found In Query"}), 401

    isCards = data['isCards']
    # determine if user is a signing user
    if (user != org.signing_user):

    
        if isCards:
            recent_files = (
                db.session.query(File)
                .join(FileAccessLog, File.id == FileAccessLog.file_id)
                .filter(FileAccessLog.user_id == user_id)
                .filter(user in File.users)
                .order_by(FileAccessLog.accessed_at.desc())
                .limit(20)
                .all()
            )
            return jsonify({
                "status": "OK",
                "recent_files": [
                    {"id": file.id, "name": file.fileName, "owner": file.owning_user, "image": file.image}
                    for file in recent_files
                ]
            }), 200
        
        else:
            accessed_files = (
                db.session.query(File)
                .join(FileAccessLog, File.id == FileAccessLog.file_id)
                .filter(FileAccessLog.user_id == user_id)
                .filter(user in File.users)
                .order_by(FileAccessLog.accessed_at.desc())
                .all()
            )
            return jsonify({
                "status": "OK",
                "files": [
                    {"id": file.id, "name": file.fileName, "owner": file.owning_user, "image": file.image}
                    for file in accessed_files
                ]
            }), 200
        
        
        
                    
@user_dashboard_bp.route('/get-child-directories', methods=['GET', 'POST'])
def get_child_directories():
    data = request.get_json()
    file_id = data['file_id']
    file = File.query.get(file_id)
    if not file:
        return jsonify({"status": "NOK", "message": "File not found"}), 404
    
    children = file.children.all()
    return jsonify({
        "status": "OK",
        "file": {"id": file.id, "name": file.fileName, "owner": file.owning_user, "image": file.image},
        "children": [{"id": child.id, "name": child.fileName, "owner": child.owning_user, "image": child.image} for child in children]
    }), 200


@user_dashboard_bp.route('/access-file', methods=['GET', 'POST'])
def access_file(file_id):
    """
    Route that runs whenever one tries to access a file.

    Args:
        int := file_id

    Returns:
        json := access status
    """
    data = request.get_json()
    file_id = data['file_id']
    user_id = session.get('user_id')  # Get the current user's ID from the session
    if not user_id:
        return jsonify({"status": "NOK", "message": "User not logged in"}), 401

    file = File.query.get(file_id)
    if not file:
        return jsonify({"status": "NOK", "message": "File not found"}), 404

    access_log = FileAccessLog(user_id=user_id, file_id=file_id)
    db.session.add(access_log)
    db.session.commit()

    return jsonify({"status": "OK", "message": "File access logged"}), 200

@user_dashboard_bp.route('/edit-file-content', methods=['GET', 'POST'])
def edit_file():
    """
    Directly edit a file's content.

    Args:
        int: file_id
        String: newFileName
        int: newOwnerId *optional
        Any: content *optional

    Returns:
        json := data about changed file
    """
    data = request.get_json()
    
    if not data or 'file_id' not in data or 'content' not in data:
        return jsonify({"status": "NOK", "message": "Missing required fields: 'fileName', or 'content'"}), 400
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"status": "NOK", "message": "User not authenticated"}), 401

    file_id = data['file_id']
    file = File.query.get(file_id)
    if not file:
        return jsonify({"status": "NOK", "message": "File Not Found"}), 404
    
    newFileName = data.get('newFileName', None)
    newOwnerId = data.get('newOwnerId', None)

    if newFileName:
        try:
            base, newExt = newFileName.rsplit('.', 1)
        except Exception as e:
            return jsonify({"status": "NOK", "message": f"Filename not formatted correctly: {e}"}), 400
        
        file.ext = newExt
        file.fileName = newFileName
    
    if newOwnerId:
        newOwner = User.query.get(newOwnerId)
        if not newOwnerId or not newOwner:
            return jsonify({"status": "NOK", "message": "Invalid owner ID"}), 400

        file.owning_user = newOwner
        if newOwner not in file.users:
            file.users.append(newOwner)
    
    if data.get('content'):
        file.content = data.get('content', None)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "NOK",
            "message": f"An error occurred while committing the file: {str(e)}"
        }), 500
    
    return jsonify({
        "status": "OK",
        "message": "File edited successfully!",
        "file": {
            "id": file.id,
            "name": file.fileName,
            "extension": file.ext,
            "owner": file.owning_user.username
        }
    }), 200


@user_dashboard_bp.route('/create-file', methods=['POST'])
def create_file():
    """
    Creates singular file.

    Args:
        String := fileName (including extension)
        Any := content

    """
    data = request.get_json()
    
    # Validate input
    if not data or 'fileName' not in data:
        return jsonify({"status": "NOK", "message": "Missing required fields: 'fileName'"}), 400
    
    user_id = session.get('user_id')  # Get the logged-in user's ID from the session
    if not user_id:
        return jsonify({"status": "NOK", "message": "User not authenticated"}), 401

    file_name = data['fileName']
    image = data.get('image', None)
    content = data.get('content', None)

    try:
        base, ext = file_name.rsplit('.', 1)
    except Exception as e:
        return jsonify({"status": "NOK", "message": f"Filename not formatted correctly: {e}"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"status": "NOK", "message": "User not found"}), 404
    
    file = File(fileName=file_name, owning_user=user, ext=ext, content=content)

    # Assign additional attributes
    if image:
        file.image = image

    file.users.append(user)  # Assign the current user to the file

    # Commit to the database
    try:
        db.session.add(file)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "NOK",
            "message": f"An error occurred while committing the file: {str(e)}"
        }), 500

    return jsonify({
        "status": "OK",
        "message": "File created successfully!",
        "file": {
            "id": file.id,
            "name": file.fileName,
            "extension": file.ext,
            "owner": file.owning_user.username
        }
    }), 201
 

@user_dashboard_bp.route('create-multiple-files', methods=['GET', 'POST'])
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
        return jsonify({"status": "NOK", "message": "User not authenticated"}), 401
    
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

            newFile = File(fileName=file_name, owning_user=user, ext=ext, content=content)

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


user_dashboard_bp.route('/rename-file', methods=['PUT'])
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
    

@user_dashboard_bp.route('/sync-client-to-server', methods=['GET', 'POST'])
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
    

@user_dashboard_bp.route('/sync-server-to-client', methods=['GET'])
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