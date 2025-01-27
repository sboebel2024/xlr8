from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
from app.models import User
from app import db

logout_bp = Blueprint('logout', __name__)

@logout_bp.route('/', methods=['GET', 'POST'])
def logout():
    data = request.get_json()
    if not data or 'user_id' not in data:
        return jsonify({"status": "NOK", "message": "Missing username or Password"}), 400
    
    user_id = data['user_id']
    

    user = User.query.get(user_id)
    if user:
        session['user_id'] = None
        session['org_id'] = None
        return jsonify({"status": "OK", "message": "Logout successful"}), 200
    
    return jsonify({"status": "NOK", "message": "Missing/Incorrect username or Password"}), 401


@logout_bp.route('/delete-user', methods=['GET', 'POST'])
def delete_account():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"status": "NOK", "message": "Missing username or Password"}), 400
    
    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        session['user_id'] = None
        db.session.delete(user)
        db.session.commit()
        return jsonify({"status": "OK", "message": "Logout successful"}), 200
    
    return jsonify({"status": "NOK", "message": "Missing/Incorrect username or Password"}), 401


    