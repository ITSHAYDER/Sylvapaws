from app.models import db
from sqlalchemy.sql import func
from ..utilis.imageutilis import convert_img

class Post(db.Model):
    __tablename__ = 'posts'
    post_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    animal_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)  # Ensure 'users' matches User.__tablename__
    image_path = db.Column(db.String, nullable=False)
    type = db.Column(db.String, nullable=False)
    user = db.relationship('User', back_populates='posts')
    posted_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    country = db.Column(db.String , nullable=True)
    state = db.Column(db.String, nullable=True)
    exact_place = db.Column(db.String , nullable=True)
    animal_type = db.Column(db.String, nullable=True)
    medical = db.Column(db.String, nullable=False)
    contact = db.Column(db.String , nullable = False)
    tags = db.Column(db.String , nullable = False)

    
    

    def to_dict(self):
        return {
            "post_id" : self.post_id,
            "animal_name":self.animal_name,
            "description":self.description,
            "user_id":self.user_id,
            "type":self.type,
            "date":self.posted_at.strftime('%B %d, %Y'),
            "animaltype":self.animal_type,
            "image": convert_img(self.image_path),
            "exact_place":self.exact_place,
            "state":self.state,
            "country":self.country,
            "medical":self.medical,
            "contact":self.contact,
            "tags":self.tags

        }
    



