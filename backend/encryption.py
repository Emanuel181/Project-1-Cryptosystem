import hashlib
import secrets

def pad_text(text, block_size=16):
    """Apply PKCS#7 padding to the text."""
    pad_len = block_size - (len(text) % block_size)
    padding = chr(pad_len) * pad_len
    return text + padding

def unpad_text(padded_text):
    """Remove PKCS#7 padding from the text."""
    pad_len = ord(padded_text[-1])
    return padded_text[:-pad_len]

def split_string_to_column_major_matrix(text):
    """Convert text to a list of 4x4 matrices in column-major order."""
    matrices = []
    for block_start in range(0, len(text), 16):
        block = text[block_start:block_start+16]
        matrix = [[0 for _ in range(4)] for _ in range(4)]
        index = 0
        for col in range(4):
            for row in range(4):
                matrix[row][col] = ord(block[index])
                index += 1
        matrices.append(matrix)
    return matrices

def merge_matrices_to_text(matrices):
    """Convert a list of 4x4 matrices back to text."""
    text = ''
    for matrix in matrices:
        for col in range(4):
            for row in range(4):
                text += chr(matrix[row][col])
    return text

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

def transpose(matrix):
    return [list(row) for row in zip(*matrix)]

def shift_rows(matrix):
    shifted_matrix = [row[:] for row in matrix]
    for i in range(1, 4):
        shifted_matrix[i] = matrix[i][i:] + matrix[i][:i]
    return shifted_matrix

def inverse_shift_rows(matrix):
    unshifted_matrix = [row[:] for row in matrix]
    for i in range(1, 4):
        unshifted_matrix[i] = matrix[i][-i:] + matrix[i][:-i]
    return unshifted_matrix

def galois_mult(a, b):
    p = 0
    for _ in range(8):
        if b & 1:
            p ^= a
        high_bit = a & 0x80
        a = ((a << 1) & 0xFF)
        if high_bit:
            a ^= 0x1B
        b >>= 1
    return p

def mix_columns(matrix):
    for col in range(4):
        a = [matrix[row][col] for row in range(4)]
        matrix[0][col] = (galois_mult(a[0], 2) ^ galois_mult(a[1], 3) ^ a[2] ^ a[3]) % 256
        matrix[1][col] = (a[0] ^ galois_mult(a[1], 2) ^ galois_mult(a[2], 3) ^ a[3]) % 256
        matrix[2][col] = (a[0] ^ a[1] ^ galois_mult(a[2], 2) ^ galois_mult(a[3], 3)) % 256
        matrix[3][col] = (galois_mult(a[0], 3) ^ a[1] ^ a[2] ^ galois_mult(a[3], 2)) % 256
    return matrix

def inverse_mix_columns(matrix):
    for col in range(4):
        a = [matrix[row][col] for row in range(4)]
        matrix[0][col] = (galois_mult(a[0], 14) ^ galois_mult(a[1], 11) ^
                          galois_mult(a[2], 13) ^ galois_mult(a[3], 9)) % 256
        matrix[1][col] = (galois_mult(a[0], 9) ^ galois_mult(a[1], 14) ^
                          galois_mult(a[2], 11) ^ galois_mult(a[3], 13)) % 256
        matrix[2][col] = (galois_mult(a[0], 13) ^ galois_mult(a[1], 9) ^
                          galois_mult(a[2], 14) ^ galois_mult(a[3], 11)) % 256
        matrix[3][col] = (galois_mult(a[0], 11) ^ galois_mult(a[1], 13) ^
                          galois_mult(a[2], 9) ^ galois_mult(a[3], 14)) % 256
    return matrix

def generate_key_dependent_sbox(key_bytes):
    """Generate a key-dependent S-Box."""
    sbox = list(range(256))
    hasher = hashlib.sha256()
    hasher.update(key_bytes)
    hash_digest = hasher.digest()
    j = 0
    for i in range(256):
        j = (j + sbox[i] + hash_digest[i % len(hash_digest)]) % 256
        sbox[i], sbox[j] = sbox[j], sbox[i]
    # Ensure the S-Box is a permutation of 0-255
    assert len(set(sbox)) == 256
    # Generate inverse S-Box
    inverse_sbox = [0]*256
    for i in range(256):
        inverse_sbox[sbox[i]] = i
    return sbox, inverse_sbox

def apply_sbox(matrix, sbox):
    for row in range(4):
        for col in range(len(matrix[0])):
            matrix[row][col] = sbox[matrix[row][col]]
    return matrix

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

# Round constants for key expansion (up to 14 rounds)
RCON = [
    0x00,
    0x01, 0x02, 0x04, 0x08,
    0x10, 0x20, 0x40, 0x80,
    0x1B, 0x36, 0x6C, 0xD8,
    0xAB, 0x4D, 0x9A
]

