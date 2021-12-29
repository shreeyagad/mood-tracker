from flask_sqlalchemy import SQLAlchemy
from src.services.emotion_service import idx_to_emotion
import datetime
from datetime import timezone, datetime, timedelta, date
import random

db = SQLAlchemy()

class Emotion(db.Model):
    __tablename__ = "emotion"
    id = db.Column(db.Integer, primary_key=True)
    emotion_id = db.Column(db.Integer, nullable=False)
    aws_id = db.Column(db.String(128), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(500), nullable=False)
    
    emotion_data = db.relationship(
        'EmotionData', 
        backref='emotion', 
        lazy=True, 
        uselist=False,
        cascade="delete"
        )

    def __init__(self, **kwargs):
        self.emotion_id = kwargs.get('emotion_id')
        self.aws_id = str(random.getrandbits(128))
        self.status = kwargs.get('status')
        self.user_id = kwargs.get('user_id')
        self.date_time = datetime.now(timezone.utc)
    
    def serialize(self, offset):
        # return in user's timezone
        time_offset = timedelta(minutes=offset)
        user_date_time = self.date_time-time_offset
        return {
            'id': self.id,
            'emotion': idx_to_emotion[self.emotion_id],
            'aws_id': self.aws_id,
            'emotion_data': self.emotion_data.serialize(),
            'status': self.status,
            'user_id': self.user_id,
            'date_time': str(user_date_time),
            'date': str(user_date_time.date()),
            'year': str(user_date_time.date().year),
            'month': str(user_date_time.date().month)
        }
    
    @staticmethod
    def get_by_emotion_id(emotion_id, user_id):
        return Emotion.query.filter_by(id=emotion_id, user_id=user_id).first()

    @staticmethod
    def get_by_date(year, month, day, offset, user_id):
        time_offset = timedelta(minutes=offset)
        emotions = Emotion.query.filter(
            Emotion.user_id == user_id
        )
        emotions = list(filter(lambda e: (e.date_time-time_offset).year == int(year), emotions))
        emotions = list(filter(lambda e: (e.date_time-time_offset).month == int(month), emotions))
        emotions = list(filter(lambda e: (e.date_time-time_offset).day == int(day), emotions))
        return emotions
    
    @staticmethod
    def get_by_month_and_year(year, month, offset, user_id):
        time_offset = timedelta(minutes=offset)
        emotions = Emotion.query.filter(
            Emotion.user_id == user_id
        )
        emotions = list(filter(lambda e: (e.date_time-time_offset).year == int(year), emotions))
        emotions = list(filter(lambda e: (e.date_time-time_offset).month == int(month), emotions))
        return emotions
    
    @staticmethod
    def get_by_year(year, offset, user_id):
        time_offset = timedelta(minutes=offset)
        emotions = Emotion.query.filter(
            Emotion.user_id == user_id
        )
        emotions = list(filter(lambda e: (e.date_time-time_offset).year == int(year), emotions))
        return emotions

    @staticmethod
    def get_all(user_id):
        return Emotion.query.filter_by(user_id=user_id)


class EmotionData(db.Model):
    __tablename__ = "emotionData"
    id = db.Column(db.Integer, primary_key=True)
    emotion_id = db.Column(db.Integer, db.ForeignKey("emotion.id"), nullable=False)

    # emotions
    anger = db.Column(db.Float, nullable=False)
    fear = db.Column(db.Float, nullable=False)
    surprise = db.Column(db.Float, nullable=False)
    sadness = db.Column(db.Float, nullable=False)
    joy = db.Column(db.Float, nullable=False)
    love = db.Column(db.Float, nullable=False)

    def __init__(self, emotion_id, emotion_data):
        self.emotion_id = emotion_id

        self.anger = emotion_data[0]
        self.fear = emotion_data[1]
        self.joy = emotion_data[2]
        self.love = emotion_data[3]
        self.sadness = emotion_data[4]
        self.surprise = emotion_data[5]
    
    def serialize(self):
        return {
            "Anger": self.anger,
            "Fear": self.fear,
            "Surprise": self.surprise,
            "Sadness": self.sadness,
            "Joy": self.joy,
            "Love": self.love,
            "Data": [
                self.anger,
                self.fear,
                self.joy, 
                self.love,
                self.sadness,
                self.surprise
            ]
        }


