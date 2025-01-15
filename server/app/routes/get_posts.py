from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import db
from ..models.post import Post
import base64

get_posts_bp = Blueprint("get_posts", __name__)

@get_posts_bp.route("/api/get_posts", methods=["POST", "GET"])
@jwt_required()
def get_posts():
    data = request.get_json()
    
    # Get the last seen post ID from the request
    last_seen_id = data.get("last_seen_id", 0) if data else 0
    
    # Base query
    query = Post.query

    # Add country filter if provided
    if data and data.get("country"):
        query = query.filter_by(country=data["country"])
    
    # Only get posts newer than the last seen ID if one was provided
    if last_seen_id > 0:
        query = query.filter(Post.post_id > last_seen_id)
    
    # Order by ID descending to get newest posts first
    posts = query.order_by(Post.post_id.desc()).all()

    if not posts:
        return jsonify({"posts": []})

    posts_list = []
    for post in posts:
        post_data = post.to_dict()
        try:
            with open(post.image_path, 'rb') as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            post_data["image_base64"] = encoded_string
        except FileNotFoundError:
            post_data["image_base64"] = None
        posts_list.append(post_data)

    return jsonify({"posts": posts_list})