from flask import Flask

from app.models import db
from app.routes import register_routes
from flask_jwt_extended import JWTManager
from .config import Config
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    jwt = JWTManager(app)
    register_routes(app)
    CORS(app, supports_credentials=True)

    with app.app_context():
        db.create_all()  # Create tables

    return app
