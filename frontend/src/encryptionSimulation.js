// encryptionSimulation.js

import { STANDARD_S_BOX, INVERSE_S_BOX } from './sbox';

// Simulate Encryption Process
export function simulateEncryption(plaintext, key) {
  const steps = [];
  const initialMatrix = createInitialMatrix(plaintext);
  const initialText = matrixToText(initialMatrix);
  steps.push({
    id: 'plaintext',
    label: 'Plaintext Matrix',
    matrix: initialMatrix,
    text: initialText,
    explanation: 'This is the initial state matrix derived from the plaintext.'
  });

  // Step 1: Custom Bitshift Layer
  const bitshiftResult = customBitshiftLayer(initialMatrix);
  const bitshiftMatrix = bitshiftResult.matrix;
  const bitshiftText = matrixToText(bitshiftMatrix);
  steps.push({
    id: 'bitshift',
    label: 'Custom Bitshift Layer',
    matrix: bitshiftMatrix,
    text: bitshiftText,
    explanation: 'Bits of the state matrix are shifted according to the custom bitshift layer.'
  });

  // Step 2: Custom Transpose
  const transposeMatrix = transpose(bitshiftMatrix);
  const transposeText = matrixToText(transposeMatrix);
  steps.push({
    id: 'transpose',
    label: 'Custom Transpose',
    matrix: transposeMatrix,
    text: transposeText,
    explanation: 'The state matrix is transposed (rows and columns are swapped).'
  });

  // Key Expansion
  const roundKeys = keyExpansion(key);

  // Step 3: Add Round Key (Round 0)
  let currentMatrix = addRoundKey(transposeMatrix, roundKeys[0]);
  let currentText = matrixToText(currentMatrix);
  steps.push({
    id: 'addRoundKey0',
    label: 'Add Round Key (Round 0)',
    matrix: currentMatrix,
    text: currentText,
    roundKey: roundKeys[0],
    explanation: 'The round key for round 0 is added to the state matrix using XOR.'
  });

  // Main Rounds (1 to 13)
  for (let round = 1; round <= 13; round++) {
    currentMatrix = subBytes(currentMatrix);
    currentText = matrixToText(currentMatrix);
    steps.push({
      id: `subBytes${round}`,
      label: `SubBytes (Round ${round})`,
      matrix: currentMatrix,
      text: currentText,
      explanation: 'Each byte of the state matrix is substituted using the S-Box.'
    });

    currentMatrix = shiftRows(currentMatrix);
    currentText = matrixToText(currentMatrix);
    steps.push({
      id: `shiftRows${round}`,
      label: `ShiftRows (Round ${round})`,
      matrix: currentMatrix,
      text: currentText,
      explanation: 'Rows of the state matrix are shifted cyclically to the left.'
    });

    currentMatrix = mixColumns(currentMatrix);
    currentText = matrixToText(currentMatrix);
    steps.push({
      id: `mixColumns${round}`,
      label: `MixColumns (Round ${round})`,
      matrix: currentMatrix,
      text: currentText,
      explanation: 'Columns of the state matrix are mixed using Galois Field multiplication.'
    });

    currentMatrix = addRoundKey(currentMatrix, roundKeys[round]);
    currentText = matrixToText(currentMatrix);
    steps.push({
      id: `addRoundKey${round}`,
      label: `Add Round Key (Round ${round})`,
      matrix: currentMatrix,
      text: currentText,
      roundKey: roundKeys[round],
      explanation: `The round key for round ${round} is added to the state matrix using XOR.`
    });
  }

  // Final Round (14)
  currentMatrix = subBytes(currentMatrix);
  currentText = matrixToText(currentMatrix);
  steps.push({
    id: 'subBytes14',
    label: 'SubBytes (Round 14)',
    matrix: currentMatrix,
    text: currentText,
    explanation: 'Final SubBytes operation.'
  });

  currentMatrix = shiftRows(currentMatrix);
  currentText = matrixToText(currentMatrix);
  steps.push({
    id: 'shiftRows14',
    label: 'ShiftRows (Round 14)',
    matrix: currentMatrix,
    text: currentText,
    explanation: 'Final ShiftRows operation.'
  });

  currentMatrix = addRoundKey(currentMatrix, roundKeys[14]);
  currentText = matrixToText(currentMatrix);
  steps.push({
    id: 'addRoundKey14',
    label: 'Add Round Key (Round 14)',
    matrix: currentMatrix,
    text: currentText,
    roundKey: roundKeys[14],
    explanation: 'The final round key is added to the state matrix using XOR.'
  });

  steps.push({
    id: 'ciphertext',
    label: 'Ciphertext Matrix',
    matrix: currentMatrix,
    text: currentText,
    explanation: 'The final state matrix represents the ciphertext.'
  });

  return steps;
}

