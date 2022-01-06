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


@app.route("/emotions/<int:year>/<int:month>/<int:day>/<int:offset>/")
@oidc.accept_token(True)
def get_emotions_by_date(year, month, day, offset): # timezone offset in sec
    user_id = g.oidc_token_info['sub']
    emotions = Emotion.get_by_date(
        year=year, 
        month=month, 
        day=day, 
        offset=offset,
        user_id=user_id)
    if emotions is None:
        return failure_response("Emotion not found")
    return success_response([e.serialize(offset) for e in emotions])


@app.route("/emotions/<int:year>/<int:month>/<int:offset>/")
@oidc.accept_token(True)
def get_emotions_by_yr_mo(year, month, offset):
    user_id = g.oidc_token_info['sub']
    emotions = Emotion.get_by_month_and_year(year=year, month=month, offset=offset, user_id=user_id) 
    if emotions is None:
        return failure_response("Emotion not found")
    return success_response([e.serialize(offset) for e in emotions])


@app.route("/emotions/<int:year>/<int:offset>/")
@oidc.accept_token(True)
def get_emotions_by_yr(year, offset):
    user_id = g.oidc_token_info['sub']
    emotions = Emotion.get_by_year(year=year, offset=offset, user_id=user_id) 
    if emotions is None:
        return failure_response("Emotion not found")
    return success_response([e.serialize(offset) for e in emotions])


@app.route("/emotions/<int:offset>/")
@oidc.accept_token(True)
def get_emotions(offset):
    user_id = g.oidc_token_info['sub']
    emotions = Emotion.get_all(user_id=user_id)
    return success_response([e.serialize(offset) for e in emotions])


@app.route("/emotions/<int:offset>/", methods=["POST"])
@oidc.accept_token(True)
def create_emotion(offset):
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
    return success_response(new_emotion.serialize(offset), 201)


@app.route("/emotions/<int:emotion_id>/<int:offset>/", methods=["DELETE"])
@oidc.accept_token(True)
def delete_emotion(emotion_id, offset):
    user_id = g.oidc_token_info['sub']
    emotion = Emotion.get_by_emotion_id(emotion_id, user_id)
    if emotion is None:
        return failure_response("emotion not found")
    emotion_service.delete_status(user_id, emotion.aws_id)
    db.session.delete(emotion)
    db.session.commit()

    return success_response(emotion.serialize(offset))


@app.route("/emotions/<int:offset>/", methods=["DELETE"])
@oidc.accept_token(True)
def delete_all_emotions(offset):
    user_id = g.oidc_token_info['sub']
    emotions = Emotion.get_all(user_id)
    for emotion in emotions:
        db.session.delete(emotion)
        db.session.commit()
    return success_response([emotion.serialize(offset) for emotion in emotions])


@app.route("/emotions/<int:emotion_id>/<int:offset>/", methods=["PUT"])
@oidc.accept_token(True)
def update_emotion(emotion_id, offset):
    user_id = g.oidc_token_info['sub']
    emotion = Emotion.get_by_emotion_id(emotion_id, user_id)
    if emotion is None:
        return failure_response("Emotion not found")
    body = json.loads(request.data)
    new_emotion_data_tensor = emotion_service.update_emotion(
        emotion, 
        body.get("emotion_name")
    )
    new_emotion_data = EmotionData(emotion.id, new_emotion_data_tensor)
    db.session.delete(emotion.emotion_data)
    db.session.commit()
    db.session.add(new_emotion_data)
    db.session.commit()
    return success_response(emotion.serialize(offset))


@app.route("/download_model/")
@oidc.accept_token(True)
def download_model():
    resp = emotion_service.pull_model_from_aws(g.oidc_token_info['sub'])
    if resp == "Model downloaded successfully":
        return success_response(resp)
    else:
        return failure_response(resp)


@app.route("/upload_status/", methods=["POST"])
@oidc.accept_token(True)
def upload_status():
    user_id = g.oidc_token_info['sub']
    body = json.loads(request.data)
    emotion_id = body.get("emotion_id")
    status = body.get("status")
    emotion_name = body.get("emotion_name")
    emotion = Emotion.get_by_emotion_id(emotion_id, user_id)
    if emotion_name is None: # user agreed with the model's prediction
        if emotion is None:
            return failure_response("Emotion not found")
        else:
            emotion_name = emotion_service.idx_to_emotion[emotion.emotion_id]
    emotion_service.upload_status(user_id, emotion.aws_id, status, emotion_name)
    return success_response(status)


@app.route("/generate_radar_data/<int:offset>/", methods=["POST"])
@oidc.accept_token(True)
def generate_radar_data(offset):
    user_id = g.oidc_token_info['sub']
    body = json.loads(request.data)
    emotions = []
    years = ["2020", "2021", "2022"]
    for year in years:
        months = [emotion_service.month_to_idx[m] for m in body.get(year)]
        for month in months:
            emotions_by_month = Emotion.get_by_month_and_year(
                year, month, offset, user_id)
            for e in emotions_by_month:
                emotions.append(e.serialize(offset))
    radar_data = emotion_service.organize_radar_data(emotions, body)
    return success_response(radar_data)


@app.route("/upload_model/")
@oidc.accept_token(True)
def upload_model():
    user_id = g.oidc_token_info['sub']
    resp = emotion_service.push_model_to_aws(user_id)
    if resp == "Model uploaded successfully":
        return success_response(resp)
    else:
        return failure_response(resp)


########################### end of routes ###########################