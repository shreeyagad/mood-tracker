import en_core_web_md
import torch
import torch.optim as optim
import os
import src.services.rnn as rnn
# import rnn
import boto3
import json
import pickle
import hashlib
import botocore
import collections
import numpy as np

idx_to_emotion = {
    0: "Anger",
    1: "Fear",
    2: "Joy",
    3: "Love",
    4: "Sadness",
    5: "Surprise",
}
emotion_to_idx = {v: k for (k, v) in idx_to_emotion.items()}

idx_to_month = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
}
month_to_idx = {v: k for (k, v) in idx_to_month.items()}

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
    print("user_id!", h_user_id, user_id)
    if not os.path.exists('src/services/rnn_fixed.pth'):
        try:
            print("downloaded user's model")
            s3.download_file(bucket_name, f'model_{h_user_id}.pth', 'src/services/rnn_fixed.pth')
        except botocore.exceptions.ClientError: # download base model if error
            print("downloading base model because user's model DNE")
            s3.download_file(bucket_name, 'base_model_v1.pth', 'src/services/rnn_fixed.pth')
    model.load_model('src/services/rnn_fixed.pth')
    return "Model downloaded successfully"


def push_model_to_aws(user_id):
    h_user_id = hashlib.md5(bytes(user_id, 'utf-8')).hexdigest()
    s3.upload_file('src/services/rnn_fixed.pth', bucket_name, f"model_{h_user_id}.pth")
    os.remove('src/services/rnn_fixed.pth')
    return "Model uploaded successfully"


def status_preprocessor(status):
    word_embeddings = []
    doc = nlp(status)
    num_words = len(status.split(" "))
    for w in range(num_words):
        word_embeddings.append(doc[w].vector)
    return word_embeddings

def classify_status(status):
    model.load_model('src/services/rnn_fixed.pth')
    vec_in = status_preprocessor(status)
    lengths = torch.Tensor([len(vec_in)])
    
    model_output = model(torch.Tensor(vec_in).unsqueeze(0), lengths).cpu()
    last_h = model_output[:,(len(vec_in)-1),:]

    output_loss = model.softmax(model.W(last_h))
    _, predicted = torch.max(output_loss, dim=1)

    predicted = int(predicted.squeeze())
    return predicted, output_loss.squeeze()

def upload_status(user_id, aws_id, status, emotion_name):
    print("uploading status")
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
    model.load_model('src/services/rnn_fixed.pth')
    print(f"updating model with status: {status} and emotion: {emotion_name}")
    processed_status = status_preprocessor(status)
    training_data = [(processed_status, emotion_to_idx[emotion_name])] * 128
    online_rnn_train_loader, _ = rnn.get_data_loaders(training_data, [], batch_size=16) 
    online_optimizer = optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
    print("start training the model")
    rnn.train_epoch_rnn(model, online_rnn_train_loader, online_optimizer)
    model.save_model("src/services/rnn_fixed.pth")
    model.eval()
    print("done training the model")

def update_emotion(emotion, emotion_name):
    emotion_idx = emotion_to_idx[emotion_name]
    emotion.emotion_id = emotion_idx
    new_emotion_data_tensor = torch.zeros(len(idx_to_emotion))
    new_emotion_data_tensor[emotion_idx] = 1
    return new_emotion_data_tensor

def delete_status(user_id, aws_id):
    h_user_id = hashlib.md5(bytes(user_id, 'utf-8')).hexdigest()
    bucket_name = "mood-tracker-statuses"
    key = f"{h_user_id}/{str(aws_id)}.json"
    
    # delete status from bucket
    s3.delete_object(
        Bucket=bucket_name,
        Key=key,
    )

def organize_radar_data(emotions, year_month_dict):
    radar_data = {k: collections.defaultdict(float) for k in emotion_to_idx.keys()}
    years = ["2019", "2020", "2021"]
    year_dict = {y: {m: [] for m in year_month_dict[y]} for y in years}
    print('year_dict', year_dict)
    for emotion in emotions:
        print(emotion)
        d = emotion["emotion_data"]["Data"]
        emotion_year, emotion_month = emotion["year"], idx_to_month[int(emotion["month"])]
        year_dict[emotion_year][emotion_month].append(d)
    for year, months in year_dict.items():
        for month, month_data in months.items():
            if len(month_data) == 0:
                averaged_data = np.zeros(6)
            else:
                averaged_data = np.average(np.array(month_data), axis=0)
            for i, val in enumerate(averaged_data):
                key = month + " " + year
                radar_data[idx_to_emotion[i]][key] = val
    print("radar_data", radar_data)
    final_data = []
    for emotion_key, emotion_vals in radar_data.items():
        temp_dict = {}
        temp_dict["emotion"] = emotion_key
        for k, v in emotion_vals.items():
            temp_dict[k] = v
        final_data.append(temp_dict)
    
    print("final_data", final_data)
    return final_data 

def test_organize_radar_data():
    emotions = [{
        "emotion_data": {"Data": np.array([0.5, 0.25, 0.25, 0, 0, 0])},
        "month": "12"
    },{
        "emotion_data": {"Data": np.array([0.25, 0.5, 0, 0.25, 0, 0])},
        "month": "11"
    },
    ]
    print(organize_radar_data(emotions))

# test_organize_radar_data()