// Simulate Decryption Process
export function simulateDecryption(ciphertext, key) {
  const steps = [];
  const initialMatrix = createInitialMatrix(ciphertext);
  const initialText = matrixToText(initialMatrix);
  steps.push({
    id: 'ciphertext',
    label: 'Ciphertext Matrix',
    matrix: initialMatrix,
    text: initialText,
    explanation: 'This is the initial state matrix derived from the ciphertext.'
  });

  // Key Expansion
  const roundKeys = keyExpansion(key);

  // Step 1: Add Round Key (Round 14)
  let currentMatrix = addRoundKey(initialMatrix, roundKeys[14]);
  let currentText = matrixToText(currentMatrix);
  steps.push({
    id: 'addRoundKey14',
    label: 'Add Round Key (Round 14)',
    matrix: currentMatrix,
    text: currentText,
    roundKey: roundKeys[14],
    explanation: 'The round key for round 14 is added to the state matrix using XOR.'
  });

  // Main Rounds (13 to 1)
  for (let round = 13; round >= 1; round--) {
    currentMatrix = inverseShiftRows(currentMatrix);
    currentText = matrixToText(currentMatrix);
    steps.push({
      id: `inverseShiftRows${round}`,
      label: `Inverse ShiftRows (Round ${round})`,
      matrix: currentMatrix,
      text: currentText,
      explanation: 'Rows of the state matrix are shifted cyclically to the right.'
    });

    currentMatrix = inverseSubBytes(currentMatrix);
    currentText = matrixToText(currentMatrix);
    steps.push({
      id: `inverseSubBytes${round}`,
      label: `Inverse SubBytes (Round ${round})`,
      matrix: currentMatrix,
      text: currentText,
      explanation: 'Each byte of the state matrix is substituted using the inverse S-Box.'
    });

    currentMatrix = addRoundKey(currentMatrix, roundKeys[round]);
    currentText = matrixToText(currentMatrix);
    steps.push({
      id: `addRoundKey${round}`,
      label: `Add Round Key (Round ${round})`,
      matrix: currentMatrix,
      text: currentText,
      roundKey: roundKeys[round],
      explanation: `The round key for round ${round} is added to the state matrix using XOR.`
    });

    currentMatrix = inverseMixColumns(currentMatrix);
    currentText = matrixToText(currentMatrix);
    steps.push({
      id: `inverseMixColumns${round}`,
      label: `Inverse MixColumns (Round ${round})`,
      matrix: currentMatrix,
      text: currentText,
      explanation: 'Columns of the state matrix are mixed using inverse Galois Field multiplication.'
    });
  }

  // Final Round (0)
  currentMatrix = inverseShiftRows(currentMatrix);
  currentText = matrixToText(currentMatrix);
  steps.push({
    id: 'inverseShiftRows0',
    label: 'Inverse ShiftRows (Round 0)',
    matrix: currentMatrix,
    text: currentText,
    explanation: 'Final Inverse ShiftRows operation.'
  });

  currentMatrix = inverseSubBytes(currentMatrix);
  currentText = matrixToText(currentMatrix);
  steps.push({
    id: 'inverseSubBytes0',
    label: 'Inverse SubBytes (Round 0)',
    matrix: currentMatrix,
    text: currentText,
    explanation: 'Final Inverse SubBytes operation.'
  });

  currentMatrix = addRoundKey(currentMatrix, roundKeys[0]);
  currentText = matrixToText(currentMatrix);
  steps.push({
    id: 'addRoundKey0',
    label: 'Add Round Key (Round 0)',
    matrix: currentMatrix,
    text: currentText,
    roundKey: roundKeys[0],
    explanation: 'The round key for round 0 is added to the state matrix using XOR.'
  });

  // Inverse Custom Transpose
  currentMatrix = transpose(currentMatrix);
  currentText = matrixToText(currentMatrix);
  steps.push({
    id: 'inverseTranspose',
    label: 'Inverse Custom Transpose',
    matrix: currentMatrix,
    text: currentText,
    explanation: 'The state matrix is transposed back to its original form.'
  });

  // Inverse Custom Bitshift Layer
  const bitshiftResult = inverseCustomBitshiftLayer(currentMatrix);
  currentMatrix = bitshiftResult.matrix;
  currentText = matrixToText(currentMatrix);
  steps.push({
    id: 'inverseBitshift',
    label: 'Inverse Custom Bitshift Layer',
    matrix: currentMatrix,
    text: currentText,
    explanation: 'Bits of the state matrix are shifted back to their original positions.'
  });

  steps.push({
    id: 'plaintext',
    label: 'Plaintext Matrix',
    matrix: currentMatrix,
    text: currentText,
    explanation: 'The final state matrix represents the recovered plaintext.'
  });

  return steps;
}

