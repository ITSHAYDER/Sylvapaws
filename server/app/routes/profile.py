from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User
from ..models.post import Post
from ..models import db
import base64
from ..utilis.imageutilis import convert_img

user_data_bp = Blueprint("user_data_bp", __name__)

# Route to get the user ID from the JWT



@user_data_bp.route('/api/get_user_id', methods=['POST'])
@jwt_required()  # Ensure the request contains a valid JWT
def get_user_id():
    current_user = get_jwt_identity()
    return jsonify({'user_id': current_user}), 200

# Route to get the user profile based on user ID in the URL
@user_data_bp.route('/api/profile/', methods=['GET'])
@jwt_required()
def get_user_info():
    id = get_jwt_identity()
    user = User.query.filter_by(user_id=id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    posts = Post.query.filter_by(user_id=id).all()

    # Returning user details and posts in the response
    return jsonify({
        "username": user.user_name,
        "bio": user.bio,
        "posts": [post.to_dict() for post in posts],  # Assuming Post has a `to_dict()` method
        "tags": user.tags,  # Assuming tags is a list
        "image": convert_img(user.image)
    }), 200
