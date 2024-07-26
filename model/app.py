from flask import Flask, request, jsonify
from evaluate import predict_and_update
import requests

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    
    if data.get('language') == 'Korean' and 'idx' in data:
        try:
            user_idx = data['idx']
            result = predict_and_update(user_idx)
            
            if not result:
                return jsonify({"error": "No data found"}), 404
            
            prediction, disease_name = result[2], result[3]  # result는 (DSS_IDX, DSS_STATE, DSS_DISC, DSS_PREV)를 포함합니다
            response = send_request_to_web_server(prediction, disease_name)
            
            if response.status_code != 200:
                return jsonify({"error": "Failed to send request to web server"}), 500
            
            return jsonify({"prediction": prediction, "disease_name": disease_name, "status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Invalid request"}), 400

def send_request_to_web_server(prediction, disease_name):
    url = 'http://localhost:3000/update_prediction'
    payload = {
        'prediction': prediction,
        'disease_name': disease_name
    }
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, json=payload, headers=headers)
    return response

if __name__ == '__main__':
    app.run(port=5000)
