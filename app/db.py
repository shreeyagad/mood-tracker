from flask_sqlalchemy import SQLAlchemy
import datetime
from datetime import date
from services.emotion_service import idx_to_emotion
# from flask_login import UserMixin

db = SQLAlchemy()

class Emotion(db.Model):
    __tablename__ = "emotion"
    id = db.Column(db.Integer, primary_key=True)
    emotion_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False) # , db.ForeignKey("user.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(500), nullable=False)

    def __init__(self, **kwargs):
        self.emotion_id = kwargs.get('emotion_id')
        self.status = kwargs.get('status')
        self.user_id = kwargs.get('user_id')
        self.date = date.today()
    
    def serialize(self):
        return {
            'id': self.id,
            'emotion_id': self.emotion_id,
            'emotion': idx_to_emotion[self.emotion_id],
            'status': self.status,
            'user_id': self.user_id,
            'date': str(self.date)
        }
    
    @staticmethod
    def get(emotion_id, user_id):
        return Emotion.query.filter_by(id=emotion_id, user_id=user_id).first()
    
    @staticmethod
    def get_all(user_id):
        return Emotion.query.filter_by(user_id=user_id)


# class User(UserMixin, db.Model):
#     __tablename__ = "user"
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), nullable=False, unique=True)
#     name = db.Column(db.String(80), nullable=False, unique=True)
#     emotions = db.relationship("Emotion", cascade="delete")

#     def __init__(self, **kwargs):
#         self.username = kwargs.get('username')
#         self.name = kwargs.get('name')

#     def serialize(self):
#         return {
#             'id': self.id,
#             'username': self.username,
#             'name': self.name,
#             'emotions': [e.serialize() for e in self.emotions]
#         }
    
#     @staticmethod
#     def get(user_id):
#         return User.query.filter_by(id=user_id).first()