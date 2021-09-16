from db import db, Emotion, User
from flask import Flask, request
import datetime
import json
from services import emotion_service

# generalized response formats

def success_response(data, code=200):
    return (json.dumps({"success": True, "data": data}), code)


def failure_response(message, code=404):
    return (json.dumps({"success": False, "error": message}), code)


def create_app():
    app = Flask(__name__)
    db_filename = "mood-tracker.db"

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///%s" % db_filename
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ECHO"] = True

    db.init_app(app)
    with app.app_context():
        db.create_all()

    # your routes here

    @app.route("/api/emotions/<int:emotion_id>/")
    def get_emotion(emotion_id):
        emotion = Emotion.query.filter_by(id=emotion_id).first()
        if emotion is None:
            return failure_response("Emotion not found")
        return success_response(emotion.serialize())

    @app.route("/api/emotions/")
    def get_emotions():
        return success_response([e.serialize() for e in Emotion.query.all()])

    @app.route("/api/emotions/", methods=["POST"])
    def create_emotion():
        body = json.loads(request.data)
        status = body.get("status")
        user_id = body.get("user_id")
        if not status:
            return failure_response("Status not provided")
        if not user_id:
            return failure_response("User_id not provided")
        emotion_id = emotion_service.classify_status(status)
        new_emotion = Emotion(emotion_id=emotion_id, user_id=user_id)
        db.session.add(new_emotion)
        db.session.commit()
        return success_response(new_emotion.serialize(), 201)

    @app.route("/api/emotions/<int:emotion_id>/", methods=["DELETE"])
    def delete_emotion(emotion_id):
        emotion = Emotion.query.filter_by(id=emotion_id).first()
        if emotion is None:
            return failure_response("emotion not found")
        db.session.delete(emotion)
        db.session.commit()
        return success_response(emotion.serialize())

    @app.route("/api/emotions/<int:emotion_id>/", methods=["PUT"])
    def update_emotion(emotion_id):
        emotion = Emotion.query.filter_by(id=emotion_id).first()
        if emotion is None:
            return failure_response("Emotion not found")
        body = json.loads(request.data)
        status = body.get("status")
        emotion.emotion_id = emotion_service.classify_status(status)
        db.session.commit()
        return success_response(emotion.serialize())

    @app.route("/api/users/")
    def get_users():
        users = [u.serialize() for u in User.query.all()]
        return success_response(users)

    @app.route("/api/users/<int:user_id>/")
    def get_user(user_id):
        user = User.query.filter_by(id=user_id).first()
        if user is None:
            return failure_response("User not found")
        return success_response(user.serialize())

    @app.route("/api/users/", methods=["POST"])
    def create_user():
        body = json.loads(request.data)
        username = body.get("username")
        name = body.get("name")
        if not username:
            return failure_response("Username not provided")
        if not name:
            return failure_response("Name not provided")

        new_user = User(username=username, name=name)
        db.session.add(new_user)
        db.session.commit()
        return success_response(new_user.serialize(), 201)

    @app.route("/api/users/<int:user_id>/", methods=["DELETE"])
    def delete_user(user_id):
        user = User.query.filter_by(id=user_id).first()
        if user is None:
            return failure_response("User not found")
        db.session.delete(user)
        db.session.commit()
        return success_response(user.serialize())

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
