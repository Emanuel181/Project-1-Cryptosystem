import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import FlowDiagram from './FlowDiagram';
import StateMatrix from './StateMatrix';
import { simulateEncryption, simulateDecryption } from './encryptionSimulation';

const About = () => {
  const generateKey = () => {
    const array = new Uint8Array(32); // Generate a 32-byte key
    window.crypto.getRandomValues(array); // Fill with secure random values
    return Array.from(array)
      .map((byte) => String.fromCharCode(byte)) // Convert each byte to a character
      .join(''); // Join into a string
  };

  const [steps, setSteps] = useState([]);
  const [currentStepId, setCurrentStepId] = useState('');
  const [currentMatrix, setCurrentMatrix] = useState(null);
  const [currentText, setCurrentText] = useState('');
  const [currentRoundKey, setCurrentRoundKey] = useState(null);
  const [plaintext] = useState('HELLO WORLD!!');
  const [key] = useState(() => generateKey());
  const [mode, setMode] = useState('encryption');

  useEffect(() => {
    let simulationSteps = [];
    if (mode === 'encryption') {
      simulationSteps = simulateEncryption(plaintext, key);
    } else {
      const encryptionSteps = simulateEncryption(plaintext, key);
      const ciphertext = encryptionSteps[encryptionSteps.length - 1]?.text || '';
      simulationSteps = simulateDecryption(ciphertext, key);
    }
    setSteps(simulationSteps);
    if (simulationSteps.length > 0) {
      const initialStep = simulationSteps[0];
      setCurrentStepId(initialStep.id);
      setCurrentMatrix(initialStep.matrix);
      setCurrentText(initialStep.text);
      setCurrentRoundKey(initialStep.roundKey || null);
    } else {
      setCurrentStepId('');
      setCurrentMatrix(null);
      setCurrentText('');
      setCurrentRoundKey(null);
    }
  }, [plaintext, key, mode]);

  const handleNodeClick = (_, node) => {
    const step = steps.find((s) => s.id === node.id);
    if (step) {
      setCurrentStepId(step.id);
      setCurrentMatrix(step.matrix);
      setCurrentText(step.text);
      setCurrentRoundKey(step.roundKey || null);
    }
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const keyToHex = Array.from(key)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: '#f5f5f5',
        color: '#333',
        minHeight: '100vh',
        fontFamily: 'Raleway, sans-serif',
      }}
    >
      <Paper
        sx={{
          p: 3,
          bgcolor: '#ffffff',
          borderRadius: 2,
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h4" gutterBottom>
          About This Encryption Algorithm
        </Typography>
        <Typography variant="body1" paragraph>
          This page visualizes a custom implementation of the AES encryption algorithm using dynamically generated example data.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>
          Example Data
        </Typography>
        <Typography variant="body1">
          <strong>Plaintext:</strong> {plaintext || 'No plaintext provided'}
        </Typography>
        <Typography variant="body1">
          <strong>Key:</strong> {keyToHex || 'No key provided'}
        </Typography>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            aria-label="Encryption mode toggle"
            sx={{
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            <ToggleButton
              value="encryption"
              aria-label="encryption mode"
              sx={{
                color: mode === 'encryption' ? '#fff' : '#333',
                bgcolor: mode === 'encryption' ? '#4caf50' : '#e0e0e0',
                fontWeight: mode === 'encryption' ? 'bold' : 'normal',
                '&.Mui-selected': {
                  color: '#fff',
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#43a047' },
                },
              }}
            >
              Encryption
            </ToggleButton>
            <ToggleButton
              value="decryption"
              aria-label="decryption mode"
              sx={{
                color: mode === 'decryption' ? '#fff' : '#333',
                bgcolor: mode === 'decryption' ? '#2196f3' : '#e0e0e0',
                fontWeight: mode === 'decryption' ? 'bold' : 'normal',
                '&.Mui-selected': {
                  color: '#fff',
                  bgcolor: '#2196f3',
                  '&:hover': { bgcolor: '#1976d2' },
                },
              }}
            >
              Decryption
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Typography variant="h5" sx={{ mt: 3 }}>
          {mode === 'encryption' ? 'Encryption' : 'Decryption'} Visualization
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 3 }}>
          <Box sx={{ flex: 1 }}>
            <FlowDiagram
              steps={steps || []}
              currentStep={currentStepId}
              onNodeClick={handleNodeClick}
              selectedNode={currentStepId} // Pass the selected node ID
            />
          </Box>
          <Box sx={{ ml: 4, flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {steps.find((s) => s.id === currentStepId)?.label || 'No step selected'}
            </Typography>
            <Typography variant="body1">
              <strong>Current Text Representation:</strong> {currentText || 'N/A'}
            </Typography>
            {currentMatrix && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  State Matrix
                </Typography>
                <StateMatrix matrix={currentMatrix} />
              </>
            )}
            {currentRoundKey && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Round Key
                </Typography>
                <StateMatrix matrix={currentRoundKey} />
              </>
            )}
            {steps.find((s) => s.id === currentStepId)?.explanation && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>Explanation:</strong>{' '}
                {steps.find((s) => s.id === currentStepId).explanation}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default About;
