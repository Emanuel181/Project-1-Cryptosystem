import math
import random
import time
from collections import Counter

# Example custom encryption algorithm
def custom_encrypt(plaintext, key):
    """
    Simulate encryption with side-channel data collection.
    """
    ciphertext = []
    timing_data = []
    power_data = []
    cache_timing_data = []
    branch_timing_data = []
    fault_injection_data = []

    for i, char in enumerate(plaintext):
        start_time = time.time()

        # Simulate encryption process
        key_char = key[i % len(key)]
        intermediate_value = (ord(char) + ord(key_char)) % 256
        encrypted_char = chr(intermediate_value)

        end_time = time.time()

        # Timing analysis
        timing_data.append(end_time - start_time)

        # Power consumption analysis (simulate Hamming weight + noise)
        power = bin(intermediate_value).count('1') + random.uniform(0, 0.5)
        power_data.append(power)

        # Cache timing analysis
        cache_timing = random.uniform(0.01, 0.05) if intermediate_value % 2 == 0 else random.uniform(0.05, 0.1)
        cache_timing_data.append(cache_timing)

        # Branch prediction analysis
        branch_start = time.time()
        if intermediate_value % 2 == 0:
            branch_result = intermediate_value * 2
        else:
            branch_result = intermediate_value // 2
        branch_end = time.time()
        branch_timing_data.append(branch_end - branch_start)

        # Fault injection analysis (simulate bit-flipping)
        fault_injected_value = intermediate_value ^ (1 << random.randint(0, 7))
        fault_injection_data.append(fault_injected_value)

        ciphertext.append(encrypted_char)

    return {
        "ciphertext": ''.join(ciphertext),
        "timing_data": timing_data,
        "power_data": power_data,
        "cache_timing_data": cache_timing_data,
        "branch_timing_data": branch_timing_data,
        "fault_injection_data": fault_injection_data,
    }


# Helper function to calculate Shannon entropy
def calculate_entropy(data):
    """
    Calculate the Shannon entropy of a given dataset.
    """
    counts = Counter(data)
    total = len(data)
    entropy = -sum((count / total) * math.log2(count / total) for count in counts.values())
    return entropy


# Function to run side-channel analysis
def side_channel_analysis(plaintext, key):
    """
    Perform side-channel analysis on a custom encryption algorithm.
    """
    result = custom_encrypt(plaintext, key)

    # Calculate statistics for each side-channel metric
    analysis_results = {
        "timing_data": {
            "average": sum(result["timing_data"]) / len(result["timing_data"]),
            "max": max(result["timing_data"]),
            "min": min(result["timing_data"]),
        },
        "power_data": {
            "average": sum(result["power_data"]) / len(result["power_data"]),
            "max": max(result["power_data"]),
            "min": min(result["power_data"]),
        },
        "cache_timing_data": {
            "average": sum(result["cache_timing_data"]) / len(result["cache_timing_data"]),
            "max": max(result["cache_timing_data"]),
            "min": min(result["cache_timing_data"]),
        },
        "branch_timing_data": {
            "average": sum(result["branch_timing_data"]) / len(result["branch_timing_data"]),
            "max": max(result["branch_timing_data"]),
            "min": min(result["branch_timing_data"]),
        },
        "fault_injection_data": {
            "entropy": calculate_entropy(result["fault_injection_data"]),
        },
    }

    return result, analysis_results


# Main program for testing
if __name__ == "__main__":
    plaintext = "HELLO"
    key = "SECRETKEY"

    print(f"Plaintext: {plaintext}")
    print(f"Key: {key}")

    encrypted_data, analysis = side_channel_analysis(plaintext, key)

    print("\n=== Encryption Results ===")
    print(f"Ciphertext: {encrypted_data['ciphertext']}")

    print("\n=== Side-Channel Analysis ===")
    for metric, stats in analysis.items():
        print(f"\n{metric.capitalize()}:")
        for stat, value in stats.items():
            print(f"  {stat.capitalize()}: {value}")
