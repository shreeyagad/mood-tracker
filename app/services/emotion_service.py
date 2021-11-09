import spacy
import en_core_web_md
import torch
from services.rnn import RNN

idx_to_emotion = {
    0: "Anger",
    1: "Fear",
    2: "Joy",
    3: "Love",
    4: "Sadness",
    5: "Surprise",
}
nlp = en_core_web_md.load()
model = RNN(input_size=300, h=100, num_layers=1, output_dim=len(idx_to_emotion), dropout=0.1)
import os
print(os.getcwd())
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
    _, predicted = torch.max(output_loss, dim=1)
    predicted = int(predicted.squeeze())
    return predicted, output_loss.squeeze()

