from flask import Blueprint, jsonify
from ..models.post import Post
 # Ensure this path is correct
import base64
main_posts_bp = Blueprint("main_post_bp", __name__)

def convert_img(Post):
    image_base64 = None
    if Post.image_path:
        try:
            with open(Post.image_path, 'rb') as image_file:
                image_base64 = base64.b64encode(image_file.read()).decode('utf-8')
                
        except FileNotFoundError:
            image_base64 = None  
        return image_base64

@main_posts_bp.route("/api/main_posts", methods=["GET"])
def main_posts():
    try:
        # Fetch the first 3 posts from the database
        posts = Post.query.limit(-3).all()
        
        # Convert each post to a dictionary and apply image transformation
        post_list = []
        for post in posts:
            try:
                image_url = convert_img(post,)  # Apply the image transformation
            except Exception as img_error:
                image_url = None  # Fallback in case of image processing error
                print(f"Image conversion error: {img_error}")

            post_list.append({
                "title": post.animal_name,
                "description": post.description,
                "image_url": image_url  # Add image URL or None if an error occurred
            })

        return jsonify({"posts": post_list})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
