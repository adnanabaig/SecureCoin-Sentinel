import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import RobertaModel, RobertaTokenizer
import pandas as pd
import json
import os
import certifi
from sklearn.model_selection import train_test_split

# Set SSL certificate environment variable
os.environ['SSL_CERT_FILE'] = certifi.where()

# File paths
TOKENOMICS_CSV = 'rugpullD2.csv'
TIME_SERIES_CSV = 'time_series_data_checkpoint_cleaned.csv'
CONTRACT_JSON = 'ethereum_contracts_filtered.json'

def load_data():
    tokenomics_df = pd.read_csv(TOKENOMICS_CSV)
    
    # Ensure numeric columns are numeric
    tokenomics_df['price_float'] = pd.to_numeric(tokenomics_df['price_float'], errors='coerce')
    tokenomics_df['volume'] = pd.to_numeric(tokenomics_df['volume'], errors='coerce')
    
    # Drop rows with NaN values in tokenomics columns
    tokenomics_df = tokenomics_df.dropna(subset=['price_float', 'volume'])
    
    # Normalize tokenomics numeric columns
    tokenomics_df[['price_float', 'volume']] = (
        tokenomics_df[['price_float', 'volume']] - tokenomics_df[['price_float', 'volume']].mean()
    ) / tokenomics_df[['price_float', 'volume']].std()
    
    time_series_df = pd.read_csv(TIME_SERIES_CSV)
    
    with open(CONTRACT_JSON, 'r') as f:
        contract_data = json.load(f)
    
    return tokenomics_df, time_series_df, contract_data

def extract_contract_text(contract_data, symbol):
    contract_entry = contract_data.get(symbol, {})
    if isinstance(contract_entry, dict):
        contract_text = contract_entry.get('source_code_or_metadata', '')
    else:
        contract_text = ''
    return str(contract_text)  # Ensure it's always a string

