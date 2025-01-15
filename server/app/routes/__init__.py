

from flask import Blueprint
from .login import login_blueprint
from .register import register_bp
from .add_post import add_post_bp
from .verify_token import verify_jwt_bp
from .profile import user_data_bp
from .update_profile import update_profile_bp
from .view_profile import user_info_bp
from.get_posts import get_posts_bp
from .delete import delete_post_bp
from .post_for_main_page import main_posts_bp
from .googlelogin import googlelogin_blueprint
from .postinfo import postinfo_bp
def register_routes(app):
    app.register_blueprint(googlelogin_blueprint)
    app.register_blueprint(delete_post_bp)
    app.register_blueprint(update_profile_bp)
    app.register_blueprint(user_data_bp)
    app.register_blueprint(add_post_bp)
    app.register_blueprint(login_blueprint)
    app.register_blueprint(register_bp)
    app.register_blueprint(verify_jwt_bp)
    app.register_blueprint(user_info_bp)
    app.register_blueprint(main_posts_bp)
    app.register_blueprint(get_posts_bp)
    app.register_blueprint(postinfo_bp)
