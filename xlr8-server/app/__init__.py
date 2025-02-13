from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app(config_class='config.Config'):
    """Create the flask app"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)



    from app.routes.login_routes import login_bp
    from app.routes.signup_routes import signup_bp
    from app.routes.logout_routes import logout_bp
    from app.routes.dashboard_user import user_dashboard_bp
    from app.routes.org_dashboard import org_dashboard_bp
    from app.routes.api_routes import api_routes_bp
    # etc

    app.register_blueprint(login_bp, url_prefix='/login')
    app.register_blueprint(signup_bp, url_prefix='/signup')
    app.register_blueprint(logout_bp, url_prefix='/logout')
    app.register_blueprint(user_dashboard_bp, url_prefix='/user-dashboard')
    app.register_blueprint(org_dashboard_bp, url_prefix='/org-dashboard')
    app.register_blueprint(api_routes_bp, url_prefix='/api-routes/')


    return app

