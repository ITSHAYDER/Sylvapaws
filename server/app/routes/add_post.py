import logging
from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
import os
from PIL import Image
from ..models import db
from ..models.post import Post
from ..config import Config  
from requests_toolbelt import MultipartEncoder
from flask_jwt_extended import get_current_user



add_post_bp = Blueprint("add_post", __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def resize_image(image_path, resized_path, size):
    try:
        with Image.open(image_path) as img:
            img = img.resize(size, Image.Resampling.LANCZOS)  # Use LANCZOS resampling
            img.save(resized_path)
    except Exception as e:
        logging.error(f"Error resizing image: {str(e)}")
        raise



def file_pross(x, y):
    if 'file' not in request.files:
        return None, jsonify({"message": "No file part provided"}), 400

    file = request.files['file']
    if not allowed_file(file.filename):
        return None, jsonify({"message": "File type not allowed"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(Config.UPLOAD_FOLDER, filename)

    try:
        # Save the original file first
        file.save(file_path)

        # Resize the image to 500x390
        resized_filename = f"resized{filename}"
        resized_path = os.path.join(Config.UPLOAD_FOLDER, resized_filename)
        resize_image(file_path, resized_path, (x, y))

        # Optionally, delete the original file if only resized version is needed
        os.remove(file_path)
        return resized_path

    except Exception as e:
        logging.error(f"File processing error: {str(e)}")
        return None, jsonify({"message": f"File processing error: {str(e)}"}), 500

@add_post_bp.route("/api/addpost", methods=["POST"])
@jwt_required()
def add_post():
    resized_path = file_pross(500, 390)

    animal_name = request.form.get('animal_name')
    animal_description = request.form.get('description')
    user_id = request.form.get("user_id")
    country = request.form.get("country")
    tags = request.form.get("tags")
    contactinfo = request.form.get("contactInfo")
    medical = request.form.get("medical")
    exact_place = request.form.get("exact-place")
    animal_type = request.form.get("animal_type")


    if not animal_name or not animal_description or not user_id or not country:
        return jsonify({"message": "Please fill out all fields"}), 400

    try:
        post = Post(exact_place=exact_place, animal_type=animal_type,tags=tags,medical=medical,contact=contactinfo ,country=country ,animal_name=animal_name, description=animal_description, image_path=resized_path, type="adoption", user_id=user_id)
        db.session.add(post)
        db.session.commit()

        return jsonify({"message": "Post added successfully", "post": post.to_dict()}), 201
    except Exception as e:
        logging.error(f"Database error: {str(e)}")
        db.session.rollback() 
        return jsonify({"message": f"Database error: {str(e)}"}), 500