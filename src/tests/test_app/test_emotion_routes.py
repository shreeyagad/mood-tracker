import json 

test_joy_status = "Today was a great day! I got coffee from my favorite cafe on campus, Gimme Coffee, and then I met some friends for lunch at Terrace."

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
                "date": "2021-09-15"
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
                "date": "2021-09-15"
            }
        }
        assert res.status_code == 200
        assert expected == json.loads(res.data)

