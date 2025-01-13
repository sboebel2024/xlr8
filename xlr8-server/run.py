from app import create_app, db
import config
from app.models import *


app = create_app(config.TestingConfig)

if __name__ == '__main__':

    with app.app_context():
        db.create_all()

    print("Flask app starting...")
    app.run(host="0.0.0.0", port=5000)