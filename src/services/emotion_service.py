import spacy
import en_core_web_md
import torch
from services.rnn import RNN

idx_to_emotion = {
    0: "anger",
    1: "fear",
    2: "joy",
    3: "love",
    4: "sadness",
    5: "surprise",
}
nlp = en_core_web_md.load()
model = RNN(300, 100, output_dim=len(idx_to_emotion), num_layers=3, dropout=0.1)
model.load_model("services/rnn_fixed.pth")

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
    temp, predicted = torch.max(output_loss, 1)
    return int(predicted.squeeze())

