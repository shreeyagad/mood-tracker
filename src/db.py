from flask_sqlalchemy import SQLAlchemy
import datetime
from datetime import date
from services.emotion_service import idx_to_emotion

db = SQLAlchemy()

class Emotion(db.Model):
    __tablename__ = "emotion"
    id = db.Column(db.Integer, primary_key=True)
    emotion_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)

    def __init__(self, **kwargs):
        self.emotion_id = kwargs.get('emotion_id')
        self.user_id = kwargs.get('user_id')
        self.date = date.today()
    
    def serialize(self):
        return {
            'id': self.id,
            'emotion_id': self.emotion_id,
            'emotion': idx_to_emotion[self.emotion_id],
            'user_id': self.user_id,
            'date': str(self.date)
        }


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    name = db.Column(db.String(80), nullable=False, unique=True)
    emotions = db.relationship("Emotion", cascade="delete")

    def __init__(self, **kwargs):
        self.username = kwargs.get('username')
        self.name = kwargs.get('name')

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'name': self.name,
            'emotions': [e.serialize() for e in self.emotions]
        }