from flask import Blueprint, request, jsonify, session, render_template
from werkzeug.security import check_password_hash
from app.models import *
from app import db
from sqlalchemy.sql import select

api_routes_bp = Blueprint('api-routes', __name__)


@api_routes_bp.route('/set-extensor', methods=['GET', 'POST'])
def set_extensor():
    data = request.get_json()

    file_id = data['file_id']
    extensor = data.get("ext", None)

    if not file_id:
        return jsonify({"status":"NOK", "message":"Error: file_id not found"}), 404
    
    file = File.query.get(file_id)

    if not extensor:
        if not file.extensor:
            return jsonify({"status":"NOK", "message":"Extensor is null. Set extensor", "setExtensor":"True"}), 200
        else:
            return jsonify({"status":"OK", "extensor":file.extensor}), 200  
        
    else:
        file.extensor = extensor
        db.session.add(file)
        db.session.commit()
        return jsonify({"status":"OK", "extensor":file.extensor}), 200  

@api_routes_bp.route('/set-name', methods=['GET', 'POST'])
def set_name():
    data = request.get_json()

    file_id = data['file_id']
    name = data.get("name", None)

    if not file_id:
        return jsonify({"status":"NOK", "message":"Error: file_id not found"}), 404
    
    file = File.query.get(file_id)

    if not name:
        if not file.fileName:
            return jsonify({"status":"NOK", "message":"Error: Name not found"}), 404
        else:
            return jsonify({"status":"OK", "name":file.fileName}), 200  
        
    else:
        file.fileName = name
        db.session.add(file)
        db.session.commit()
        return jsonify({"status":"OK", "name":file.fileName}), 200
    
@api_routes_bp.route('/set-content', methods=['GET', 'POST'])
def set_content_api():
    data = request.get_json()

    file_id = data['file_id']
    content = data.get('content', None)

    if not file_id:
        return jsonify({"status":"NOK", "message":"Error: file_id not found"}), 404
    
    file = File.query.get(file_id)

    if not content:
        if not file.content:
            return jsonify({"status":"NOK", "message":"Error: Content not found"}), 404
        else:
            return jsonify({"status":"OK", "content":file.content}), 200  
        
    else:
        file.content = content
        db.session.add(file)
        db.session.commit()
        return jsonify({"status":"OK", "content":file.content}), 200
    
    
@api_routes_bp.route('/set-user-profile', methods=['GET', 'POST'])
def set_content():
    data = request.get_json()

    user_id = data["user_id"]
    file_id = data["file_id"]
    user_profile = data.get('user_profile', None)

    if (not user_id) or (not file_id):
        return jsonify({"status":"NOK", "message":"Error: user_id not found"}), 404

    stmt = user_file_table.update().where(
        (user_file_table.c.user_id == user_id) & (user_file_table.c.file_id == file_id)
    ).values(user_profile=user_profile)

    db.session.execute(stmt)
    db.session.commit()

    return jsonify({"status": "OK", "message": "User profile updated successfully"}), 200


@api_routes_bp.route('/get-user-profile', methods=['GET'])
def get_user_profile():
    user_id = request.args.get("user_id")
    file_id = request.args.get("file_id")

    if not user_id or not file_id:
        return jsonify({"status": "NOK", "message": "Error: Missing user_id or file_id"}), 400

    # Query the user_profile column for the given user_id and file_id
    stmt = select(user_file_table.c.user_profile).where(
        (user_file_table.c.user_id == user_id) & (user_file_table.c.file_id == file_id)
    )

    result = db.session.execute(stmt).fetchone()

    if not result or result[0] is None:
        return jsonify({"status": "NOK", "message": "User profile not found"}), 404

    return jsonify({"status": "OK", "user_profile": result[0]}), 200
    
