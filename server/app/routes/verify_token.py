from flask import Flask, jsonify, request, Blueprint
from flask_jwt_extended import JWTManager, decode_token, jwt_required, create_access_token
from datetime import timedelta
from jwt import ExpiredSignatureError, DecodeError



verify_jwt_bp = Blueprint("verify_token", __name__)

@verify_jwt_bp.route('/api/verify_token', methods=['POST'])
def verify_token():
    data = request.get_json()

    token = data.get('token', None)

    
    if not token:
        return jsonify({"msg": "Token is required"}), 400

    try:

        decoded_token = decode_token(token)
        return jsonify({"msg": "Token is valid", "decoded_token": decoded_token}), 200
    except ExpiredSignatureError:
        return jsonify({"msg": "Token has expired"}), 401
    except DecodeError:
        return jsonify({"msg": "Invalid token"}), 422
    except Exception as e:
        return jsonify({"msg": str(e)}), 500

