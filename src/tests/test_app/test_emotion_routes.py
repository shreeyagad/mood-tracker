import json 
import datetime
from datetime import date

test_joy_status = "Today was a great day! I got coffee from my favorite cafe on campus, Gimme Coffee, and then I met some friends for lunch at Terrace."
test_sadness_status = "Today was a horrible day! I got coffee from my favorite cafe on campus, and then I spilled it all over my backpack."

def test_get_emotions(app):
    with app.test_client() as client:
        res = client.get("/api/emotions/")
        expected = {"success": True, "data": []}
        assert res.status_code == 200
        assert expected == json.loads(res.data) 

def test_create_emotion(app):
    with app.test_client() as client:
        res = client.post(
            '/api/emotions/',
            data=json.dumps(dict(
                status=test_joy_status,
                user_id=1
            )),
            content_type='application/json',
        )
        expected = {
            "success": True, 
            "data": {
                "id": 1, 
                "emotion_id": 2,
                "emotion": "joy", 
                "user_id": 1, 
                "date": str(date.today())
            }
        }
        assert res.status_code == 201
        assert expected == json.loads(res.data)


def test_delete_emotion(app):
    with app.test_client() as client:
        client.post(
            '/api/emotions/',
            data=json.dumps(dict(
                status=test_joy_status,
                user_id=1
            )),
            content_type='application/json',
        )
        res = client.delete(
            '/api/emotions/1/',
            content_type='application/json',
        )
        expected = {
            "success": True, 
            "data": {
                "id": 1, 
                "emotion_id": 2, 
                "emotion": "joy",
                "user_id": 1, 
                "date": str(date.today())
            }
        }
        assert res.status_code == 200
        assert expected == json.loads(res.data)

def test_update_emotion(app):
    with app.test_client() as client:
        client.post(
            '/api/emotions/',
            data=json.dumps(dict(
                status=test_joy_status,
                user_id=1
            )),
            content_type='application/json',
        )
        res = client.put(
            '/api/emotions/1/',
            data=json.dumps(dict(
                status=test_sadness_status,
                user_id=1
            )),
            content_type='application/json',
        )
        expected = {
            "success": True, 
            "data": {
                "id": 1, 
                "emotion_id": 4, 
                "emotion": "sadness",
                "user_id": 1, 
                "date": str(date.today())
            }
        }
        assert res.status_code == 200
        assert expected == json.loads(res.data)

