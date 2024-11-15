import hashlib

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


