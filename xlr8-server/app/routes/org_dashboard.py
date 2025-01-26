from flask import Blueprint, request, jsonify, session, Response, stream_with_context, render_template
from app.models import *
from app import db
import app
import requests
from sqlalchemy import or_
from flask_socketio import SocketIO, join_room, leave_room, emit
import base64
from sqlalchemy.sql import func


org_dashboard_bp = Blueprint('org_dashboard', __name__)

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
            .scalar_subquery()
        )
        
        print(user_treepath_length)
        
        recent_files = (
            db.session.query(File)
            .join(user_org_table, File.org_id == user_org_table.c.org_id)
            .filter(user_org_table.c.user_id == user_id)
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
        

