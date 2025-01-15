

from flask import Blueprint, request, jsonify, redirect
from app.models.user import User  
from app.models import db 
from werkzeug.security import generate_password_hash
from .googlelogin import GoogleLogin
from .sendemail import EmailSender
from ..config import Config
from .email_templates import welcome_content




def send_an_email(recipient_email):
    email = EmailSender(my_email=Config.EMAIL, password=Config.PASSWORD)
    email.send_email(
        subject="Welcome to Our Service",
        content=welcome_content,
        recipient_email=recipient_email
    )


    



register_bp = Blueprint('register', __name__)




@register_bp.route("/api/google_register")
def google_register():
    return GoogleLogin.google_login()

@register_bp.route("/google/register/callback")
def google_callback():
    return GoogleLogin.google_callback(sendemail=True)


        
        
   

@register_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get("name")
    user_name = data.get("user_name")
    email = data.get("email")
    password = data.get("password")
    
    if not all([name, user_name, email, password]):
        return jsonify({'message': 'All fields are required'}), 400
    
    existing_email = User.query.filter_by(email=email).first()
    existing_user = User.query.filter_by(user_name=user_name).first()
    
    if existing_user:
        return jsonify({'message': 'User with this username already exists'}), 400
    if existing_email:
        return jsonify({'message': 'User with this email already exists'}), 400
    
    user = User(name=name, user_name=user_name, email=email, password=generate_password_hash(password))
    
    try:
        db.session.add(user)
        db.session.commit()
        send_an_email()

        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error occurred: {str(e)}'}), 500
