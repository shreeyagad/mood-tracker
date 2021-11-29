from flask import Flask, json, g, request
from flask_oidc import OpenIDConnect
from flask_cors import CORS
from src.db import db, Emotion, EmotionData
from src.services import emotion_service
from src.services.endpoint_service import (
    success_response, 
    failure_response,
)
import os

app = Flask(
    __name__, 
    static_folder='views/app/build',
    static_url_path='',
)
db_filename = "mood-tracker.db"

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///%s" % db_filename
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True
app.config['SECRET_KEY'] = os.environ.get('FLASK_APP_SECRET_KEY', None)
app.config.update({
'OIDC_CLIENT_SECRETS': 'src/client_secrets.json',
'OIDC_RESOURCE_SERVER_ONLY': True
})

db.init_app(app)
with app.app_context():
    db.create_all()

oidc = OpenIDConnect(app)
CORS(app)

############################ start routes ############################

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


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

@app.route("/model/")
@oidc.accept_token(True)
def get_model():
    resp = emotion_service.pull_model_from_aws(g.oidc_token_info['sub'])
    return success_response(resp)


@app.route("/update_model/")
@oidc.accept_token(True)
def get_model():
    user_id = g.oidc_token_info['sub']
    body = json.loads(request.data)
    status = body.get("status")
    resp = emotion_service.upload_status(user_id, status)
    return success_response(resp)


########################### end of routes ###########################
