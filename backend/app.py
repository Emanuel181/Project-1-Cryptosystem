import base64
import json
import math
import queue
import random
import string
import threading
import time
from collections import Counter
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import secrets
from encryption import encrypt
from encryption import decrypt
import numpy as np
from scipy.stats import chisquare, skew, kurtosis
import pyRAPL
import tracemalloc
import wmi
import win32com.client
import requests


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

def brute_force_worker(encrypted_text, correct_key, max_attempts, thread_id, result_queue, shared_state):
    """
    Worker function to attempt decryption with random keys.
    """
    lock, found_key = shared_state
    attempts = 0

    for _ in range(max_attempts):
        with lock:
            if shared_state[1] is not None:  # Check if key is already found
                break

        candidate_key = secrets.token_bytes(32)  # Generate a random 256-bit key
        attempts += 1

        # Report the attempt
        result_queue.put({
            "status": "trying",
            "key": candidate_key.hex(),
            "thread_id": thread_id,
            "attempts": attempts,
        })

        # Check if the key matches
        if candidate_key == correct_key:
            with lock:
                shared_state[1] = candidate_key  # Update found_key
            # Report success
            result_queue.put({
                "status": "success",
                "key": candidate_key.hex(),
                "thread_id": thread_id,
                "attempts": attempts,
            })
            return  # Exit the worker

    # If the loop completes without finding the key
    result_queue.put({
        "status": "thread_complete",
        "thread_id": thread_id,
        "attempts": attempts,
    })

@app.route("/api/bruteforce_stream", methods=["GET"])
def brute_force_stream():
    """
    API endpoint to handle brute force simulation.
    """
    encrypted_text = request.args.get("encrypted_text", "")
    expected_plaintext = request.args.get("expected_plaintext", "")
    max_attempts = int(request.args.get("max_attempts", 10000))

    if not encrypted_text or not expected_plaintext or max_attempts <= 0:
        return Response(
            json.dumps({"error": "Invalid input"}),
            status=400,
            content_type="application/json",
        )

    # Generate a mock correct key for this session
    correct_key = secrets.token_bytes(32)
    print(f"[DEBUG] Correct Key (hex): {correct_key.hex()}")  # Debugging purposes

    def generate():
        # Create new shared state for this request
        lock, found_key = threading.Lock(), None
        shared_state = [lock, found_key]  # Use a list to allow mutable updates

        result_queue = queue.Queue()

        max_workers = 4
        threads = []
        # Distribute remaining attempts to ensure total attempts equal to max_attempts
        base_attempts_per_thread = max_attempts // max_workers
        attempts_distribution = [base_attempts_per_thread] * max_workers
        for i in range(max_attempts % max_workers):
            attempts_distribution[i] += 1

        # Start worker threads
        for i in range(max_workers):
            t = threading.Thread(
                target=brute_force_worker,
                args=(
                    encrypted_text,
                    correct_key,
                    attempts_distribution[i],
                    i,
                    result_queue,
                    shared_state,
                )
            )
            t.start()
            threads.append(t)

        # Collect results until all threads are done
        threads_alive = max_workers
        while threads_alive > 0 or not result_queue.empty():
            try:
                result = result_queue.get(timeout=1)
                yield f"data: {json.dumps(result)}\n\n"
                if result["status"] == "success":
                    # Key found, no need to wait for other threads
                    break
                elif result["status"] == "thread_complete":
                    threads_alive -= 1
            except queue.Empty:
                pass

        # Wait for all threads to finish
        for t in threads:
            t.join()

        # Once all threads are done, check if key was found
        with shared_state[0]:
            if shared_state[1] is None:
                yield f"data: {json.dumps({'status': 'failure', 'message': 'Exhausted all attempts.'})}\n\n"
            else:
                # Key was found, already reported
                pass

    return Response(generate(), content_type="text/event-stream")


def timing_analysis(input_text, key_bytes):
    """
    Measures execution time of the encryption process in microseconds.
    """
    num_attempts = 100
    timings = []

    for _ in range(num_attempts):
        start_time = time.perf_counter()
        encrypt(input_text, key_bytes)
        end_time = time.perf_counter()
        timings.append((end_time - start_time) * 1e6)  # Convert to microseconds

    return timings


def cache_timing_analysis(input_text, key_bytes):
    """
    Measures the execution time with induced cache misses.
    """
    num_attempts = 100
    timings = []
    large_data = bytearray(20 * 1024 * 1024)  # 20 MB data to exceed typical CPU cache size

    for _ in range(num_attempts):
        # Access the large data to flush the cache
        for i in range(0, len(large_data), 4096):
            large_data[i] = (large_data[i] + 1) % 256

        start_time = time.perf_counter()
        encrypt(input_text, key_bytes)
        end_time = time.perf_counter()
        timings.append((end_time - start_time) * 1e6)  # Microseconds

    return timings


import requests
import json

