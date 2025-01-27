from flask import Blueprint, request, jsonify, session, Response, stream_with_context, render_template
from app.models import *
from app import db
import app
import requests
from sqlalchemy import or_
from flask_socketio import SocketIO, join_room, leave_room, emit
import base64
from sqlalchemy.sql import func
import json


org_dashboard_bp = Blueprint('org_dashboard', __name__)

def has_access(user_treepath, file_treepath):
    # Convert JSON strings to Python lists if they are not already lists
    if isinstance(user_treepath, str):
        user_treepath = json.loads(user_treepath)
    if isinstance(file_treepath, str):
        file_treepath = json.loads(file_treepath)

    # Ensure the user's path is not longer than the file's path (no upward access)
    if len(user_treepath) > len(file_treepath):
        return False  # User cannot access upper levels

    # Check if user's path is a prefix of the file's path (self and subordinates)
    if file_treepath[:len(user_treepath)] == user_treepath:
        return True

    # Check if user belongs to the same peer group (same parent path)
    if len(user_treepath) > 1 and file_treepath[:-1] == user_treepath[:-1]:
        return True

    return False  # Access denied otherwise

@org_dashboard_bp.route('/')
def render_site():
    user = None
    org = None
    user_id = session.get('user_id')
    org_id = session.get('org_id')


    if not user_id:
        return jsonify({'status':'NOK', 'message':'User ID is not in session!'}), 404
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'status':'NOK', 'message':'User is not in DB!'}), 404
    

    if not user.currentOrgId:
        if org_id:
            user.currentOrgId = org_id
        else:
            return jsonify({'status':'NOK', 'message':'Cannot find suitable org'}), 404

    org = Org.query.get(user.currentOrgId)
    if not org:
        return jsonify({'status':'NOK', 'message':'Cannot find suitable org'}), 404 
    
    return render_template('org_dashboard.html', userName=user.firstName, userId=user_id, orgName=org.orgName, orgId=org.id), 200

@org_dashboard_bp.route('/org-tree', methods=['GET'])
def render_org_tree():
     return render_template('org_tree.html')

@org_dashboard_bp.route('/get-org-data')
def get_org_data():
    
    user = None
    org = None
    user_id = session.get('user_id')
    org_id = session.get('org_id')

    if not user_id:
        return jsonify({'status':'NOK', 'message':'User ID is not in session!'}), 404

    user = User.query.get(user_id)
    if not user:
        return jsonify({'status':'NOK', 'message':'User is not in DB!'}), 404


    if not user.currentOrgId:
        if org_id:
            user.currentOrgId = org_id
        else:
            return jsonify({'status':'NOK', 'message':'Cannot find suitable org'}), 404

    org = Org.query.get(user.currentOrgId)
    if not org:
        return jsonify({'status':'NOK', 'message':'Cannot find suitable org'}), 404 

    users = org.users

    return jsonify({
        "status": "OK",
            "users": [
                {
                    "firstName": user1.firstName,
                    "lastName": user1.lastName,
                    "id": user1.id,
                    "treepath": db.session.query(
                                    user_org_table.c.treepath
                                ).filter(
                                    user_org_table.c.user_id == user1.id
                                ).filter(
                                    user_org_table.c.org_id == org.id
                                ).scalar()
                }
                for user1 in users
            ]
    }), 200

@org_dashboard_bp.route('/change-treepath', methods = ['POST'])
def change_treepath():
    data = request.get_json()
    manager = None
    employee = None
    user_id = session.get('user_id')
    org_id = session.get('org_id')
    org = None

    print(data)

    if not user_id:
        return jsonify({'status':'NOK', 'message':'User ID is not in session!'}), 404

    user = User.query.get(user_id)
    if not user:
        return jsonify({'status':'NOK', 'message':'User is not in DB!'}), 404
    
    if not user.currentOrgId:
        if org_id:
            user.currentOrgId = org_id
        else:
            return jsonify({'status':'NOK', 'message':'Cannot find suitable org'}), 404

    org = Org.query.get(user.currentOrgId)
    if not org:
        return jsonify({'status':'NOK', 'message':'Cannot find suitable org'}), 404 

    manager_id = data['manager_id']
    employee_id = data['employee_id']

    if not manager_id:
        return jsonify({'status':'NOK', 'message':'ID not sent!'}), 404

    if not employee_id:
        return jsonify({'status':'NOK', 'message':'ID not sent!'}), 404

    manager = User.query.get(manager_id)
    employee = User.query.get(employee_id)

    if not manager:
        return jsonify({'status':'NOK', 'message':'User is not in DB!'}), 404

    if not employee:
        return jsonify({'status':'NOK', 'message':'User is not in DB!'}), 404
    
    managerTp = db.session.query( user_org_table.c.treepath).filter(user_org_table.c.user_id == manager.id).filter(user_org_table.c.org_id == org.id).scalar()

    print(f"Man TP: {managerTp}")

    if isinstance(managerTp, str):
        import json
        managerTp = json.loads(managerTp)

    print(f"Man TP: {managerTp}")

    subordinates = db.session.query(user_org_table).filter(
        # Check if the beginning of the JSON array matches the manager's treepath
        func.json_extract(user_org_table.c.treepath, '$[0]') == managerTp[0],

        # Ensure the length of the employee's treepath is one greater than manager's
        func.json_array_length(user_org_table.c.treepath) == len(managerTp) + 1
    ).all()

    number = len(subordinates) + 1

    newTp = managerTp + [number]

    db.session.execute(
        user_org_table.update()
        .where(user_org_table.c.user_id == employee.id)
        .where(user_org_table.c.org_id == org.id)
        .values(treepath=newTp)
    )

    db.session.commit()

    print(f"New Employee TP: {newTp}")

    return jsonify({"status":"OK", "message": "Treepaths updated successfully!"}), 200



