import jwt
import datetime
from flask import Blueprint, request, jsonify, current_app , make_response , send_file
from werkzeug.security import check_password_hash
from app.models.user import User
from flask_jwt_extended import set_access_cookies
from app.models import db
from flask_jwt_extended import create_access_token
from sqlalchemy import select, update, delete, values
from ..utilis.imageutilis import convert_img
from datetime import timedelta

login_blueprint = Blueprint("login", __name__)

def check_user(email, password):
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        return user
    return None


@login_blueprint.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    rememberme = data.get("rememberme") 
    session_time = 30 if rememberme else 1
    if not email or not password: 
        return {"message": "Email and password are required"}, 400

    user = check_user(email, password)

    if user:
        access_token = create_access_token(identity=user.user_id, expires_delta=timedelta(days=session_time) )
        response = jsonify({
            "access_token": access_token,
            "user_id": user.user_id,
            "image":convert_img(user.image)


        })
        set_access_cookies(response, access_token)
        return response
    else:
        return {"message": "Email or password incorrect"}, 401