def key_expansion(key_matrix):
    key_symbols = [key_matrix[row][col] for col in range(len(key_matrix[0])) for row in range(4)]
    Nk = 8  # Key length in 32-bit words (256 bits / 32 bits per word)
    Nr = 14  # Number of rounds for AES-256
    Nb = 4   # Block size in 32-bit words

    # Initialize the key schedule
    W = []  # List of words (4-byte lists)
    for i in range(Nk):
        W.append(key_symbols[4*i:4*(i+1)])

    for i in range(Nk, Nb * (Nr + 1)):
        temp = W[i - 1][:]
        if i % Nk == 0:
            # RotWord
            temp = temp[1:] + temp[:1]
            # SubWord with standard AES S-Box
            temp = [STANDARD_S_BOX[b] for b in temp]
            # Rcon
            temp[0] ^= RCON[i // Nk]
        elif Nk > 6 and i % Nk == 4:
            # SubWord
            temp = [STANDARD_S_BOX[b] for b in temp]
        word = [(W[i - Nk][j] ^ temp[j]) % 256 for j in range(4)]
        W.append(word)

    # Convert W to round keys (list of 4xNb matrices)
    round_keys_matrices = []
    for r in range(Nr + 1):
        round_key = []
        for c in range(Nb):
            word = W[r * Nb + c]
            round_key.append(word)
        # Transpose the round key to match the state matrix format
        round_key_matrix = transpose(round_key)
        round_keys_matrices.append(round_key_matrix)
    return round_keys_matrices

def encrypt_block(matrix, round_keys, sbox):
    state = [row[:] for row in matrix]

    # Apply custom Bitshift Layer
    state, bitshift_bits_matrix = bitshift_layer(state, shift_right=True)

    # Apply custom Transpose
    state = transpose(state)

    # Initial AddRoundKey
    state = add_round_key(state, round_keys[0])

    # Main Rounds
    for round in range(1, 14):
        state = apply_sbox(state, sbox)
        state = shift_rows(state)
        state = mix_columns(state)
        state = add_round_key(state, round_keys[round])

    # Final Round (without MixColumns)
    state = apply_sbox(state, sbox)
    state = shift_rows(state)
    state = add_round_key(state, round_keys[14])

    # Store bitshift bits for decryption
    return state, bitshift_bits_matrix

def decrypt_block(encrypted_matrix, bitshift_bits_matrix, round_keys, inverse_sbox):
    state = [row[:] for row in encrypted_matrix]

    # Initial AddRoundKey
    state = add_round_key(state, round_keys[14])

    # Main Rounds
    for round in range(13, 0, -1):
        state = inverse_shift_rows(state)
        state = apply_sbox(state, inverse_sbox)
        state = add_round_key(state, round_keys[round])
        state = inverse_mix_columns(state)

    # Final Round (without InvMixColumns)
    state = inverse_shift_rows(state)
    state = apply_sbox(state, inverse_sbox)
    state = add_round_key(state, round_keys[0])

    # Apply custom Transpose
    state = transpose(state)

    # Reverse custom Bitshift Layer
    state = bitshift_layer(state, shift_right=False, bitshift_bits_matrix=bitshift_bits_matrix)

    return state

def encrypt(text, key_bytes):
    padded_text = pad_text(text)
    matrices = split_string_to_column_major_matrix(padded_text)
    key_matrix = generate_key_matrix(key_bytes)
    round_keys = key_expansion(key_matrix)

    # Generate key-dependent S-Box
    sbox, inverse_sbox = generate_key_dependent_sbox(key_bytes)

    encrypted_matrices = []
    bitshift_bits_matrices = []

    for matrix in matrices:
        encrypted_matrix, bitshift_bits_matrix = encrypt_block(matrix, round_keys, sbox)
        encrypted_matrices.append(encrypted_matrix)
        bitshift_bits_matrices.append(bitshift_bits_matrix)

    encrypted_text = merge_matrices_to_text(encrypted_matrices)
    return encrypted_text, bitshift_bits_matrices

def decrypt(encrypted_text, key_bytes, bitshift_bits_matrices):
    matrices = split_string_to_column_major_matrix(encrypted_text)
    key_matrix = generate_key_matrix(key_bytes)
    round_keys = key_expansion(key_matrix)

    # Generate key-dependent S-Box
    sbox, inverse_sbox = generate_key_dependent_sbox(key_bytes)

    decrypted_matrices = []

    for i, encrypted_matrix in enumerate(matrices):
        bitshift_bits_matrix = bitshift_bits_matrices[i]
        decrypted_matrix = decrypt_block(encrypted_matrix, bitshift_bits_matrix, round_keys, inverse_sbox)
        decrypted_matrices.append(decrypted_matrix)

    decrypted_text = merge_matrices_to_text(decrypted_matrices)
    unpadded_text = unpad_text(decrypted_text)
    return unpadded_text

# Standard AES S-Box for key expansion
STANDARD_S_BOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5,
    0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
    0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc,
    0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a,
    0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
    0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b,
    0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85,
    0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
    0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17,
    0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88,
    0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
    0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9,
    0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6,
    0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
    0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94,
    0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68,
    0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
]

if __name__ == "__main__":
    # Generate a secure random 256-bit key (32 bytes)
    key_bytes = secrets.token_bytes(32)

    # Example usage
    input_text = "Ana are mere and more text to test the encryption and decryption."

    # Encryption
    encrypted_text, bitshift_bits_matrices = encrypt(input_text, key_bytes)
    print("\nEncrypted Text:")
    print(encrypted_text)

    # Decryption
    decrypted_text = decrypt(encrypted_text, key_bytes, bitshift_bits_matrices)
    print("\nDecrypted Text:")
    print(decrypted_text)
