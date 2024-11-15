def pad_text(text, block_size=16):
    """Apply PKCS#7 padding to the text."""
    pad_len = block_size - (len(text) % block_size)
    padding = chr(pad_len) * pad_len
    return text + padding


def unpad_text(padded_text):
    """Remove PKCS#7 padding from the text."""
    pad_len = ord(padded_text[-1])
    return padded_text[:-pad_len]


def bitshift_layer(matrix, shift_right=True, bitshift_bits_matrix=None):
    shifted_matrix = [[0 for _ in range(len(matrix[0]))] for _ in range(4)]
    if shift_right:
        bitshift_bits_matrix = [[0 for _ in range(len(matrix[0]))] for _ in range(4)]
        for row in range(4):
            for col in range(len(matrix[0])):
                original_value = matrix[row][col]
                bitshift_bits_matrix[row][col] = original_value & 0b11
                shifted_matrix[row][col] = original_value >> 2
        return shifted_matrix, bitshift_bits_matrix
    else:
        for row in range(4):
            for col in range(len(matrix[0])):
                restored_value = ((matrix[row][col] << 2) | bitshift_bits_matrix[row][col]) % 256
                shifted_matrix[row][col] = restored_value
        return shifted_matrix


def add_round_key(state, round_key):
    return [[(state[row][col] ^ round_key[row][col]) % 256 for col in range(len(state[0]))] for row in range(4)]

def apply_sbox(matrix, sbox):
    for row in range(4):
        for col in range(len(matrix[0])):
            matrix[row][col] = sbox[matrix[row][col]]
    return matrix


def inverse_bitshift_layer(matrix, bitshift_bits_matrix):
    """Apply the inverse bitshift operation using bitshift_bits_matrix."""
    shifted_matrix = [[0 for _ in range(len(matrix[0]))] for _ in range(4)]
    for row in range(4):
        for col in range(len(matrix[0])):
            restored_value = ((matrix[row][col] << 2) | bitshift_bits_matrix[row][col]) % 256
            shifted_matrix[row][col] = restored_value
    return shifted_matrix

def generate_key_matrix(key_bytes):
    """Generate a 256-bit key matrix from key bytes."""
    # Ensure key_bytes is exactly 32 bytes
    if len(key_bytes) != 32:
        raise ValueError("Key must be 32 bytes long")
    key_matrix = [[0 for _ in range(8)] for _ in range(4)]
    index = 0
    for col in range(8):
        for row in range(4):
            key_matrix[row][col] = key_bytes[index]
            index += 1
    return key_matrix
