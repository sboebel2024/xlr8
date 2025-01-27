from app import create_app, db
import config
from flask import send_from_directory
from app.models import *
from flask_socketio import SocketIO, join_room, emit, leave_room
import threading
import time

# Create app in the testing configuration
app = create_app(config.TestingConfig)

def update_daily_codes():
    with app.app_context():
        while True:
            orgs = Org.query.all()
            for org in orgs:
                org.generate_new_code()
                db.session.add(org)
            db.session.commit()
            print("Codes updated.")
            time.sleep(600)  # Sleep for 10m

thread = threading.Thread(target=update_daily_codes)
thread.daemon = True
thread.start()

# Create the websockets thingy
socketio = SocketIO(app, cors_allowed_origins="*")

# Get the xlr8 icon from the static folder
@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')

# Route that is called when a user starts viewing a file
@socketio.on('join')
def handle_join(data):
    room = data['file_id']  # Use file_id as the room identifier
    user_id = data['user_id']
    
    # File <=> Room is one to one
    join_room(room)
    emit('user_joined', {'user_id': user_id}, room=room)
    print(f"User {user_id} joined room {room}")

# Route that processes when a user quits viewing a file
@socketio.on('leave')
def handle_leave(data):
    room = data['file_id']
    user_id = data['user_id']
    
    leave_room(room)
    emit('user_left', {'user_id': user_id}, room=room)
    print(f"User {user_id} left room {room}")

# Route that processes the state updates from each 
# user and broadcasts them to all other users
@socketio.on('state_update')
def handle_state_update(data):
    room = data['file_id']
    state = data['state']
    user_id = data['user_id']

    emit('state_update', {'state': state, 'user_id': user_id}, room=room)
    print(f"State updated by {user_id} in room {room}: {state}")



# Run everything
if __name__ == '__main__':

    # Create the database if it doesn't exist
    with app.app_context():
        db.create_all()

    # Run the app (Ec2 uses Nginx reverse proxy to serve https)
    print("Flask app starting...")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
