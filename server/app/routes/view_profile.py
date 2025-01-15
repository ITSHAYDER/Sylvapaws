











from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User
from ..models.post import Post
from ..models import db




from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models.user import User
from ..models.post import Post

user_info_bp = Blueprint("user_info", __name__)

# Route to get the user profile based on user ID in the URL
@user_info_bp.route('/api/profile/<id>', methods=['GET'])

def get_user_infoo(id):
    # Fetch user by the provided ID
    user = User.query.filter_by(user_id=id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Fetch posts for the user
    posts = Post.query.filter_by(user_id=id).all()

    # Return user details and posts in the response
    return jsonify({
        "username": user.user_name,
        "bio": user.bio,
        "posts": [post.to_dict() for post in posts],  # Assuming Post has a `to_dict()` method
        "tags": user.tags,  # Assuming tags is a list
        "profile_image": user.image
    }), 200