class MyDataset(Dataset):
    def __init__(self, tokenomics_df, time_series_df, contract_data):
        self.tokenomics_df = tokenomics_df
        self.time_series_df = time_series_df
        self.contract_data = contract_data
        self.tokenizer = RobertaTokenizer.from_pretrained('microsoft/codebert-base')
    
    def __len__(self):
        return len(self.tokenomics_df)
    
    def __getitem__(self, idx):
        tokenomics_row = self.tokenomics_df.iloc[idx]
        
        # Filter time series data for the symbol and sort by date
        ts_rows = self.time_series_df[self.time_series_df['symbol'] == tokenomics_row['symbol']]
        if ts_rows.empty:
            # Placeholder: sequence length 10, 4 features.
            time_series = torch.zeros((10, 4), dtype=torch.float)
        else:
            ts_rows = ts_rows.sort_values('date')
            # Extract the numeric features: tx_count, total_volume, unique_senders, unique_receivers
            ts_values = ts_rows[['tx_count', 'total_volume', 'unique_senders', 'unique_receivers']].astype(float).values
            seq_length = 10
            current_length = ts_values.shape[0]
            if current_length < seq_length:
                pad = torch.zeros((seq_length - current_length, ts_values.shape[1]), dtype=torch.float)
                time_series = torch.cat([torch.tensor(ts_values, dtype=torch.float), pad], dim=0)
            elif current_length > seq_length:
                time_series = torch.tensor(ts_values[-seq_length:], dtype=torch.float)
            else:
                time_series = torch.tensor(ts_values, dtype=torch.float)
        
        # CSV numeric data from tokenomics (price_float, volume)
        csv_data = tokenomics_row[['price_float', 'volume']].astype(float).values
        csv_data = torch.tensor(csv_data.tolist(), dtype=torch.float)
        
        # Contract text data
        contract_text = extract_contract_text(self.contract_data, tokenomics_row['symbol'])
        if not isinstance(contract_text, str) or contract_text.strip() == "":
            contract_text = "No contract data available"
        
        contract_text_encoded = self.tokenizer.encode_plus(
            contract_text,
            max_length=512,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        input_ids = contract_text_encoded['input_ids'].squeeze(0)
        attention_mask = contract_text_encoded['attention_mask'].squeeze(0)
        
        # Label: assuming 'wasrekt' field is 0 or 1
        label = 1.0 if tokenomics_row['wasrekt'] else 0.0
        label = torch.tensor(label, dtype=torch.float)
        
        return time_series, csv_data, input_ids, attention_mask, label

class HybridModel(nn.Module):
    def __init__(self,
                 rnn_input_size,      # Now 4, since we use 4 time series features.
                 rnn_hidden_size,
                 rnn_layers,
                 fnn_input_size,      # 2 (price_float and volume)
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
        # Freeze CodeBERT weights (you can later unfreeze selected layers)
        for param in self.codebert.parameters():
            param.requires_grad = False
        self.codebert_fc = nn.Linear(self.codebert.config.hidden_size, fnn_hidden_size)
        
        # Final fully connected network combining features from all branches.
        total_features = rnn_hidden_size + 2 * fnn_hidden_size
        self.final_fc = nn.Sequential(
            nn.Linear(total_features, final_hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(final_hidden_size, 1)  # Binary classification output (raw logits)
        )
    
    def forward(self, time_series, csv_data, contract_text_input_ids, contract_text_attention_mask):
        # Time series branch
        rnn_out, (hn, _) = self.rnn(time_series)
        rnn_feature = hn[-1]
        
        # CSV numeric data branch
        csv_feature = self.fnn(csv_data)
        
        # Contract text branch via CodeBERT
        codebert_outputs = self.codebert(input_ids=contract_text_input_ids, 
                                         attention_mask=contract_text_attention_mask)
        contract_embedding = codebert_outputs.last_hidden_state[:, 0, :]
        contract_feature = self.codebert_fc(contract_embedding)
        
        # Concatenate all features and produce final output
        combined_features = torch.cat([rnn_feature, csv_feature, contract_feature], dim=1)
        output = self.final_fc(combined_features)
        return output

def evaluate(model, dataloader, loss_fn, device):
    model.eval()
    total_loss = 0.0
    with torch.no_grad():
        for time_series, csv_data, input_ids, attention_mask, labels in dataloader:
            time_series = time_series.to(device, dtype=torch.float)
            csv_data = csv_data.to(device, dtype=torch.float)
            input_ids = input_ids.to(device)
            attention_mask = attention_mask.to(device)
            labels = labels.to(device, dtype=torch.float)
            
            outputs = model(time_series, csv_data, input_ids, attention_mask)
            loss = loss_fn(outputs.squeeze(), labels)
            total_loss += loss.item()
    avg_loss = total_loss / len(dataloader)
    return avg_loss

def train_model(model, train_loader, val_loader, optimizer, loss_fn, device, num_epochs=10):
    best_val_loss = float('inf')
    print("Starting Training...\n")
    
    for epoch in range(num_epochs):
        # Make sure to switch back to training mode at the start of each epoch
        model.train()
        print(f"Epoch {epoch+1}/{num_epochs}")
        running_loss = 0.0
        batch_count = 0
        
        for time_series, csv_data, input_ids, attention_mask, labels in train_loader:
            time_series = time_series.to(device, dtype=torch.float)
            csv_data = csv_data.to(device, dtype=torch.float)
            input_ids = input_ids.to(device)
            attention_mask = attention_mask.to(device)
            labels = labels.to(device, dtype=torch.float)
            
            optimizer.zero_grad()
            outputs = model(time_series, csv_data, input_ids, attention_mask)
            loss = loss_fn(outputs.squeeze(), labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            batch_count += 1
            if batch_count % 5 == 0:
                print(f"  Batch {batch_count}, Loss: {loss.item():.4f}")
        
        avg_train_loss = running_loss / len(train_loader)
        val_loss = evaluate(model, val_loader, loss_fn, device)
        print(f"Epoch {epoch+1} Training Loss: {avg_train_loss:.4f}, Validation Loss: {val_loss:.4f}\n")
        
        # Save best model based on validation loss
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), "best_hybrid_model.pt")
            print(f"  Saved Best Model with Validation Loss: {best_val_loss:.4f}\n")
        
        # Also save checkpoint every epoch
        torch.save(model.state_dict(), f"hybrid_model_epoch{epoch+1}.pt")
    print("Training Complete.")

if __name__ == "__main__":
    # Load data
    tokenomics_df, time_series_df, contract_data = load_data()
    
    # Split tokenomics data into train (70%), validation (15%), and test (15%)
    train_df, temp_df = train_test_split(tokenomics_df, test_size=0.3, random_state=42)
    val_df, test_df = train_test_split(temp_df, test_size=0.5, random_state=42)
    
    print(f"Total samples: {len(tokenomics_df)}")
    print(f"Train samples: {len(train_df)}")
    print(f"Validation samples: {len(val_df)}")
    print(f"Test samples: {len(test_df)}\n")
    
    # Create datasets for each split
    train_dataset = MyDataset(train_df, time_series_df, contract_data)
    val_dataset   = MyDataset(val_df, time_series_df, contract_data)
    test_dataset  = MyDataset(test_df, time_series_df, contract_data)
    
    # Create DataLoaders
    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
    val_loader   = DataLoader(val_dataset, batch_size=16, shuffle=False)
    test_loader  = DataLoader(test_dataset, batch_size=16, shuffle=False)
    
    # Instantiate the model: rnn_input_size is 4 (tx_count, total_volume, unique_senders, unique_receivers)
    model = HybridModel(rnn_input_size=4, rnn_hidden_size=64, rnn_layers=2,
                        fnn_input_size=2, fnn_hidden_size=64, final_hidden_size=32)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = nn.BCEWithLogitsLoss()
    
    # Train the model with verbose output
    train_model(model, train_loader, val_loader, optimizer, loss_fn, device, num_epochs=10)
    
    # After training, you can evaluate on the test set
    test_loss = evaluate(model, test_loader, loss_fn, device)
    print(f"Test Loss: {test_loss:.4f}")
