import math
from collections import Counter
from flask import Flask, jsonify, request
from flask_cors import CORS
import secrets
from encryption import encrypt
from encryption import decrypt
import numpy as np
from scipy.stats import chisquare, skew, kurtosis

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Generate a secure random 256-bit key (32 bytes)
key_bytes = bytes(secrets.token_bytes(32))

# Utility functions for testing
def calculate_entropy(data):
    data_length = len(data)
    if data_length == 0:
        return 0
    counts = Counter(data)
    entropy = -sum((count / data_length) * math.log2(count / data_length) for count in counts.values())
    return entropy

def frequency_analysis(encrypted_text):
    return dict(Counter(encrypted_text))

def diffusion_test(text, modified_text, key_bytes):
    encrypted_text1, _, _ = encrypt(text, key_bytes)
    encrypted_text2, _, _ = encrypt(modified_text, key_bytes)
    differences = sum(1 for a, b in zip(encrypted_text1, encrypted_text2) if a != b)
    return (differences / max(len(encrypted_text1), len(encrypted_text2))) * 100

def bitwise_distribution_test(encrypted_text):
    binary_text = ''.join(format(ord(c), '08b') for c in encrypted_text)
    zero_count = binary_text.count('0')
    one_count = binary_text.count('1')
    return {'0s': zero_count, '1s': one_count}

def hamming_distance_test(encrypted_text):
    distances = []
    for i in range(len(encrypted_text) - 1):
        bin1 = format(ord(encrypted_text[i]), '08b')
        bin2 = format(ord(encrypted_text[i+1]), '08b')
        distances.append(sum(b1 != b2 for b1, b2 in zip(bin1, bin2)))
    return {'average_distance': np.mean(distances), 'max_distance': max(distances)}

def chi_squared_test(encrypted_text):
    frequencies = Counter(encrypted_text)
    observed_values = list(frequencies.values())
    total_count = sum(observed_values)
    expected_freq = total_count / len(frequencies)  # Calculate average frequency for each unique character
    expected_values = [expected_freq] * len(frequencies)  # Expected values based on uniform distribution

    # Perform Chi-squared test
    chi2, p = chisquare(observed_values, f_exp=expected_values)
    return {'chi_squared': chi2, 'p_value': p}

def serial_correlation_test(encrypted_text):
    n = len(encrypted_text)
    if n < 2:
        return 0
    mean_val = sum(ord(c) for c in encrypted_text) / n
    num = sum((ord(encrypted_text[i]) - mean_val) * (ord(encrypted_text[i+1]) - mean_val) for i in range(n - 1))
    denom = sum((ord(c) - mean_val) ** 2 for c in encrypted_text)
    return num / denom if denom != 0 else 0

def run_length_test(encrypted_text):
    binary_text = ''.join(format(ord(c), '08b') for c in encrypted_text)
    runs = [len(run) for run in ''.join(binary_text).split('0') + ''.join(binary_text).split('1') if run]
    return {'average_run_length': np.mean(runs), 'max_run_length': max(runs)}

def block_entropy_tests(encrypted_text, block_size=16):
    """Calculates entropy for each block of a given size in the encrypted text."""
    num_blocks = len(encrypted_text) // block_size
    entropies = [calculate_entropy(encrypted_text[i * block_size:(i + 1) * block_size]) for i in range(num_blocks)]
    return {'average_block_entropy': np.mean(entropies), 'max_block_entropy': max(entropies)}

def skewness_and_kurtosis_test(encrypted_text):
    """Calculates skewness and kurtosis of the character distribution."""
    values = [ord(c) for c in encrypted_text]
    return {'skewness': skew(values), 'kurtosis': kurtosis(values)}

def autocorrelation_test(encrypted_text):
    """Performs an autocorrelation test on the character sequence."""
    values = [ord(c) for c in encrypted_text]
    n = len(values)
    mean_val = np.mean(values)
    autocorr = sum((values[i] - mean_val) * (values[i+1] - mean_val) for i in range(n-1)) / sum((v - mean_val) ** 2 for v in values)
    return autocorr

@app.route('/api/encrypt', methods=['POST', 'OPTIONS'])
def encrypt_text():
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight successful"}), 200

    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400

    input_text = data['text']

    try:
        encrypted_text, bitshift_bits_matrices, rounds_data = encrypt(input_text, key_bytes)  # Use the encrypt function from cipher.py
        print(encrypted_text)

        return jsonify({
            'encrypted_text': encrypted_text,
            'key': key_bytes.hex(),
            'bitshift_matrices': bitshift_bits_matrices,  # Include bitshift bits/matrices here
            'rounds': rounds_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/advanced_test_encryption', methods=['POST', 'OPTIONS'])
def advanced_test_encryption():
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight successful"}), 200

    data = request.get_json()
    print("Data received for testing:", data)  # Debug print

    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400

    input_text = data['text']
    print("Input text for encryption:", input_text)  # Debug print

    key_bytes = secrets.token_bytes(32)
    print("Generated key for testing:", key_bytes.hex())  # Debug print

    try:
        # Encrypt the text for testing
        encrypted_text, bitshift_bits_matrices, _ = encrypt(input_text, key_bytes)
        print("Encrypted text:", encrypted_text)  # Debug print

        # Run all tests
        results = {
            "entropy": calculate_entropy(encrypted_text),
            "frequency_analysis": frequency_analysis(encrypted_text),
            "diffusion_percentage": diffusion_test(input_text, input_text[:-1] + "?", key_bytes),
            "bitwise_distribution": bitwise_distribution_test(encrypted_text),
            "hamming_distance": hamming_distance_test(encrypted_text),
            "chi_squared_uniformity": chi_squared_test(encrypted_text),
            "serial_correlation": serial_correlation_test(encrypted_text),
            "run_length": run_length_test(encrypted_text),
            "block_entropy": block_entropy_tests(encrypted_text),
            "skewness_and_kurtosis": skewness_and_kurtosis_test(encrypted_text),
            "autocorrelation": autocorrelation_test(encrypted_text)
        }

        print("Test results:", results)  # Debug print
        return jsonify({
            'status': 'success',
            'results': results,
            'encrypted_text': encrypted_text,
            'bitshift_matrices': bitshift_bits_matrices  # Include bitshift bits/matrices here
        })
    except Exception as e:
        print("Error during advanced testing:", str(e))  # Debug print
        return jsonify({'error': str(e)}), 500

@app.route('/api/decrypt', methods=['POST'])
def api_decrypt():
    data = request.get_json()
    encrypted_text_base64 = data.get('encrypted_text')
    key_hex = data.get('key')
    bitshift_matrices = data.get('bitshift_matrices')

    decrypted_text = decrypt(encrypted_text_base64, key_hex, bitshift_matrices)

    return jsonify({'decrypted_text': decrypted_text})



if __name__ == '__main__':
    app.run(debug=True)
