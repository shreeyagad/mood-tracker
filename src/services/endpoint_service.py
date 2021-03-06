import asyncio
import json

from okta_jwt_verifier import JWTVerifier


loop = asyncio.get_event_loop()


def is_access_token_valid(token, issuer, client_id):
    jwt_verifier = JWTVerifier(issuer, client_id, 'api://default')
    try:
        loop.run_until_complete(jwt_verifier.verify_access_token(token))
        return True
    except Exception:
        return False


def is_id_token_valid(token, issuer, client_id, nonce):
    jwt_verifier = JWTVerifier(issuer, client_id, 'api://default')
    try:
        loop.run_until_complete(jwt_verifier.verify_id_token(token, nonce=nonce))
        return True
    except Exception:
        return False


def load_config(fname='src/client_secrets.json'):
    config = None
    with open(fname) as f:
        config = json.load(f)
    return config


def success_response(data, code=200):
    return (json.dumps({"success": True, "data": data}), code)


def failure_response(message, code=404):
    return (json.dumps({"success": False, "error": message}), code)

    

config = load_config()
