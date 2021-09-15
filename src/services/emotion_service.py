from gensim import downloader
import torch
from services.rnn import RNN

emotion_to_idx = {
    "anger": 0,
    "fear": 1,
    "joy": 2,
    "love": 3,
    "sadness": 4,
    "surprise": 5,
}
# glove_vectors = downloader.load('glove-twitter-200')
model = RNN(200, 100, len(emotion_to_idx))
# model.load_model("rnn_fixed.pth")


def status_preprocessor(status):
    word_embeddings = []
    for word in status:
        try:
            word_embeddings.append(glove_vectors[word])
        except:
            word_embeddings.append(glove_vectors["the"])
    return word_embeddings

def classify_status(status):
    # vec_in = status_preprocessor(status)
    # model_output = model(torch.Tensor(vec_in).unsqueeze(0)).cpu().squeeze(0)
    # predicted = int(torch.argmax(model_output))
    # return predicted
    return len(status)

