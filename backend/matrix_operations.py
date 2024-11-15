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


def transpose(matrix):
    return [list(row) for row in zip(*matrix)]

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
