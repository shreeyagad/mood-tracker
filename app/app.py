import os
import logging
from flask_oidc import OpenIDConnect
from flask import Flask, json, g, request
import requests
from flask_cors import CORS
print("GETCWD!!!!!!!!!", os.getcwd())
import sys
# print("PATH!!!!!!!!!!!", sys.path)
# sys.path.append('mood-tracker/app')
print("PATH!!!!!!!!!!!", sys.path)
import app.db as db
from db import db, Emotion, EmotionData
from app.services import emotion_service, endpoint_service
from app.services.endpoint_service import (
    is_access_token_valid, 
    is_id_token_valid, 
    config, 
    success_response, 
    failure_response,
)

app = Flask(__name__)
db_filename = "mood-tracker.db"

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///%s" % db_filename
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True
app.config['SECRET_KEY'] = '7600ee68363968b4d96f132f'
app.config.update({
'OIDC_CLIENT_SECRETS': 'client_secrets.json',
'OIDC_RESOURCE_SERVER_ONLY': True
})

db.init_app(app)
with app.app_context():
    db.create_all()

oidc = OpenIDConnect(app)
CORS(app)

############################ start routes ############################


# @app.route("/emotions/")
# @oidc.accept_token(True)
# def get_emotions():
#     user_id = g.oidc_token_info['sub']
#     emotions = Emotion.get_all(user_id=user_id)
#     return success_response([e.serialize() for e in emotions])

# @app.route("/emotions/<int:emotion_id>/")
# @oidc.accept_token(True)
# def get_emotion(emotion_id):
#     user_id = g.oidc_token_info['sub']
#     emotion = Emotion.get_by_emotion_id(emotion_id=emotion_id, user_id=user_id) 
#     if emotion is None:
#         return failure_response("Emotion not found")
#     return success_response(emotion.serialize())


# @app.route("/emotions/<date>/")
# @oidc.accept_token(True)
# def get_emotions_by_date(date):
#     user_id = g.oidc_token_info['sub']
#     emotions = Emotion.get_by_date(date=date, user_id=user_id) 
#     if emotions is None:
#         return failure_response("Emotion not found")
#     return success_response([e.serialize() for e in emotions])

@app.route("/emotions/<int:year>/<int:month>/<int:day>/")
@oidc.accept_token(True)
def get_emotions_by_date(year, month, day):
    user_id = g.oidc_token_info['sub']
    emotions = Emotion.get_by_date(year=year, month=month, day=day, user_id=user_id) 
    if emotions is None:
        return failure_response("Emotion not found")
    return success_response([e.serialize() for e in emotions])

@app.route("/emotions/<int:year>/<int:month>/")
@oidc.accept_token(True)
def get_emotions_by_yr_mo(year, month):
    user_id = g.oidc_token_info['sub']
    emotions = Emotion.get_by_month_and_year(year=year, month=month, user_id=user_id) 
    if emotions is None:
        return failure_response("Emotion not found")
    return success_response([e.serialize() for e in emotions])

@app.route("/emotions/<int:year>/")
@oidc.accept_token(True)
def get_emotions_by_yr(year):
    user_id = g.oidc_token_info['sub']
    emotions = Emotion.get_by_year(year=year, user_id=user_id) 
    if emotions is None:
        return failure_response("Emotion not found")
    return success_response([e.serialize() for e in emotions])


@app.route("/emotions/", methods=["POST"])
@oidc.accept_token(True)
def create_emotion():
    body = json.loads(request.data)
    status = body.get("status")
    if not status:
        return failure_response("Status not provided")
    user_id = g.oidc_token_info['sub']
    emotion_id, emotion_data = emotion_service.classify_status(status)
    new_emotion = Emotion(
        status=status, 
        emotion_id=emotion_id, 
        user_id=user_id)
    db.session.add(new_emotion)
    db.session.commit()
    new_emotion_data = EmotionData(
        emotion_id=new_emotion.id,
        emotion_data=emotion_data
    )
    db.session.add(new_emotion_data)
    db.session.commit()
    return success_response(new_emotion.serialize(), 201)


@app.route("/emotions/<int:emotion_id>/", methods=["DELETE"])
@oidc.accept_token(True)
def delete_emotion(emotion_id):
    user_id = g.oidc_token_info['sub']
    emotion = Emotion.get_by_emotion_id(emotion_id, user_id)
    if emotion is None:
        return failure_response("emotion not found")
    db.session.delete(emotion)
    db.session.commit()
    return success_response(emotion.serialize())


@app.route("/emotions/<int:emotion_id>/", methods=["PUT"])
@oidc.accept_token(True)
def update_emotion(emotion_id):
    user_id = g.oidc_token_info['sub']
    emotion = Emotion.get_by_emotion_id(emotion_id, user_id)
    if emotion is None:
        return failure_response("Emotion not found")
    body = json.loads(request.data)
    status = body.get("status")
    emotion.emotion_id = emotion_service.classify_status(status)
    db.session.commit()
    return success_response(emotion.serialize())

@app.route("/user/")
@oidc.accept_token(True)
def get_user_info():
    # will be easier with Google Authentication
    return success_response(g.oidc_token_info['sub'])


########################### end of routes ###########################
