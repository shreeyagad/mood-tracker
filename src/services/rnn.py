import torch
import torch.nn as nn
from torch.nn.utils.rnn import (
	pad_sequence, 
	pack_padded_sequence, 
	pad_packed_sequence
)
from torch.utils.data import Dataset, DataLoader, SubsetRandomSampler
from tqdm.notebook import tqdm

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
		self.eval()
	
	def save_model(self, save_path):
		torch.save(self.state_dict(), save_path)


class RNNEmotionDataset(Dataset):
    """RNNEmotionDataset is a torch dataset to interact with the emotion data, 
	with the difference being that the emotion data has a different type to 
	fit the specifications of an RNN.

    :param data: The vectorized dataset with input and expected output values
    :type data: List[Tuple[List[torch.Tensor], int]]
    """
    def __init__(self, data):
        self.X = pad_sequence(sequences=[torch.tensor(X) for X, _ in data], 
                              batch_first=True)
        self.y = torch.LongTensor([y for _, y in data])
        self.len = len(data)
        self.lengths = [len(X) for X, _ in data]
    
    def __len__(self):
        """__len__ returns the number of samples in the dataset.
        :returns: number of samples in dataset
        :rtype: int
        """
        return self.len
    
    def __getitem__(self, index):
        """__getitem__ returns the tensor, output pair for a given index

        :param index: index within dataset to return
        :type index: int
        :returns: A tuple (x, y) where x is model input and y is our label
        :rtype: Tuple[torch.Tensor, int]
        """
        t = (self.X[index], self.lengths[index])
        return t, self.y[index]


def get_data_loaders(train, val, batch_size=16):
	dataset = RNNEmotionDataset(train + val)

	# Then, we create a list of indices for all samples in the dataset
	train_indices = [i for i in range(len(train))]
	val_indices = [i for i in range(len(train), len(train) + len(val))]

	# Now we define samplers and loaders for train and val
	train_sampler = SubsetRandomSampler(train_indices)
	train_loader = DataLoader(dataset, batch_size=batch_size, sampler=train_sampler)
	
	val_sampler = SubsetRandomSampler(val_indices)
	val_loader = DataLoader(dataset, batch_size=batch_size, sampler=val_sampler)

	return train_loader, val_loader


def train_epoch_rnn(model, train_loader, optimizer):
	# Lambda to switch to GPU if available
	get_device = lambda : "cuda:0" if torch.cuda.is_available() else "cpu"

	model.train()
	total = 0
	loss = 0
	correct = 0
	for (input_batch, expected_out) in tqdm(train_loader, leave=False, 
											desc="Training Batches"):
		batch_data, lengths = input_batch
		batch_num = batch_data.size()[0]
		total += batch_num
		output = model(batch_data.to(get_device()), lengths) 

		idx = (lengths-1).unsqueeze(-1).repeat(1, model.h).unsqueeze(1)
		last_h = output.gather(1, idx).squeeze(1)

		output_loss = model.softmax(model.W(last_h))
		_, predicted = torch.max(output_loss, 1)
		correct += (expected_out == predicted.to("cpu")).cpu().numpy().sum()

		loss = model.compute_Loss(output_loss, expected_out.to(get_device()))
		optimizer.zero_grad()

		loss.backward()
		torch.nn.utils.clip_grad_norm_(model.parameters(), 1)
		optimizer.step()
	# Print accuracy
	if total > 0:
		print("Training accuracy: " + str(round(100*correct/total, 2)) + "%")
	else:
		print("No examples")