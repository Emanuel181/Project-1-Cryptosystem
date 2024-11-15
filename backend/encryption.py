import secrets
from utils import pad_text, unpad_text
from matrix_operations import split_string_to_column_major_matrix, merge_matrices_to_text
from Cypher import encrypt_block, decrypt_block
from key_schedule import key_expansion
from sbox import generate_key_dependent_sbox
from utils import generate_key_matrix
import base64


def to_base64_and_latin1(matrix):
    """
    Convert the matrix into a Base64-encoded string and then decode it using 'latin1'.
    """
    # Flatten the matrix to a byte array
    byte_array = bytearray([cell for row in matrix for cell in row])
    # Encode as Base64
    base64_encoded = base64.b64encode(byte_array).decode('latin1')
    return base64_encoded


def encrypt(text, key_bytes):
    padded_text = pad_text(text)
    matrices = split_string_to_column_major_matrix(padded_text)
    key_matrix = generate_key_matrix(key_bytes)
    round_keys = key_expansion(key_matrix)

    # Generate key-dependent S-Box
    sbox, inverse_sbox = generate_key_dependent_sbox(key_bytes)

    encrypted_matrices = []
    bitshift_bits_matrices = []
    all_round_details = []  # Collect all rounds for UI display

    for block_index, matrix in enumerate(matrices):
        encrypted_matrix, bitshift_bits_matrix, round_details = encrypt_block(matrix, round_keys, sbox)

        # Add block information to each round
        for round_detail in round_details:
            round_detail['block'] = block_index  # Identify the block number

        encrypted_matrices.append(encrypted_matrix)
        bitshift_bits_matrices.append(bitshift_bits_matrix)
        all_round_details.extend(round_details)  # Collect all rounds from each block

    encrypted_text = merge_matrices_to_text(encrypted_matrices)
    encrypted_text_bytes = encrypted_text.encode('latin1')
    encrypted_text_base64 = base64.b64encode(encrypted_text_bytes).decode('ascii')
    return encrypted_text_base64, bitshift_bits_matrices, all_round_details


def decrypt(encrypted_text_base64, key_hex, bitshift_matrices):
    # Decode the Base64-encoded encrypted text
    encrypted_text_bytes = base64.b64decode(encrypted_text_base64)
    encrypted_text = encrypted_text_bytes.decode('latin1')  # Use 'latin1' to get original bytes

    key_bytes = bytes.fromhex(key_hex)
    padded_text = encrypted_text  # Since it's already padded during encryption

    matrices = split_string_to_column_major_matrix(padded_text)
    key_matrix = generate_key_matrix(key_bytes)
    round_keys = key_expansion(key_matrix)

    # Generate key-dependent S-Box
    sbox, inverse_sbox = generate_key_dependent_sbox(key_bytes)

    decrypted_matrices = []

    for matrix, bitshift_bits_matrix in zip(matrices, bitshift_matrices):
        decrypted_matrix = decrypt_block(matrix, bitshift_bits_matrix, round_keys, inverse_sbox)
        decrypted_matrices.append(decrypted_matrix)

    decrypted_text = merge_matrices_to_text(decrypted_matrices)
    unpadded_text = unpad_text(decrypted_text)
    return unpadded_text

