from flask import Blueprint, jsonify
from app.models import Post

postinfo_bp = Blueprint('postinfo', __name__)

@postinfo_bp.route('/api/post/<int:post_id>', methods=['GET'])
def get_post_info(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404
    return jsonify(post.to_dict())
