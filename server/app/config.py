import os
from datetime import timedelta

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///site.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False  
    SECRET_KEY = os.getenv('SECRET_KEY', os.urandom(24))

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your_jwt_secret_key')  # Replace with a secure value from an environment variable
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_IDENTITY_CLAIM = "user_id"
    

    EMAIL = os.getenv('EMAIL', 'your_email@example.com')  # Use an environment variable
    PASSWORD = os.getenv('PASSWORD', 'your_password')  # Use an environment variable or OAuth for better security
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    
    # Google OAuth secrets should be set via environment variables
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', 'your_google_client_id')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', 'your_google_client_secret')
    GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"
    
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  