from flask import Blueprint, request, jsonify, session, render_template
from werkzeug.security import generate_password_hash
from app.models import *
from app import db
import stripe

signup_bp = Blueprint('signup', __name__)

stripe.api_key = 'your-secret-key'

WEBHOOK_SECRET = 'your-secret-key'

@signup_bp.route('/render-signup', methods=['GET'])
def render_signup():
    return render_template('signup_page.html')

@signup_bp.route('/render-join-org', methods = ['GET'])
def render_join_org():
    return render_template('join_org.html')

@signup_bp.route('/render-create-org', methods = ['GET'])
def render_create_org():
    return render_template('create_org.html')

@signup_bp.route('/create-org', methods = ['POST'])
def create_org():
    data = request.get_json()
    user_id = session.get('user_id')
    if not user_id:
        return render_template('signup_page.html')
    
    user = User.query.get(user_id)
    if not user:
        return render_template('signup_page.html')
    
    orgName = data['orgName']
    
    org = Org(orgName=orgName, signing_user=user)
    user.orgs.append(org)

    db.session.add(org)
    db.session.commit() 
    # Payment
    # payload = request.get_data(as_text=True)
    # sig_header = request.headers.get('Stripe-Signature')
    session['user_id'] = user.id
    session['org_id'] = org.id

    # try:
    #     # Verify the webhook signature
    #     event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    # except ValueError:
    #     # Invalid payload
    #     return jsonify({"status": "NOK", "message": "Invalid payload"}), 400

    # except stripe.error.SignatureVerificationError:
    #     # Invalid signature
    #     return jsonify({"status": "NOK", "message": "Invalid signature"}), 400

    
    # if event['type'] == 'payment_intent.succeeded':
    #     # payment_intent = event['data']['object']  # Contains payment details 
    #     # ^^^ can use this to verify organization details ^^^
    # commit org data
    return jsonify({"status": "OK", "message": f"{org.orgName} created."}), 200

@signup_bp.route('/join-org', methods=['POST'])
def join_org():
    user_id = session.get('user_id')
    if not user_id:
        return render_template('/signup/render-signup')

    user = User.query.get(user_id)
    if not user:
        return render_template('/signup/render-signup')

    data = request.get_json()
    org_name = data.get('orgName')
    if not org_name:
        return jsonify({"status": "NOK", "message": "Organization name is required"}), 400

    org = Org.query.filter_by(orgName=org_name).first()
    if not org:
        return jsonify({"status": "NOK", "message": "Organization not found"}), 404

    # Check if the user is already a member
    if org in user.orgs:
        return jsonify({"status": "NOK", "message": "User is already a member of this organization"}), 400

    data = request.get_json()
    orgName = data['orgName']
    code = data['code']
    org = Org.query.filter_by(orgName=orgName).first()
    if not org:
        return jsonify({"status": "NOK", "message": "Organization not found"}), 404
    
    if org.daily_code != code:
        return jsonify({"status": "NOK", "message": "Invalid code"}), 400
    
    if (datetime.now(timezone.utc) - org.code_updated_at).days > 0:
        return jsonify({"status": "NOK", "message": "Code expired"}), 400
        
    
    
    session['user_id'] = user.id
    session['org_id'] = org.id
    user.orgs.append(org)
    db.session.add(user)
    db.session.commit()
    return jsonify({"status": "OK", "message": f"Requested to join {orgName}"}), 200



@signup_bp.route('/', methods=['POST'] )
def signup():
    data = request.get_json()

    birthday = data['birthday'] # JSON
    phoneNumber = data['phoneNumber']
    password = data['password']
    email = data['email'] # string
    username = data['username']
    firstName = data['firstName']
    lastName = data['lastName']

    if ((username == "") or (not phoneNumber) or (not birthday) or (email == "") or (password == "") or (firstName == "") or (lastName== "")):
        return jsonify({"status": "NOK", "message":"One or multiple fields are unsatisfied."}), 400
    
    potUser = User.query.filter_by(email=email).all()
    if potUser:
        return jsonify({"status": "NOK", "message": f"The email {email} is already in use. Please sign in!"}), 400
    
    potUser = User.query.filter_by(username=username).all()
    if potUser:
        return jsonify({"status": "NOK", "message": f"The username {username} is already in use. Please sign in!"}), 400

    user = User(username = username, firstName=firstName, lastName=lastName, birthday=birthday, password=generate_password_hash(password), phoneNumber=phoneNumber, email=email, temporary=False)

    if user:
        db.session.add(user)
        db.session.commit()
        session['user_id'] = user.id
        return jsonify({"status": "OK", "message": "Signup successful"}), 200
    
        

    return jsonify({"status": "NOK", "message": "Something went wrong."}), 400
    