// Helper Functions

function createInitialMatrix(text) {
  const paddedText = text.padEnd(16, '\0').slice(0, 16);
  const matrix = [];
  let index = 0;
  for (let col = 0; col < 4; col++) {
    matrix[col] = [];
    for (let row = 0; row < 4; row++) {
      matrix[col][row] = paddedText.charCodeAt(index);
      index++;
    }
  }
  // Transpose to match column-major order
  return transpose(matrix);
}

function customBitshiftLayer(matrix) {
  const shiftedMatrix = [];
  for (let i = 0; i < matrix.length; i++) {
    shiftedMatrix[i] = [];
    for (let j = 0; j < matrix[i].length; j++) {
      const cell = matrix[i][j];
      const shiftedCell = ((cell >> 1) | ((cell & 1) << 7)) & 0xFF;
      shiftedMatrix[i][j] = shiftedCell;
    }
  }
  return { matrix: shiftedMatrix };
}

function inverseCustomBitshiftLayer(matrix) {
  const shiftedMatrix = [];
  for (let i = 0; i < matrix.length; i++) {
    shiftedMatrix[i] = [];
    for (let j = 0; j < matrix[i].length; j++) {
      const cell = matrix[i][j];
      const shiftedCell = ((cell << 1) | (cell >> 7)) & 0xFF;
      shiftedMatrix[i][j] = shiftedCell;
    }
  }
  return { matrix: shiftedMatrix };
}

