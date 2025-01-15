from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db
from ..models.post import Post
from ..models.user import User

delete_post_bp = Blueprint("delete_post", __name__)

@delete_post_bp.route("/api/delete", methods=["DELETE"])
@jwt_required()
def delete_posts():
    current_user_id = get_jwt_identity()
    
    # Get post_id from JSON data
    data = request.get_json()
    if not data or "post_id" not in data:
        return jsonify({"message": "post_id is required"}), 400

    post_id = data["post_id"]
    
    # Find the post
    post = Post.query.filter_by(post_id=post_id).first()
    if not post:
        return jsonify({"message": "Post not found"}), 404

    # Check if the post belongs to the current user
    if post.user_id != current_user_id:
        return jsonify({"message": "unauthorized deletion"}), 403

    # Delete the post
    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "Post deleted successfully"}), 200
