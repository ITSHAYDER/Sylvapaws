from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models import db
from werkzeug.utils import secure_filename
import os
import base64
from ..config import Config

update_profile_bp = Blueprint("update_profile", __name__)

def process_file():
    file = request.files.get("file")
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(file_path)
        return file_path
    return None

@update_profile_bp.route("/api/update_profile", methods=["POST"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404

    username = request.form.get("username")
    bio = request.form.get("bio")
    file_path = process_file()

    if username:
        user.user_name = username
    if bio:
        user.bio = bio
    if file_path:
        user.image = file_path  

    db.session.commit()

    # Convert image to base64 for returning in response
    return {
        "message":"profile updated succefully"
    },201

    





