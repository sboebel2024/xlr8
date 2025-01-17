from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
from app.models import User
from app import db

login_bp = Blueprint('login', __name__)

@login_bp.route('/', methods=['GET', 'POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"status": "NOK", "message": "Missing username or Password"}), 400
    
    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        db.session.add(user)
        db.session.commit()
        session['user_id'] = user.id
        return jsonify({"status": "OK", "message": f"Login successful for {user.firstName} {user.lastName} with id {user.id} and session {dict(session)}"}), 200
    
    return jsonify({"status": "NOK", "message": "Missing username or Password"}), 401


    