function transpose(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function addRoundKey(matrix, roundKey) {
  const newState = [];
  for (let i = 0; i < 4; i++) {
    newState[i] = [];
    for (let j = 0; j < 4; j++) {
      newState[i][j] = matrix[i][j] ^ roundKey[i][j];
    }
  }
  return newState;
}

function subBytes(matrix) {
  return matrix.map(row => row.map(cell => STANDARD_S_BOX[cell]));
}

function inverseSubBytes(matrix) {
  return matrix.map(row => row.map(cell => INVERSE_S_BOX[cell]));
}

function shiftRows(matrix) {
  const newState = [];
  for (let i = 0; i < 4; i++) {
    newState[i] = matrix[i].slice(i).concat(matrix[i].slice(0, i));
  }
  return newState;
}

function inverseShiftRows(matrix) {
  const newState = [];
  for (let i = 0; i < 4; i++) {
    newState[i] = matrix[i].slice(4 - i).concat(matrix[i].slice(0, 4 - i));
  }
  return newState;
}

function mixColumns(matrix) {
  const newState = [];
  for (let i = 0; i < 4; i++) {
    newState[i] = mixSingleColumn(matrix[i]);
  }
  return newState;
}

function mixSingleColumn(column) {
  const [s0, s1, s2, s3] = column;
  return [
    gfMul(0x02, s0) ^ gfMul(0x03, s1) ^ s2 ^ s3,
    s0 ^ gfMul(0x02, s1) ^ gfMul(0x03, s2) ^ s3,
    s0 ^ s1 ^ gfMul(0x02, s2) ^ gfMul(0x03, s3),
    gfMul(0x03, s0) ^ s1 ^ s2 ^ gfMul(0x02, s3)
  ].map(value => value & 0xFF);
}

function inverseMixColumns(matrix) {
  const newState = [];
  for (let i = 0; i < 4; i++) {
    newState[i] = inverseMixSingleColumn(matrix[i]);
  }
  return newState;
}

function inverseMixSingleColumn(column) {
  const [s0, s1, s2, s3] = column;
  return [
    gfMul(0x0e, s0) ^ gfMul(0x0b, s1) ^ gfMul(0x0d, s2) ^ gfMul(0x09, s3),
    gfMul(0x09, s0) ^ gfMul(0x0e, s1) ^ gfMul(0x0b, s2) ^ gfMul(0x0d, s3),
    gfMul(0x0d, s0) ^ gfMul(0x09, s1) ^ gfMul(0x0e, s2) ^ gfMul(0x0b, s3),
    gfMul(0x0b, s0) ^ gfMul(0x0d, s1) ^ gfMul(0x09, s2) ^ gfMul(0x0e, s3)
  ].map(value => value & 0xFF);
}

function gfMul(a, b) {
  let result = 0;
  while (a && b) {
    if (b & 1) {
      result ^= a;
    }
    if (a & 0x80) {
      a = (a << 1) ^ 0x11b;
    } else {
      a <<= 1;
    }
    b >>= 1;
  }
  return result;
}

function keyExpansion(key) {
  const keyBytes = key.padEnd(32, '\0').slice(0, 32).split('').map(c => c.charCodeAt(0));
  const Nk = 8;
  const Nr = 14;
  const Nb = 4;

  const W = [];
  for (let i = 0; i < Nk; i++) {
    W[i] = keyBytes.slice(4 * i, 4 * (i + 1));
  }

  for (let i = Nk; i < Nb * (Nr + 1); i++) {
    let temp = W[i - 1].slice();
    if (i % Nk === 0) {
      temp = subWord(rotWord(temp));
      temp[0] ^= rcon(i / Nk);
    } else if (Nk > 6 && i % Nk === 4) {
      temp = subWord(temp);
    }
    W[i] = xorWords(W[i - Nk], temp);
  }

  // Generate round keys
  const roundKeys = [];
  for (let i = 0; i <= Nr; i++) {
    const roundKey = [];
    for (let j = 0; j < 4; j++) {
      roundKey[j] = W[i * 4 + j];
    }
    roundKeys.push(roundKey);
  }

  return roundKeys;
}

function subWord(word) {
  return word.map(b => STANDARD_S_BOX[b]);
}

function rotWord(word) {
  return word.slice(1).concat(word.slice(0, 1));
}

function xorWords(wordA, wordB) {
  return wordA.map((b, i) => b ^ wordB[i]);
}

function rcon(i) {
  const RCON = [
    0x00,
    0x01, 0x02, 0x04, 0x08,
    0x10, 0x20, 0x40, 0x80,
    0x1B, 0x36, 0x6C, 0xD8,
    0xAB, 0x4D, 0x9A
  ];
  return RCON[i] || 0x00;
}

function matrixToText(matrix) {
  let text = '';
  const transposed = transpose(matrix);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      text += String.fromCharCode(transposed[col][row]);
    }
  }
  return text;
}
