import torch
import torch.nn as nn
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

class RNN(nn.Module):
	def __init__(self, input_size, h, num_layers, output_dim, dropout): # Add relevant parameters
		super(RNN, self).__init__()
		self.rnn = nn.RNN(input_size=input_size, hidden_size=h, num_layers=num_layers, nonlinearity='relu',
		                  batch_first=True, dropout=dropout)
		self.input_size = input_size
		self.h = h
		self.W = nn.Linear(h, output_dim)
		self.output_dim = output_dim

		self.logSoftmax = nn.LogSoftmax(dim=1)
		self.softmax = nn.Softmax(dim=1)
		self.loss = nn.NLLLoss()
		
	def compute_Loss(self, predictions, gold_label):
		loss = self.loss(predictions, gold_label)	
		return loss
	
	def forward(self, inputs, lengths):
		packed_inputs = pack_padded_sequence(inputs, lengths, batch_first=True, 
		                                     enforce_sorted=False)
		packed_out, _ = self.rnn(packed_inputs)
  
		unpacked_out, _ = pad_packed_sequence(packed_out, batch_first=True)
    
		return unpacked_out

	def load_model(self, save_path):
		self.load_state_dict(torch.load(save_path))
	
	def save_model(self, save_path):
		torch.save(self.state_dict(), save_path)