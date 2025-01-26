from flask import Blueprint, request, jsonify, session, Response, stream_with_context, render_template
from app.models import *
from app import db
import app
import requests
from sqlalchemy import or_
from flask_socketio import SocketIO, join_room, leave_room, emit
import base64


org_dashboard_bp = Blueprint('org_dashboard', __name__)


@org_dashboard_bp.route('/accept-invite')
def accept_invite():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"status": "NOK", "message": "User not logged in"}), 401
    
    data = request.get_json()
    invite_id = data.get('invite_id')

    if not invite_id:
        return jsonify({"status": "NOK", "message": "Invite ID is required"}), 400

    invite = OrgInvite.query.get(invite_id)
    if not invite:
        return jsonify({"status": "NOK", "message": "Invite not found"}), 404

    # Ensure the user is an admin of the organization
    org = invite.org
    admin = User.query.get(user_id)
    if admin not in org.admins:  # Assuming `Org` has a `admins` relationship
        return jsonify({"status": "NOK", "message": "User is not authorized to approve requests for this organization"}), 403

    # Approve the request
    invite.status = 'approved'
    invite.user.orgs.append(org)  # Add user to organization
    db.session.add(invite)
    db.session.commit()

    return jsonify({"status": "OK", "message": f"Request approved for user {invite.user.username} to join {org.orgName}"}), 200
