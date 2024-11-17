// About.js

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
  const [steps, setSteps] = useState([]);
  const [currentStepId, setCurrentStepId] = useState('');
  const [currentMatrix, setCurrentMatrix] = useState(null);
  const [currentText, setCurrentText] = useState('');
  const [currentRoundKey, setCurrentRoundKey] = useState(null);
  const [plaintext] = useState('HELLO WORLD!!');
  const [key] = useState('MYSECRETKEY123456');
  const [mode, setMode] = useState('encryption');

  useEffect(() => {
    let simulationSteps;
    if (mode === 'encryption') {
      simulationSteps = simulateEncryption(plaintext, key);
    } else {
      const encryptionSteps = simulateEncryption(plaintext, key);
      const ciphertext = encryptionSteps[encryptionSteps.length - 1].text;
      simulationSteps = simulateDecryption(ciphertext, key);
    }
    setSteps(simulationSteps);
    if (simulationSteps.length > 0) {
      const initialStep = simulationSteps[0];
      setCurrentStepId(initialStep.id);
      setCurrentMatrix(initialStep.matrix);
      setCurrentText(initialStep.text);
      setCurrentRoundKey(initialStep.roundKey || null);
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
          This page visualizes a custom implementation of the AES encryption algorithm using hardcoded example data.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>
          Example Data
        </Typography>
        <Typography variant="body1">
          <strong>Plaintext:</strong> {plaintext}
        </Typography>
        <Typography variant="body1">
          <strong>Key:</strong> {key}
        </Typography>
        <Box sx={{ mt: 3 }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            aria-label="Encryption mode"
          >
            <ToggleButton value="encryption" aria-label="encryption mode">
              Encryption
            </ToggleButton>
            <ToggleButton value="decryption" aria-label="decryption mode">
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
              steps={steps}
              currentStep={currentStepId}
              onNodeClick={handleNodeClick}
            />
          </Box>
          <Box sx={{ ml: 4, flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {steps.find((s) => s.id === currentStepId)?.label}
            </Typography>
            <Typography variant="body1">
              <strong>Current Text Representation:</strong> {currentText}
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
