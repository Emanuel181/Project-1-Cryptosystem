from matrix_operations import merge_matrices_to_text
from utils import apply_sbox, add_round_key, bitshift_layer
from matrix_operations import shift_rows, mix_columns, transpose
from matrix_operations import inverse_shift_rows, inverse_mix_columns
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

def encrypt_block(matrix, round_keys, sbox):
    """Encrypt a single block of data using the provided round keys and S-Box."""
    state = [row[:] for row in matrix]
    round_details = []  # To store per-round details

    # Apply custom Bitshift Layer
    state, bitshift_bits_matrix = bitshift_layer(state, shift_right=True)

    # Apply custom Transpose
    state = transpose(state)

    # Initial AddRoundKey
    state = add_round_key(state, round_keys[0])
    round_details.append({
        'round': 0,
        'text_state': to_base64_and_latin1(state),  # Convert to Base64 and then Latin1
        'key_character': chr(round_keys[0][0][0]),  # Convert key byte to Latin1 character
        'current_character': to_base64_and_latin1(matrix)[:4]  # First few characters affected
    })

    # Main Rounds (Rounds 1 to 13)
    for round in range(1, 14):
        state = apply_sbox(state, sbox)
        state = shift_rows(state)
        state = mix_columns(state)
        state = add_round_key(state, round_keys[round])

        # Collect round information
        round_details.append({
            'round': round,
            'text_state': to_base64_and_latin1(state),  # Convert to Base64 and then Latin1
            'key_character': chr(round_keys[round][0][0]),  # Convert key byte to Latin1 character
            'current_character': to_base64_and_latin1(state)[:4]  # Affected characters
        })

    # Final Round (without MixColumns)
    state = apply_sbox(state, sbox)
    state = shift_rows(state)
    state = add_round_key(state, round_keys[14])

    round_details.append({
        'round': 14,
        'text_state': to_base64_and_latin1(state),  # Convert to Base64 and then Latin1
        'key_character': chr(round_keys[14][0][0]),
        'current_character': to_base64_and_latin1(state)[:4]
    })

    # Return the encrypted matrix, bitshift bits matrix, and round details
    return state, bitshift_bits_matrix, round_details


def decrypt_block(encrypted_matrix, bitshift_bits_matrix, round_keys, inverse_sbox):
    state = [row[:] for row in encrypted_matrix]  # Copy the encrypted matrix

    # Initial AddRoundKey (for the final round)
    state = add_round_key(state, round_keys[14])

    # Final Round (Round 14): No Inverse MixColumns
    state = inverse_shift_rows(state)
    state = apply_sbox(state, inverse_sbox)
    state = add_round_key(state, round_keys[13])

    # Main Rounds (Rounds 13 to 1): Include Inverse MixColumns
    for round in range(13, 0, -1):
        state = inverse_shift_rows(state)
        state = apply_sbox(state, inverse_sbox)
        state = add_round_key(state, round_keys[round])
        if round > 1:  # Exclude Inverse MixColumns for Round 1
            state = inverse_mix_columns(state)

    # Final AddRoundKey for Round 0
    state = add_round_key(state, round_keys[0])

    # Apply custom Transpose
    state = transpose(state)

    # Reverse custom Bitshift Layer
    state = bitshift_layer(state, shift_right=False, bitshift_bits_matrix=bitshift_bits_matrix)

    return state






