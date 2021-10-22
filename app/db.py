from flask_sqlalchemy import SQLAlchemy
from services.emotion_service import idx_to_emotion

db = SQLAlchemy()

class Emotion(db.Model):
    __tablename__ = "emotion"
    id = db.Column(db.Integer, primary_key=True)
    emotion_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(500), nullable=False)

    def __init__(self, **kwargs):
        self.emotion_id = kwargs.get('emotion_id')
        self.status = kwargs.get('status')
        self.user_id = kwargs.get('user_id')
        self.date = kwargs.get('date')
    
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
    def get_by_emotion_id(emotion_id, user_id):
        return Emotion.query.filter_by(id=emotion_id, user_id=user_id).first()

    @staticmethod
    def get_by_date(date, user_id):
        return Emotion.query.filter_by(date=date, user_id=user_id).first()
    
    @staticmethod
    def get_all(user_id):
        return Emotion.query.filter_by(user_id=user_id)