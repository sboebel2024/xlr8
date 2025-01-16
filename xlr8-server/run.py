from app import create_app, db
import config
from flask import g
from app.models import *
import secrets


app = create_app(config.TestingConfig)

# @app.before_request
# def add_nonce():
#     g.nonce = secrets.token_hex(16)  # Generate a unique nonce for each request

# @app.after_request
# def apply_csp(response):
#     response.headers['Content-Security-Policy'] = (
#         f"script-src 'self' https://accounts.google.com https://apis.google.com https://www.gstatic.com 'nonce-{g.nonce}'; "
#         "object-src 'none';"
#     )
#     return response


if __name__ == '__main__':

    with app.app_context():
        db.create_all()

    print("Flask app starting...")
    app.run(host="0.0.0.0", port=5000)