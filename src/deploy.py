import torch
import torch.nn as nn
from transformers import RobertaTokenizer, RobertaModel
import pandas as pd

class HybridModel(nn.Module):
    def __init__(self,
                 rnn_input_size,
                 rnn_hidden_size,
                 rnn_layers,
                 fnn_input_size,
                 fnn_hidden_size,
                 final_hidden_size,
                 codebert_model_name='microsoft/codebert-base'):
        super(HybridModel, self).__init__()
        
        # RNN branch for time series data
        self.rnn = nn.LSTM(input_size=rnn_input_size,
                           hidden_size=rnn_hidden_size,
                           num_layers=rnn_layers,
                           batch_first=True)

        # FNN branch for CSV numeric data
        self.fnn = nn.Sequential(
            nn.Linear(fnn_input_size, fnn_hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(fnn_hidden_size, fnn_hidden_size),
            nn.ReLU()
        )

        # CodeBERT branch for contract text
        self.codebert = RobertaModel.from_pretrained(codebert_model_name)
        # For a final or partial freeze, do the same unfreezing logic as in training, if needed
        for param in self.codebert.parameters():
            param.requires_grad = False

        self.codebert_fc = nn.Linear(self.codebert.config.hidden_size, fnn_hidden_size)

        # Final FC combining features from RNN, FNN, CodeBERT
        total_features = rnn_hidden_size + 2 * fnn_hidden_size
        self.final_fc = nn.Sequential(
            nn.Linear(total_features, final_hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(final_hidden_size, 1)
        )

    def forward(self, time_series, csv_data, input_ids, attention_mask):
        # RNN
        rnn_out, (hn, _) = self.rnn(time_series)
        rnn_feature = hn[-1]

        # FNN
        csv_feature = self.fnn(csv_data)

        # CodeBERT
        codebert_out = self.codebert(input_ids=input_ids, attention_mask=attention_mask)
        contract_emb = codebert_out.last_hidden_state[:, 0, :]
        contract_feature = self.codebert_fc(contract_emb)

        # Concatenate
        combined = torch.cat([rnn_feature, csv_feature, contract_feature], dim=1)
        logits = self.final_fc(combined)
        return logits

def load_model(weights_path="best_hybrid_model.pt"):
    # Construct model with same hyperparameters used in training
    model = HybridModel(
        rnn_input_size=4,
        rnn_hidden_size=64,
        rnn_layers=2,
        fnn_input_size=2,
        fnn_hidden_size=64,
        final_hidden_size=32
    )
    # Load weights
    state_dict = torch.load(weights_path, map_location=torch.device("cpu"))
    model.load_state_dict(state_dict)
    model.eval()
    return model

def run_inference(model, tokenizer, time_series, csv_data, contract_text):
    # Convert to PyTorch tensors (assuming batch_size=1 for demo)
    time_series_tensor = torch.tensor(time_series, dtype=torch.float).unsqueeze(0)  # shape (1, seq_len, 4)
    csv_tensor = torch.tensor(csv_data, dtype=torch.float).unsqueeze(0)            # shape (1, 2)
    
    encoded = tokenizer.encode_plus(
        contract_text,
        max_length=512,
        padding='max_length',
        truncation=True,
        return_tensors='pt'
    )
    input_ids = encoded["input_ids"]
    attention_mask = encoded["attention_mask"]

    # Forward pass
    with torch.no_grad():
        logits = model(time_series_tensor, csv_tensor, input_ids, attention_mask)
        probs = torch.sigmoid(logits)  # For binary classification
    return probs.item()

if __name__ == "__main__":
    # Example usage:
    tokenizer = RobertaTokenizer.from_pretrained("microsoft/codebert-base")
    
    model = load_model("best_hybrid_model.pt")

    # Suppose we have a single sample:
    # time series shape: (seq_len=10, 4 features)
    time_series_example = [
        [1, 100000, 10, 5],
        [2, 150000, 12, 7],
        # ...
        # total 10 rows
    ] + [[0,0,0,0]]*8  # just a dummy example if you have fewer rows

    # CSV numeric data: [price_float, volume]
    csv_example = [0.1, -0.4]  # normalized

    # Contract text
    contract_text_example = "contract code snippet ..."

    prediction = run_inference(model, tokenizer, time_series_example, csv_example, contract_text_example)
    print(f"Scam Probability: {prediction:.4f}")
