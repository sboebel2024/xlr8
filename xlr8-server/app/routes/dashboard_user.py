from flask import Blueprint, request, jsonify, session, Response, stream_with_context, render_template
from app.models import *
from app import db
import app
import requests
from sqlalchemy import or_
from flask_socketio import SocketIO, join_room, leave_room, emit


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

@user_dashboard_bp.route('/set-user-cookie', methods=["POST"])
def set_user_cookie():
    data = request.get_json()
    user_id = data["user_id"]
    session['user_id'] = user_id
    return jsonify({"status": "OK", "message" : f"{dict(session)}"})
                    

@user_dashboard_bp.route('/get-session')
def get_session():
    return jsonify({"status": "OK", "message" : f"{dict(session)}"})
                    
@user_dashboard_bp.route('/clear-session')
def clear_session():
    session.clear()
    return jsonify({"status": "OK", "message": f"Session cleared: {dict(session)}"}), 200

@user_dashboard_bp.route('/', methods=['GET', 'POST'])
def render_site():
    print(dict(session))
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if not user:
        ip = request.remote_addr
        tempUser = TempUser.query.filter(TempUser.ip_addr == ip).first()
        if not tempUser:
            tempUser = register_temp_user(ip)
            print(f"Temp User ID: {tempUser.id}")
            
        print(f"Temp User ID: {tempUser.id}")
        return render_template('user_dashboard.html', userName = 'None', userId=None)

    print(f"Session User ID: {user.id}")
    return render_template('user_dashboard.html', userName = f"{user.firstName}", userId=user.id)

@user_dashboard_bp.route('/debug', methods=['GET'])
def debug():
    return "Debug route is working!"


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

    user_id = session.get('user_id')
    org_id = session.get('org_id')
    
    user = User.query.filter_by(id=user_id).first()
    org = Org.query.filter_by(id=org_id).first()
    
    if not user:
        ip = request.remote_addr
        tempUser = TempUser.query.filter(TempUser.ip_addr == ip).first()
        if not tempUser:
            tempUser = register_temp_user(ip)
            print(f"Temp User ID: {tempUser.id}")

    isCards = data['isCards']
    # determine if user is a signing user
    if (not org):

    
        if isCards:
            recent_files = (
                # db.session.query(File)
                # .join(FileAccessLog, File.id == FileAccessLog.file_id)
                # .filter(or_(
                #     FileAccessLog.user_id == user_id,
                #     request.remote_addr == tempUser.ip_addr
                # ))  #.filter(user in File.users) <-- Make this handle user not existing; i.e. make files "public" or "private"
                # .order_by(FileAccessLog.accessed_at.desc())
                # .limit(20)
                # .all()
                db.session.query(File).all()
            )
            return jsonify({
                "status": "OK",
                "recent_files": [
                    {"id": file.id, "name": file.fileName, "owner": f"{file.owning_user.firstName if file.owning_user_id is not None else None}", "image": file.image}
                    for file in recent_files
                ]
            }), 200
        
        else:
            accessed_files = (
                db.session.query(File)
                .join(FileAccessLog, File.id == FileAccessLog.file_id)
                .filter(FileAccessLog.user_id == user_id)
                # .filter(user in File.users) <-- same as above
                .order_by(FileAccessLog.accessed_at.desc())
                .all()
            )
            return jsonify({
                "status": "OK",
                "files": [
                    {"id": file.id, "name": file.fileName, "owner": file.owning_user.firstName, "image": file.image}
                    for file in accessed_files
                ]
            }), 200
        
        