def get_cpu_temperature():
    """
    Fetches CPU temperature using OpenHardwareMonitor's web server.
    """
    try:
        # Replace with your actual OpenHardwareMonitor web server URL
        url = "http://localhost:8085/data.json"
        response = requests.get(url)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch data: HTTP {response.status_code}")

        data = response.json()

        cpu_temperatures = []

        # Recursive function to traverse the JSON tree
        def traverse(node):
            if 'Text' in node and 'Children' in node:
                if 'Intel Core' in node['Text']:
                    for child in node['Children']:
                        if child['Text'] == 'Temperatures':
                            for temp_sensor in child['Children']:
                                # Get the temperature value, stripping '°C' and converting to float
                                temp_value_str = temp_sensor.get('Value', '').replace('°C', '').strip()
                                if temp_value_str:
                                    temp_value = float(temp_value_str)
                                    cpu_temperatures.append(temp_value)
                else:
                    for child in node['Children']:
                        traverse(child)

        # Start traversing from the root
        for hardware in data.get('Children', []):
            traverse(hardware)

        if cpu_temperatures:
            # Return the average CPU temperature
            return sum(cpu_temperatures) / len(cpu_temperatures)
        else:
            return None

    except Exception as e:
        print(f"Error reading temperature: {e}")
        return None



def generate_random_string(length):
    """
    Generates a random string of a specified length.
    """
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(length))

def get_stabilized_temperature(readings=5, delay=0.2):
    """
    Collects multiple temperature readings and averages them for stability.
    """
    temps = []
    for _ in range(readings):
        temp = get_cpu_temperature()
        if temp is not None:
            temps.append(temp)
        time.sleep(delay)  # Delay between readings
    return sum(temps) / len(temps) if temps else None


def power_consumption_analysis(num_strings, key_bytes):
    """
    Measures temperature change during encryption as a proxy for power consumption.
    Encrypts a specified number of randomly generated strings.
    """
    temperature_changes = []

    for _ in range(num_strings):
        # Generate a random string for encryption
        input_text = generate_random_string(10)

        # Get stabilized initial CPU temperature
        temp_before = get_stabilized_temperature()
        if temp_before is None:
            raise Exception("Could not read CPU temperature. Ensure OpenHardwareMonitor is running and the web server is enabled.")

        # Perform encryption
        encrypt(input_text, key_bytes)

        # Get stabilized temperature after encryption
        temp_after = get_stabilized_temperature()
        if temp_after is None:
            raise Exception("Could not read CPU temperature after encryption.")

        # Calculate and normalize temperature change
        temp_change = round(temp_after - temp_before, 2)  # Round to 2 decimals
        temperature_changes.append(temp_change)

    return temperature_changes

def memory_access_pattern_analysis(input_text, key_bytes):
    """
    Measures memory allocation patterns during encryption.
    """
    num_attempts = 10  # Number of attempts to observe access patterns
    memory_patterns = []

    for _ in range(num_attempts):
        tracemalloc.start()  # Start tracing memory allocations

        # Perform encryption
        encrypt(input_text, key_bytes)

        # Take a snapshot of memory usage
        snapshot = tracemalloc.take_snapshot()
        tracemalloc.stop()  # Stop tracing

        # Analyze memory usage
        memory_stats = []
        for stat in snapshot.statistics('lineno'):
            memory_stats.append({
                'line': stat.traceback.format()[-1],  # Line of code
                'size': stat.size / 1024,  # Memory size in KB
                'count': stat.count,  # Number of allocations
            })

        memory_patterns.append(memory_stats)

    return memory_patterns


def hamming_weight_analysis(input_text, key_bytes):
    """
    Calculates the Hamming weight of the encrypted data.
    """
    num_attempts = 100
    hamming_weights = []

    for _ in range(num_attempts):
        # Unpack the tuple returned by encrypt
        encrypted_text_base64, _, _ = encrypt(input_text, key_bytes)
        # Decode the base64 encoded encrypted text
        encrypted_bytes = base64.b64decode(encrypted_text_base64.encode('ascii'))
        # Calculate Hamming weight
        hamming_weight = sum(bin(byte).count('1') for byte in encrypted_bytes)
        hamming_weights.append(hamming_weight)

    return hamming_weights



# API Endpoint
@app.route('/api/side_channel_test', methods=['POST'])
def side_channel_test():
    data = request.get_json()
    input_text = data.get('input_text', '')  # Default input_text for non-power tests
    test_type = data.get('test_type', 'timing')
    num_strings = data.get('num_strings', 1)  # Default to 1 string for power analysis

    key_bytes = bytes(secrets.token_bytes(32))

    try:
        results = {}
        if test_type == 'timing':
            analysis_results = timing_analysis(input_text, key_bytes)
            results[test_type] = analysis_results
        elif test_type == 'cache':
            analysis_results = cache_timing_analysis(input_text, key_bytes)
            results[test_type] = analysis_results
        elif test_type == 'power':
            if not isinstance(num_strings, int) or num_strings < 1:
                return jsonify({'error': 'Invalid number of strings for power analysis'}), 400
            analysis_results = power_consumption_analysis(num_strings, key_bytes)
            results[test_type] = analysis_results
        elif test_type == 'memory':
            analysis_results = memory_access_pattern_analysis(input_text, key_bytes)
            results[test_type] = analysis_results
        elif test_type == 'hamming':
            analysis_results = hamming_weight_analysis(input_text, key_bytes)
            results[test_type] = analysis_results
        elif test_type == 'all':
            # Run all tests
            results['timing'] = timing_analysis(input_text, key_bytes)
            results['cache'] = cache_timing_analysis(input_text, key_bytes)
            results['power'] = power_consumption_analysis(num_strings, key_bytes)
            results['memory'] = memory_access_pattern_analysis(input_text, key_bytes)
            results['hamming'] = hamming_weight_analysis(input_text, key_bytes)
        else:
            return jsonify({'error': 'Invalid test type provided'}), 400

        return jsonify({'status': 'success', 'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, threaded=True, port=5000)
