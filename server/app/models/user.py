from app.models import db
from sqlalchemy.sql import func
from flask import jsonify

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    name = db.Column(db.String, nullable=False)
    user_name = db.Column(db.String, nullable=True, unique=True)  
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())
    bio = db.Column(db.Text, nullable=True)
    tags = db.Column(db.String , nullable=True)
    posts = db.relationship('Post', back_populates='user')
    image = db.Column(db.String, nullable=True)


    def to_dict(self):
        return {
            "user_id": self.user_id,
            "user_name": self.user_name,
            "bio": self.bio,
            # add other fields as needed
        }
