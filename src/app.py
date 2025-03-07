from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import RobertaTokenizer
from deploy import load_model, run_inference

app = Flask(__name__)
CORS(app)  # Enable CORS if your front end is hosted elsewhere

# Load model and tokenizer at startup
model = load_model("best_hybrid_model.pt")
tokenizer = RobertaTokenizer.from_pretrained("microsoft/codebert-base")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    # Expect JSON payload with keys: "time_series", "csv_data", "contract_text"
    time_series = data.get("time_series")
    csv_data = data.get("csv_data")
    contract_text = data.get("contract_text")
    
    if time_series is None or csv_data is None or contract_text is None:
        return jsonify({"error": "Missing required data"}), 400

    # Run inference
    prediction = run_inference(model, tokenizer, time_series, csv_data, contract_text)
    
    return jsonify({"scam_probability": prediction})

if __name__ == "__main__":
    # Run the Flask app on port 5000, accessible on all interfaces
    app.run(host="0.0.0.0", port=5000)
