# [Mood Tracker](https://mood-tracker-sg.herokuapp.com/)
A web application that uses an RNN emotion classifier and data visualizations (courtesy of nivo) to analyze your mood over time.

## Emotion Classification
The model is a recurrent neural network (RNN) with a linear layer added on top to serve as the classifier. Before data is fed into the model, it is tokenized, and each token is mapped to a spaCy word embedding. The data used for training, validation, and testing consist of ~10,000 tweets from Twitter, with a roughly equal label distribution across each emotion.

## Online Training
Batch training provides every user with a copy of the base model, and the application uses online training to customize the model to each user. 

When a user first signs up, they start with the base model. After inputting a status, the user has an option to agree or disagree with the model's prediction. If they disagree, they are prompted to enter the correct emotion. 

The model is updated with the ultimately correct label, and after the user logs out, the new model is uploaded to an AWS S3 bucket and overwrites the user's old model. The application will download this new model when the user starts a new session.

(The models uploaded to the AWS S3 bucket do not contain any plaintext user information and require Okta credentials to access.)

## User authentication
Okta, the identity and access management company, is used to faciliate the user account system. When the user chooses to sign up/logs in, requests to the SQLAlchemy database and AWS S3 buckets are made using the user's Okta credentials. When the user continues as a guest, manually created guest credentials are used instead.
