import en_core_web_md
import torch
import torch.optim as optim
import os
import src.services.rnn as rnn
import boto3
import json
import pickle
import hashlib
import botocore

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
model = rnn.RNN(input_size=300, h=100, num_layers=1, output_dim=len(idx_to_emotion), dropout=0.1)

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
    h_user_id = hashlib.md5(bytes(user_id, 'utf-8')).hexdigest()
    try:
        s3.download_file(bucket_name, f'model_{h_user_id}.pth', 'rnn_fixed.pth')
    except botocore.exceptions.ClientError: # download base model if error
        print("downloading BASE MODEL")
        s3.download_file(bucket_name, 'base_emotion_model.pth', 'rnn_fixed.pth')
    model.load_state_dict(torch.load('rnn_fixed.pth'))
    return "Model downloaded successfully"


def push_model_to_aws(user_id):
    h_user_id = hashlib.md5(bytes(user_id, 'utf-8')).hexdigest()
    s3.upload_file('rnn_fixed.pth', bucket_name, f"model_{h_user_id}.pth")
    return "Model uploaded successfully"


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

def upload_status(user_id, aws_id, status, emotion_name):
    h_user_id = hashlib.md5(bytes(user_id, 'utf-8')).hexdigest()
    bucket_name = "mood-tracker-statuses"

    # save status to file
    status_json = {"emotion": emotion_name, "status": status}
    status_file_name = f"{str(aws_id)}.json"
    with open(status_file_name, "w") as status_file:
        json.dump(status_json, status_file)
    
    # upload file to bucket
    s3.upload_file(status_file_name, bucket_name, f"{h_user_id}/{status_file_name}")

    # delete file
    os.remove(status_file_name)

    # update the model
    print("calling update model")
    update_model(status, emotion_name)


def update_model(status, emotion_name):
    processed_status = status_preprocessor(status)
    training_data = [(processed_status, emotion_to_idx[emotion_name])]
    online_rnn_train_loader, _ = rnn.get_data_loaders(training_data, [], batch_size=1) 
    online_optimizer = optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
    rnn.train_epoch_rnn(model, online_rnn_train_loader, online_optimizer)
    model.save_model("rnn_fixed.pth")

def delete_status(user_id, aws_id):
    h_user_id = hashlib.md5(bytes(user_id, 'utf-8')).hexdigest()
    bucket_name = "mood-tracker-statuses"
    key = f"{h_user_id}/{str(aws_id)}.json"
    
    # delete status from bucket
    s3.delete_object(
        Bucket=bucket_name,
        Key=key,
    )

