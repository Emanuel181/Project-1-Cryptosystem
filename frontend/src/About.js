// About.js

import React, { useState, useEffect } from 'react';
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
    const step = steps.find(s => s.id === node.id);
    if (step) {
      setCurrentStepId(step.id);
      setCurrentMatrix(step.matrix);
      setCurrentText(step.text);
      setCurrentRoundKey(step.roundKey || null);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>About This Encryption Algorithm</h1>
      <p>
        This page visualizes a custom implementation of the AES encryption algorithm using hardcoded example data.
      </p>
      <h2>Example Data</h2>
      <p><strong>Plaintext:</strong> {plaintext}</p>
      <p><strong>Key:</strong> {key}</p>
      <div>
        <button onClick={() => handleModeChange('encryption')} disabled={mode === 'encryption'}>
          Encryption
        </button>
        <button onClick={() => handleModeChange('decryption')} disabled={mode === 'decryption'}>
          Decryption
        </button>
      </div>
      <h2>{mode === 'encryption' ? 'Encryption' : 'Decryption'} Visualization</h2>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <FlowDiagram steps={steps} currentStep={currentStepId} onNodeClick={handleNodeClick} />
        <div style={{ marginLeft: '20px', flexGrow: 1 }}>
          <h3>{steps.find(s => s.id === currentStepId)?.label}</h3>
          <p><strong>Current Text Representation:</strong> {currentText}</p>
          {currentMatrix && (
            <>
              <h4>State Matrix</h4>
              <StateMatrix matrix={currentMatrix} />
            </>
          )}
          {currentRoundKey && (
            <>
              <h4>Round Key</h4>
              <StateMatrix matrix={currentRoundKey} />
            </>
          )}
          {steps.find(s => s.id === currentStepId)?.explanation && (
            <p><strong>Explanation:</strong> {steps.find(s => s.id === currentStepId).explanation}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
