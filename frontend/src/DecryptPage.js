import React, { useState } from 'react';
import {
  Box, Typography, AppBar, Toolbar, Paper, TextField, Button, Grid, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';

function DecryptPage() {
  const [encryptedText, setEncryptedText] = useState('');
  const [key, setKey] = useState('');
  const [bitshiftMatrices, setBitshiftMatrices] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isInvalidFormat, setIsInvalidFormat] = useState(false);

  const handleDecrypt = () => {
    try {
      // Parse the key (always in byte string format)
      const processedKey = parseByteString(key);

      // Validate if bitshift matrices are valid JSON
      let parsedMatrices;
      try {
        parsedMatrices = JSON.parse(bitshiftMatrices);
      } catch (error) {
        throw new Error('Invalid Bitshift Matrices JSON format!');
      }

      axios
        .post('http://localhost:5000/api/decrypt', {
          encrypted_text: encryptedText,
          key: processedKey,
          bitshift_matrices: parsedMatrices,
        })
        .then((response) => {
          setDecryptedText(response.data.decrypted_text);
        })
        .catch((error) => {
          console.error('Decryption failed!', error);
          setSnackbarMessage('Decryption failed. Please check your inputs.');
          setIsInvalidFormat(true);
          setOpenSnackbar(true);
        });
    } catch (error) {
      console.error('Validation error:', error);
      setSnackbarMessage(error.message);
      setIsInvalidFormat(true);
      setOpenSnackbar(true);
    }
  };

  const parseByteString = (byteStr) => {
    try {
      const hexValues = byteStr.replace(/\s+/g, '').split('\\x').filter(Boolean);
      if (hexValues.length === 0) {
        throw new Error('Key is not in valid byte string format.');
      }
      const chars = hexValues.map((hex) => {
        const parsedInt = parseInt(hex, 16);
        if (isNaN(parsedInt)) {
          throw new Error('Invalid byte value in Key!');
        }
        return String.fromCharCode(parsedInt);
      });
      return chars.join('');
    } catch (error) {
      throw new Error('Invalid Key format! Please ensure it is a valid byte string.');
    }
  };

  const handleReset = () => {
    setEncryptedText('');
    setKey('');
    setBitshiftMatrices('');
    setDecryptedText('');
    setIsInvalidFormat(false);
    setSnackbarMessage('');
    setOpenSnackbar(false);
  };

  const handleSpecialPaste = (data) => {
    try {
      const parsedData = parseInputData(data);
      if (parsedData) {
        setEncryptedText(parsedData.encryptedText);
        setKey(parsedData.key);
        setBitshiftMatrices(JSON.stringify(parsedData.bitshiftMatrices, null, 2));
        setIsInvalidFormat(false);
        setSnackbarMessage('Data pasted successfully!');
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
    const encryptedTextMatch = input.match(/Encrypted Text:\s*([\s\S]*?)\n\s*Key:/);
    const keyMatch = input.match(/Key:\s*([\s\S]*?)\n\s*Bitshift Matrices:/);
    const bitshiftMatricesMatch = input.match(/Bitshift Matrices:\s*([\s\S]*)$/);

    if (!encryptedTextMatch || !keyMatch || !bitshiftMatricesMatch) {
      return null;
    }

    const encryptedText = encryptedTextMatch[1].trim();
    const key = keyMatch[1].trim();
    const bitshiftMatricesStr = bitshiftMatricesMatch[1].trim();

    let bitshiftMatrices = [];
    try {
      bitshiftMatrices = JSON.parse(bitshiftMatricesStr);
    } catch (e) {
      return null;
    }

    return { encryptedText, key, bitshiftMatrices };
  };

  // Handle paste event (Ctrl+V)
  const handlePaste = (event) => {
    const pastedData = event.clipboardData.getData('Text');
    const parsedData = parseInputData(pastedData);
    if (parsedData) {
      event.preventDefault(); // Prevent default paste action if data is in special format
      handleSpecialPaste(pastedData);
    }
  };

  // Handle "Paste Special" button click
  const handlePasteSpecial = async () => {
    try {
      const pastedData = await navigator.clipboard.readText();
      const parsedData = parseInputData(pastedData);
      if (parsedData) {
        handleSpecialPaste(pastedData);
      } else {
        setSnackbarMessage('Invalid format! Please check the data.');
        setIsInvalidFormat(true);
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Failed to read clipboard contents:', error);
      setSnackbarMessage('Failed to read clipboard contents.');
      setIsInvalidFormat(true);
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#28293d', color: '#fff', flex: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#1e1e2d', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Enter data to be decrypted
            </Typography>

            <TextField
              label="Encrypted text"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={encryptedText}
              onChange={(e) => setEncryptedText(e.target.value)}
              onPaste={handlePaste}
              sx={{ backgroundColor: '#2a2b3d', borderRadius: '4px' }}
            />

            <TextField
              label="Key (Byte String)"
              variant="outlined"
              fullWidth
              value={key}
              onChange={(e) => setKey(e.target.value)}
              sx={{ backgroundColor: '#2a2b3d', borderRadius: '4px', mt: 2 }}
            />

            <TextField
              label="Bitshift Matrices (List python format)"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={bitshiftMatrices}
              onChange={(e) => setBitshiftMatrices(e.target.value)}
              sx={{ backgroundColor: '#2a2b3d', borderRadius: '4px', mt: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="contained" color="primary" onClick={handleDecrypt}>
                Decrypt
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleReset}>
                Reset
              </Button>
              <Button variant="contained" color="primary" onClick={handlePasteSpecial}>
                Paste Special
              </Button>
            </Box>
          </Paper>

          {decryptedText && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="#4fc3f7">
                Decrypted Text:
              </Typography>
              <Typography variant="body1" color="#ffffff">
                {decryptedText}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Snackbar for showing messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={isInvalidFormat ? 'error' : 'success'} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DecryptPage;
