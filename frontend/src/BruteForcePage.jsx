import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';

function BruteForcePage() {
  const [encryptedText, setEncryptedText] = useState('');
  const [expectedPlaintext, setExpectedPlaintext] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(10000);
  const [triedKeys, setTriedKeys] = useState([]);
  const [isBruteForcing, setIsBruteForcing] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isInvalidFormat, setIsInvalidFormat] = useState(false);

  const handleBruteForce = () => {
    if (!encryptedText || !expectedPlaintext) {
      setSnackbarMessage('Please provide both encrypted text and expected plaintext.');
      setIsInvalidFormat(true);
      setOpenSnackbar(true);
      return;
    }

    setIsBruteForcing(true);
    setTriedKeys([]);

    const params = new URLSearchParams({
      encrypted_text: encryptedText,
      expected_plaintext: expectedPlaintext,
      max_attempts: maxAttempts,
    });

    const eventSource = new EventSource(`http://localhost:5000/api/bruteforce_stream?${params.toString()}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === 'trying') {
        setTriedKeys((prevKeys) => [...prevKeys, data.key]);
      } else if (data.status === 'success') {
        setSnackbarMessage(`Key found: ${data.key}`);
        setOpenSnackbar(true);
        setIsInvalidFormat(false);
        eventSource.close();
        setIsBruteForcing(false);
      } else if (data.status === 'failure') {
        setSnackbarMessage(data.message);
        setOpenSnackbar(true);
        setIsInvalidFormat(true);
        eventSource.close();
        setIsBruteForcing(false);
      }
    };

    eventSource.onerror = () => {
      setSnackbarMessage('Error occurred during brute force.');
      setIsInvalidFormat(true);
      setOpenSnackbar(true);
      eventSource.close();
      setIsBruteForcing(false);
    };
  };

  const handleReset = () => {
    setEncryptedText('');
    setExpectedPlaintext('');
    setMaxAttempts(10000);
    setTriedKeys([]);
    setIsBruteForcing(false);
    setSnackbarMessage('');
    setOpenSnackbar(false);
  };

  const handleSpecialPaste = async () => {
    try {
      const pastedData = await navigator.clipboard.readText();
      const parsedData = parseInputData(pastedData);

      if (parsedData) {
        setEncryptedText(parsedData.encryptedText);
        setExpectedPlaintext(parsedData.expectedPlaintext);
        setMaxAttempts(10000);
        setSnackbarMessage('Data pasted successfully!');
        setIsInvalidFormat(false);
        setOpenSnackbar(true);
      } else {
        throw new Error('Invalid format');
      }
    } catch (error) {
      console.error('Invalid format!', error);
      setSnackbarMessage('Invalid format! Please check the data.');
      setIsInvalidFormat(true);
      setOpenSnackbar(true);
    }
  };
  const parseInputData = (input) => {
  // Match each section using regular expressions
  const encryptedTextMatch = input.match(/Encrypted Text:\s*([\s\S]*?)\n\s*Expected Plaintext:/);
  const expectedPlaintextMatch = input.match(/Expected Plaintext:\s*([\s\S]*?)\n\s*Max Attempts:/);
  const maxAttemptsMatch = input.match(/Max Attempts:\s*(\d+)/);

  // Validate matches and return the structured data
  if (!encryptedTextMatch || !expectedPlaintextMatch || !maxAttemptsMatch) {
    return null;
  }

  const encryptedText = encryptedTextMatch[1].trim();
  const expectedPlaintext = expectedPlaintextMatch[1].trim();
  const maxAttempts = parseInt(maxAttemptsMatch[1].trim(), 10);

  return { encryptedText, expectedPlaintext, maxAttempts };
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
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#ffffff',
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Brute Force Attack
            </Typography>

            <TextField
              label="Encrypted Text"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={encryptedText}
              onChange={(e) => setEncryptedText(e.target.value)}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ccc' },
                  '&:hover fieldset': { borderColor: '#999' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
                },
              }}
            />

            <TextField
              label="Expected Plaintext"
              variant="outlined"
              fullWidth
              value={expectedPlaintext}
              onChange={(e) => setExpectedPlaintext(e.target.value)}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ccc' },
                  '&:hover fieldset': { borderColor: '#999' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
                },
              }}
            />

            <TextField
              label="Max Attempts"
              variant="outlined"
              fullWidth
              type="number"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ccc' },
                  '&:hover fieldset': { borderColor: '#999' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleBruteForce}
                disabled={isBruteForcing}
                sx={{ textTransform: 'none' }}
              >
                {isBruteForcing ? <CircularProgress size={24} /> : 'Start Brute Force'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                sx={{ textTransform: 'none' }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSpecialPaste}
                sx={{ textTransform: 'none' }}
              >
                Paste Special
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#ffffff',
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              minHeight: '300px',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Live Key Trials
            </Typography>
            <Box
              sx={{
                maxHeight: '400px',
                overflowY: 'auto',
                mt: 2,
                bgcolor: '#f9f9f9',
                border: '1px solid #ccc',
                borderRadius: 1,
                p: 2,
              }}
            >
              {triedKeys.length === 0 ? (
                <Typography>No keys tried yet.</Typography>
              ) : (
                triedKeys.map((key, index) => (
                  <Typography key={index} sx={{ fontSize: '0.9rem', color: '#333' }}>
                    Attempt {index + 1}: {key}
                  </Typography>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={isInvalidFormat ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default BruteForcePage;