@org_dashboard_bp.route('/get-code')
def get_code():
    user = None
    org = None
    user_id = session.get('user_id')
    org_id = session.get('org_id')

    if not user_id:
        return jsonify({'status':'NOK', 'message':'User ID is not in session!'}), 404
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'status':'NOK', 'message':'User is not in DB!'}), 404

    org = Org.query.get(user.currentOrgId)
    if not org:
        return jsonify({'status':'NOK', 'message':'Cannot find suitable org'}), 404 
    
    orgCode = org.daily_code
    
    return jsonify({"status": "OK", 'code':f'{orgCode}'}), 200

@org_dashboard_bp.route('/update-treepath')
def update_treepath():
    user = None
    org = None
    user_id = session.get('user_id')
    org_id = session.get('org_id') 

    if not user_id:
        return jsonify({'status':'NOK', 'message':'User ID is not in session!'}), 404
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'status':'NOK', 'message':'User is not in DB!'}), 404

    org = Org.query.get(user.currentOrgId)
    if not org:
        return jsonify({'status':'NOK', 'message':'Cannot find suitable org'}), 404   

    all_treepaths = db.session.query(
        user_org_table.c.user_id, 
        user_org_table.c.treepath
    ).filter(user_org_table.c.org_id == org.id).all() 

    for user_id, treepath in all_treepaths:
        if treepath:
            # Convert JSON string to list if necessary
            if isinstance(treepath, str):
                treepath = json.loads(treepath)

            # Remove the first element safely if the list is not empty
            if len(treepath) > 1:
                new_treepath = treepath[1:]  # Remove the first element
                db.session.execute(
                    user_org_table.update()
                    .where((user_org_table.c.user_id == user_id) & (user_org_table.c.org_id == org_id))
                    .values(treepath=new_treepath)
                )

    # Commit the changes
    db.session.commit()

    return jsonify({"status":"OK", "message": "Treepaths updated successfully!"}), 200
    



@org_dashboard_bp.route('/get-org-user-data')
def get_org_user_data():
    user = None
    org = None
    user_id = session.get('user_id')
    org_id = session.get('org_id')

    if not user_id:
        return jsonify({'status':'NOK', 'message':'User ID is not in session!'}), 404
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'status':'NOK', 'message':'User is not in DB!'}), 404

    org = Org.query.get(user.currentOrgId)
    if not org:
        return jsonify({'status':'NOK', 'message':'Cannot find suitable org'}), 404 
    
    userNumber = len(org.users)
    adminNumber = len(org.admins)

    return jsonify({"status": "OK", 'userNumber':f'{userNumber}', 'adminNumber':f'{adminNumber}'}), 200


@org_dashboard_bp.route('/get-file-data-org', methods=['GET', 'POST'])
def get_file_data_org():
    data = request.get_json()

    user = None
    org = None

    user_id = session.get('user_id')
    org_id = session.get('org_id')

    if user_id:
        user = User.query.filter_by(id=user_id).first()
        if user:
            org = Org.query.get(user.currentOrgId)
            if not org:
                org = Org.query.get(org_id)
                
    
    if not user:
        return jsonify({'status':'NOK', 'message':'Org not found'}), 404
    
    if not org:
                return jsonify({'status':'NOK', 'message':'Org not found'}), 404

    isCards = data['isCards']
    # determine if user is a signing user

    


    if isCards:

        user_treepath_length = (
            db.session.query(func.json_array_length(user_org_table.c.treepath))
            .filter(user_org_table.c.user_id == user_id)
            .filter(user_org_table.c.org_id == org.id)
            .scalar_subquery()
        )
        
        print(user_treepath_length)
        
        recent_files = (
            db.session.query(File)
            .join(user_org_table, File.org_id == user_org_table.c.org_id)
            .filter(user_org_table.c.user_id == user_id)
            .filter(user_org_table.c.org_id == org.id)
            .filter(func.json_array_length(File.treepath) >= user_treepath_length)
            .all()
        )

        print(recent_files)


        return jsonify({
            "status": "OK",
            "recent_files": [
                {
                    "id": file.id, 
                    "name": file.fileName, 
                    "owner": f"{file.owning_user.firstName if file.owning_user_id is not None else None}", 
                    "image": base64.b64encode(file.image).decode('utf-8') if file.image else None,
                    "org": (file.org.orgName) if (file.org) else None
                }
                for file in recent_files
            ]
        }), 200
            
    
    else:
            return jsonify({"status":"NOK", "message":"Non-cards functionality not included yet"}), 400
        

