from flask import Blueprint, request, jsonify, redirect
import requests
from oauthlib.oauth2 import WebApplicationClient
from datetime import timedelta
from flask_jwt_extended import create_access_token
from app.models.user import User
from app.models import db
from ..config import Config
from .sendemail import EmailSender
from .email_templates import welcome_content

def send_an_email(recipient_email):
    email = EmailSender(my_email=Config.EMAIL, password=Config.PASSWORD)
    email.send_email(
        subject="Welcome to Our Service",
        content=welcome_content,
        recipient_email=recipient_email
    )
class GoogleLogin:
    def __init__(self):
        self.client = WebApplicationClient(Config.GOOGLE_CLIENT_ID)

    def get_google_provider_cfg(self):
        return requests.get(Config.GOOGLE_DISCOVERY_URL).json()

    def google_login(self):
        google_provider_cfg = self.get_google_provider_cfg()
        authorization_endpoint = google_provider_cfg["authorization_endpoint"]

        request_uri = self.client.prepare_request_uri(
            authorization_endpoint,
            redirect_uri=request.base_url + "/callback",
            scope=["openid", "email", "profile"],
        )
        
        return redirect(request_uri)

    def google_callback(self, sendemaill=False):
        try:
            code = request.args.get("code")
            google_provider_cfg = self.get_google_provider_cfg()
            token_endpoint = google_provider_cfg["token_endpoint"]

            token_url, headers, body = self.client.prepare_token_request(
                token_endpoint,
                authorization_response=request.url,
                redirect_url=request.base_url,
                code=code,
            )
            token_response = requests.post(
                token_url,
                headers=headers,
                data=body,
                auth=(Config.GOOGLE_CLIENT_ID, Config.GOOGLE_CLIENT_SECRET),
            )

            self.client.parse_request_body_response(token_response.text)

            userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
            uri, headers, body = self.client.add_token(userinfo_endpoint)
            userinfo_response = requests.get(uri, headers=headers, data=body)
            

            if userinfo_response.json().get("email_verified"):
                
                google_id = userinfo_response.json()["sub"]
                email = userinfo_response.json()["email"]
                name = userinfo_response.json().get("given_name", "")
                
                send_an_email(email)


                user = User.query.filter_by(email=email).first()

                if not user:
                    
                    user = User(email=email, name=name, password=google_id)
                    db.session.add(user)
                    db.session.commit()



                access_token = create_access_token(
                    identity=user.user_id,
                    expires_delta=timedelta(days=30)
                )

                response = redirect("http://127.0.0.1:5500/public/pages/adoption.html")
                response.set_cookie('token', access_token)
                response.set_cookie('id', str(user.user_id))
                return response
            else:
                return jsonify({"message": "User email not verified by Google."}), 400
        except Exception as e:
            return jsonify({"message": str(e)}), 500


# Create a blueprint
googlelogin_blueprint = Blueprint("googlelogin", __name__)

# Create an instance of GoogleLogin
google_login_instance = GoogleLogin()

# Define routes using the instance methods
@googlelogin_blueprint.route("/google/login")
def google_login():
    return google_login_instance.google_login()

@googlelogin_blueprint.route("/google/login/callback")
def google_callback():
    return google_login_instance.google_callback()