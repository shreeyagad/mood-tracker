import boto3
import uuid
from urllib.parse import unquote_plus
import os

account_id = '208234231741'
identity_pool_id = 'us-east-1:a92f0191-f020-4ee5-ac46-119ebc9fe906'
client = boto3.client('cognito-identity','us-east-1')
identity_resp = client.get_id(
    AccountId=account_id,
    IdentityPoolId=identity_pool_id,
)
resp = client.get_credentials_for_identity(
    IdentityId=identity_resp['IdentityId'],
)
creds = resp['Credentials']

s3_client = boto3.client(
    's3',
    region_name='us-east-1',
    aws_access_key_id=creds['AccessKeyId'],
    aws_secret_access_key=creds['SecretKey'],
    aws_session_token=creds['SessionToken'],
)


"""
This function is triggered when a status is uploaded to a user's
folder in mood-tracker-statuses. It checks whether the total number
of statuses >= 25. If so, it retrains the model on the new 25 statuses.

Once it is done retraining, it uploaded the new model to mood-tracker-models.
"""
def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = unquote_plus(record['s3']['object']['key'])
        user_id = key.split('/')[0]
        user_statuses = s3_client.list_objects_v2(Bucket=bucket, Prefix=user_id)['Contents'][1:]
        if len(user_statuses) >= 25:
            for status in user_statuses:
                key = status['Key']
                file_name = key.split('/')[1]
                # temporarily download each status
                download_path = '/tmp/{}/{}{}'.format(user_id, uuid.uuid4(), file_name)
                s3_client.download_file(bucket, key, download_path)


def test():
    json = {
        "Records": [
            {
                "s3": {
                    "bucket": {
                        "name": "mood-tracker-statuses"
                    },
                    "object": {
                        "key": "561c10dcf079be2f11e67b030893d876/1.json"
                    }
                }
            }
        ]
    }
    print(lambda_handler(json, None))

test()
