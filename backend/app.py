from flask import Flask, jsonify, request
from flask_cors import CORS
import secrets
from encryption import encrypt  # Import your encrypt function

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Generate a secure random 256-bit key (32 bytes)
key_bytes = secrets.token_bytes(32)

@app.route('/api/encrypt', methods=['POST'])
def encrypt_text():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400

    input_text = data['text']

    # Perform encryption
    try:
        encrypted_text, bitshift_bits_matrices = encrypt(input_text, key_bytes)
        # For simplicity, we'll return only the encrypted text
        return jsonify({'encrypted_text': encrypted_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
