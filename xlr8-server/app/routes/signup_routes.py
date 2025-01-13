from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash
from app.models import User, Org
from app import db
import stripe

signup_bp = Blueprint('signup', __name__)

stripe.api_key = 'your-secret-key'

WEBHOOK_SECRET = 'your-secret-key'

@signup_bp.route('/', methods=['POST'] )
def signup():
    data = request.get_json()

    isOrg = data['isOrg'] # boolean; is the user trying to create an org?
    joiningOrg = data['joiningOrg'] # boolean; is the user trying to join an organization?
    birthday = data['birthday'] # JSON
    phoneNumber = data['phoneNumber']
    password = data['password']
    email = data['email'] # string
    username = data['username']
    firstName = data['firstName']
    lastName = data['lastName']

    user = User(username = username, firstName=firstName, lastName=lastName, birthday=birthday, password=generate_password_hash(password), phoneNumber=phoneNumber, email=email, temporary=False)

    # check email

    if ((not isOrg) and (not joiningOrg)):
        if user:
            session['user_id'] = user.id
            db.session.add(user)
            db.session.commit()
            return jsonify({"status": "OK", "message": "Signup successful"}), 200
    
    elif ((not isOrg) and (joiningOrg)):
        user.temporary=True
        orgName = data['orgName']
        org = Org.query.filter_by(orgName=orgName).first()
        if not org:
            return jsonify({"status": "NOK", "message": "Organization not found"}), 404
        
        user.orgs.append(org)
        db.session.add(user)
        db.session.commit()
        return jsonify({"status": "OK", "message": f"Requested to join {orgName}"}), 200

              
    else:
        # Payment
        payload = request.get_data(as_text=True)
        sig_header = request.headers.get('Stripe-Signature')
        orgName = data['orgName']

        try:
            # Verify the webhook signature
            event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
        except ValueError:
            # Invalid payload
            return 'Invalid payload', 400
        except stripe.error.SignatureVerificationError:
            # Invalid signature
            return 'Invalid signature', 400
        
        if event['type'] == 'payment_intent.succeeded':
            # payment_intent = event['data']['object']  # Contains payment details 
            # ^^^ can use this to verify organization details ^^^
        
            db.session.add(user)
            db.session.commit()
            org = Org(orgName=orgName, signing_user=user)
            user.orgs.append(org)
            db.session.add(user)
            db.session.add(org)
            db.session.commit() # commit org data
            return jsonify({"status": "OK", "message": f"{org.orgName} created."}), 200

    return jsonify({"status": "NOK", "message": "Something went wrong."}), 400
    



