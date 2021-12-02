import en_core_web_md
import torch
import torch.optim as optim
import os
from src.services.rnn import RNN
# from rnn import RNN
import boto3
import json
import pickle
import hashlib

idx_to_emotion = {
    0: "Anger",
    1: "Fear",
    2: "Joy",
    3: "Love",
    4: "Sadness",
    5: "Surprise",
}
emotion_to_idx = {v: k for (k, v) in idx_to_emotion.items()}

nlp = en_core_web_md.load()
model = RNN(input_size=300, h=100, num_layers=1, output_dim=len(idx_to_emotion), dropout=0.1)

# Debugging root directory issues
# print(os.getcwd())
# path_parent = os.path.dirname(os.getcwd())
# os.chdir(path_parent)
# print(os.getcwd())

# Authentication

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

s3 = boto3.client(
    's3',
    region_name='us-east-1',
    aws_access_key_id=creds['AccessKeyId'],
    aws_secret_access_key=creds['SecretKey'],
    aws_session_token=creds['SessionToken'],
)

bucket_name = 'mood-tracker-models'

def pull_model_from_aws(user_id):
    try:
        h_user_id = hashlib.md5(bytes(user_id, 'utf-8')).hexdigest()
        s3.download_file(bucket_name, f'model_{h_user_id}.pth', 'rnn_fixed.pth')
        model.load_state_dict(torch.load('rnn_fixed.pth'))
        return "Model downloaded successfully"
    except BaseException as err:
        return str(err)

def status_preprocessor(status):
    word_embeddings = []
    doc = nlp(status)
    num_words = len(status.split(" "))
    for w in range(num_words):
        word_embeddings.append(doc[w].vector)
    return word_embeddings

def classify_status(status):
    vec_in = status_preprocessor(status)
    lengths = torch.Tensor([len(vec_in)])
    
    model_output = model(torch.Tensor(vec_in).unsqueeze(0), lengths).cpu()
    last_h = model_output[:,(len(vec_in)-1),:]

    output_loss = model.softmax(model.W(last_h))
    _, predicted = torch.max(output_loss, dim=1)

    predicted = int(predicted.squeeze())
    return predicted, output_loss.squeeze()

def upload_status(user_id, aws_id, status, emotion_idx):
    h_user_id = hashlib.md5(bytes(user_id, 'utf-8')).hexdigest()
    bucket_name = "mood-tracker-statuses"

    # save status to file
    status_json = {"emotion_idx": emotion_idx, "status": status}
    status_file_name = f"{str(aws_id)}.json"
    with open(status_file_name, "w") as status_file:
        json.dump(status_json, status_file)
    
    # upload file to bucket
    s3.upload_file(status_file_name, bucket_name, f"{h_user_id}/{status_file_name}")

    # delete file
    os.remove(status_file_name)

def delete_status(user_id, aws_id):
    h_user_id = hashlib.md5(bytes(user_id, 'utf-8')).hexdigest()
    bucket_name = "mood-tracker-statuses"
    key = f"{h_user_id}/{str(aws_id)}.txt"
    
    # delete status from bucket
    s3.delete_object(
        Bucket=bucket_name,
        Key=key,
    )