@user_dashboard_bp.route('/access-file', methods=['GET'])
def access_file():
    """
    Route that runs whenever one tries to access a file.

    Args:
        int := file_id
        String := ip_addr

    Returns:
        json := access status
    """
    file_id = request.args.get('file_id')
    user_id = session.get('user_id')  # Get the current user's ID from the session
    print(f'Session User ID: {user_id}')
    if not user_id:
        ip = request.remote_addr
        tempUser = TempUser.query.filter(TempUser.ip_addr == ip).first()
        if not tempUser:
            tempUser = register_temp_user(ip)
            print(f"Temp User ID: {tempUser.id}")

        userFname = str("BAD_USERNAME_#$&^%")
        pan_userid = tempUser.id

    print(file_id)
    file = File.query.get(file_id)
    if not file:
        return jsonify({"status": "NOK", "message": "File not found"}), 404

    access_log = FileAccessLog(user_id=user_id, file_id=file_id)
    db.session.add(access_log)
    db.session.commit()

    if user_id:
        user = User.query.get(user_id)
        if user:
            userFname = str(user.firstName)
            pan_userid = user_id
        if not user: 
            tempUser = register_temp_user(ip)
            print(f"Temp User ID: {tempUser.id}")
            userFname = str("Not Logged in!")
            pan_userid = tempUser.id
            


    if file.ext in ext_lookup_json:
        template_to_run = ext_lookup_json[file.ext]
        content=file.content
        print(content)
        fileName = file.fileName.split('.')[0]

        
        isOwningUser = 1
        if (file.owning_user_id is not None):
            isOwningUser = 0
            if (user_id == file.owning_user_id):
                isOwningUser = 1
            else:
                isOwningUser = 0

        
        
        return render_template(template_to_run, content=content, file_id=file_id, filename=fileName, isOwningUser=isOwningUser, userFname=userFname, userid = pan_userid )

    return jsonify({
        "status": "NOK", 
        "message": "File access logged, but file extension does not exist in the manual lookup table.",
        "ext": ext_lookup_json[f"{file.ext}"]
    }), 200

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
    
    if not data or 'file_id' not in data:
        return jsonify({"status": "NOK", "message": "Missing required fields: 'file_id'"}), 400
    
    user_id = session.get('user_id')
    if not user_id:
        user_id = data.get('user_id') # for debugging
        if not user_id:
            ip = request.remote_addr
            tempUser = TempUser.query.filter(TempUser.ip_addr == ip).first()
            if not tempUser:
                register_temp_user(ip)
                
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
            "owner": file.owning_user.username if file.owning_user is not None else None,
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


    try: 
        data = request.get_json()
        
        # Validate input
        if not data or 'fileName' not in data:
            return jsonify({"status": "NOK", "message": "Missing required fields: 'fileName'"}), 400
        
        user_id = session.get('user_id')  # Get the logged-in user's ID from the session

        if not user_id:
            ip = request.remote_addr
            tempUser = TempUser.query.filter(TempUser.ip_addr == ip).first()
            if not tempUser:
                register_temp_user(ip)
                    

        file_name = data['fileName']
        image = data.get('image', None)
        content = data.get('content', None)

        try:
            base, ext = file_name.rsplit('.', 1)
        except Exception as e:
            return jsonify({"status": "NOK", "message": f"Filename not formatted correctly: {e}"}), 400
              

        # return({"data":f"fileName: {file_name}, ext: {ext}, content: {content}, owning_user_id: {user_id}"})
        
        file = File(fileName=file_name, ext=ext, content=content)


        # Assign additional attributes
        if image:
            file.image = image

        if user_id:
            user = User.query.get(user_id)
            if user:
                file.owning_user_id = user_id
                file.users.append(user)  # Assign the current user to the file
            else:
                file.owning_user_id = None


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
            }
        }), 201
    except Exception as e:
        app.logger.error(f"Error in create_file route: {str(e)}", exc_info=True)
        db.session.rollback()
        return jsonify({"status": "NOK", "message": f"Internal server error: {e}"}), 500

@user_dashboard_bp.route('/set-test-session')
def set_test_session():
    session['user_id'] = 1  # Set user_id for testing
    return "Test session set!"
 


@user_dashboard_bp.route('/delete-file', methods=['POST'])
def delete_file():
    data = request.get_json()
    file_id = data['file_id']
    file = File.query.get(file_id)

    if file:
        try:
            db.session.delete(file) 
            db.session.commit()     
            return jsonify({"status":"OK", "message": f"File with ID {file_id} deleted successfully."})
        except Exception as e:
            db.session.rollback()   
            return jsonify({"status":"NOK", "message": f"Error deleting file: {e}"})


@user_dashboard_bp.route('/add-user-to-file', methods=['POST'])
def add_user_to_file():
    data = request.get_json()
    file_id = data['file_id']
    user_id = data['user_id']

    user = User.query.get(user_id)
    file = File.query.get(file_id)
    
    if (not user) or (not file):
        return jsonify({'status': 'NOK', 'message': 'File or User not found'}), 404
    
    file.users.append(user)

    return jsonify({'status': 'OK', 'message': f'User {user.firstName} added to file {file.fileName}.'}), 200


    