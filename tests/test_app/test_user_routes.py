import json 

def test_get_users(app):
    with app.test_client() as client:
        res = client.get("/api/users/")
        assert res.status_code == 200
        expected = {"success": True, "data": []}
        assert expected == json.loads(res.data) 

def test_create_user(app):
    with app.test_client() as client:
        res = client.post(
            '/api/users/',
            data=json.dumps(dict(
                username="johnsmith",
                name="John Smith"
            )),
            content_type='application/json',
        )
        expected = {
            "success": True, 
            "data": {
                "id": 1, 
                "username": "johnsmith",
                "name": "John Smith", 
                "emotions": []
            }
        }
        assert res.status_code == 201
        assert expected == json.loads(res.data)

def test_delete_user(app):
    with app.test_client() as client:
        client.post(
            '/api/users/',
            data=json.dumps(dict(
                username="johnsmith",
                name="John Smith"
            )),
            content_type='application/json',
        )
        res = client.delete(
            '/api/users/1/',
            content_type='application/json',
        )
        assert res.status_code == 200

