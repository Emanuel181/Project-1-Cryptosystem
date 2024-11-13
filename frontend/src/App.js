import React, { useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';

function App() {
  const [inputText, setInputText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [error, setError] = useState('');

  const handleEncrypt = () => {
    axios.post('http://localhost:5000/api/encrypt', { text: inputText })
      .then(response => {
        setEncryptedText(response.data.encrypted_text);
        setError('');
      })
      .catch(error => {
        setError('Encryption failed.');
        console.error('There was an error!', error);
      });
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Text Encryption
      </Typography>
      <TextField
        label="Enter text to encrypt"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleEncrypt}>
        Encrypt
      </Button>
      {encryptedText && (
        <div>
          <Typography variant="h6" component="h2" gutterBottom>
            Encrypted Text:
          </Typography>
          <Typography variant="body1">
            {encryptedText}
          </Typography>
        </div>
      )}
      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}
    </Container>
  );
}

export default App;
