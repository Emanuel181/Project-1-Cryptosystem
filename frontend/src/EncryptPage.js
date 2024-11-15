import React, { useState } from 'react';
import {
  Box, Typography, AppBar, Toolbar, Paper, TextField, Button, Grid,
  IconButton, Divider, Collapse, Modal, Dialog, DialogActions, DialogContent,
  DialogTitle, Snackbar, Alert, Switch, Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import EncryptionFlow from './EncryptionFlow';

function EncryptPage() {
  const [inputText, setInputText] = useState('');
  const [rounds, setRounds] = useState([]);
  const [encryptedText, setEncryptedText] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [bitshiftMatrices, setBitshiftMatrices] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEncryptedTextModalOpen, setIsEncryptedTextModalOpen] = useState(false);
  const [bitshiftExpanded, setBitshiftExpanded] = useState(false);
  const [bitshiftHumanReadable, setBitshiftHumanReadable] = useState(true);
  const [keyHumanReadable, setKeyHumanReadable] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [testSectionExpanded, setTestSectionExpanded] = useState(false);
  const [testButtonVisible, setTestButtonVisible] = useState(false);
  const [showTestResultsButton, setShowTestResultsButton] = useState(false);

  const stringToByteString = (str) => {
    // Converts a string to a byte string format like '\x01\x23\x45...'
    return str.split('')
      .map(c => '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  };

  const handleEncrypt = () => {
    axios.post('http://localhost:5000/api/encrypt', { text: inputText })
      .then(response => {
        setEncryptedText(response.data.encrypted_text);
        setRounds(response.data.rounds);
        setEncryptionKey(response.data.key);
        setBitshiftMatrices(response.data.bitshift_matrices);
        setTestResults(null);
        setTestButtonVisible(true);
        setShowTestResultsButton(false);
        setTestSectionExpanded(false);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  };

  const handleTestEncryption = () => {
    if (!encryptedText) {
      alert('Please encrypt text before testing.');
      return;
    }

    axios.post('http://localhost:5000/api/advanced_test_encryption', {
      text: encryptedText
    })
      .then(response => {
        setTestResults(response.data.results);
        setShowTestResultsButton(true);
        setTestSectionExpanded(true);
      })
      .catch(error => {
        console.error('Test encryption failed!', error);
      });
  };

  const handleReset = () => {
    setInputText('');
    setEncryptedText('');
    setRounds([]);
    setEncryptionKey('');
    setBitshiftMatrices([]);
    setTestResults(null);
    setTestButtonVisible(false);
    setShowTestResultsButton(false);
    setTestSectionExpanded(false);
  };

  const handleCopyKey = (copyAsBytes) => {
    const keyToCopy = copyAsBytes
      ? stringToByteString(encryptionKey)
      : encryptionKey;
    navigator.clipboard.writeText(keyToCopy);
    setSnackbarOpen(true);
  };

  const handleCopyEncryptedText = () => {
    navigator.clipboard.writeText(encryptedText);
    setSnackbarOpen(true);
  };

  const handleSpecialCopy = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = (format) => {
    const keyToCopy = format === 'human'
      ? encryptionKey
      : stringToByteString(encryptionKey);
    const matricesToCopy = format === 'human'
      ? bitshiftMatrices.map((matrix, index) =>
          `Matrix ${index + 1}:\n` +
          matrix.map(row => row.join('\t')).join('\n')
        ).join('\n\n')
      : JSON.stringify(bitshiftMatrices);

    const dataToCopy = `
Encrypted Text: ${encryptedText}
Key: ${keyToCopy}
Bitshift Matrices: ${matricesToCopy}
`;
    navigator.clipboard.writeText(dataToCopy);
    setSnackbarOpen(true);
    setOpenDialog(false);
  };

  const handleDialogCancel = () => {
    setOpenDialog(false);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenEncryptedTextModal = () => setIsEncryptedTextModalOpen(true);
  const handleCloseEncryptedTextModal = () => setIsEncryptedTextModalOpen(false);

  const toggleBitshiftExpand = () => setBitshiftExpanded(!bitshiftExpanded);

  const handleToggleBitshiftFormat = () => {
    setBitshiftHumanReadable(!bitshiftHumanReadable);
  };
  const handleToggleKeyFormat = () => {
    setKeyHumanReadable(!keyHumanReadable);
  };

  const handleCopyMatrices = (format) => {
    let matricesToCopy;

    if (format === 'human') {
      matricesToCopy = bitshiftMatrices.map((matrix, index) =>
        `Matrix ${index + 1}:\n` +
        matrix.map(row => row.join('\t')).join('\n')
      ).join('\n\n');
    } else if (format === 'python') {
      const formatMatrixToPython = (matrix) => {
        return '[' + matrix.map(row => '[' + row.join(', ') + ']').join(',\n ') + ']';
      };

      matricesToCopy = bitshiftMatrices.map((matrix, index) =>
        `# Matrix ${index + 1}\nmatrix${index + 1} = ${formatMatrixToPython(matrix)}`
      ).join('\n\n');
    } else {
      matricesToCopy = JSON.stringify(bitshiftMatrices);
    }

    navigator.clipboard.writeText(matricesToCopy);
    setSnackbarOpen(true);
  };

  const toggleTestSection = () => setTestSectionExpanded(!testSectionExpanded);

  const getTestDescription = (testName) => {
    switch (testName) {
      case 'entropy':
      return 'Measures the randomness or unpredictability of the encrypted data. High entropy indicates that the encrypted text is more unpredictable and resistant to analysis.';
    case 'frequency_analysis':
      return 'Analyzes the frequency of each character in the encrypted text. A uniform distribution of characters is desired, which would make frequency analysis harder for attackers.';
    case 'diffusion_percentage':
      return 'Measures the degree to which each plaintext bit affects the ciphertext bits. A higher diffusion percentage means that changing one bit in the plaintext will drastically alter many bits in the ciphertext, which is a good indication of strong encryption.';
    case 'bitwise_distribution':
      return 'Counts the distribution of 0s and 1s in the binary form of the text. Ideally, both 0s and 1s should appear with equal frequency (close to 50%) to avoid patterns in the encryption that could be exploited.';
    case 'hamming_distance':
      return 'Measures the bitwise differences between adjacent characters. This test calculates the distance between each adjacent pair of characters in terms of differing bits. A higher value is better, ideally between 3 and 5 on average, which ensures that the ciphertext is highly varied.';
    case 'chi_squared_uniformity':
      return 'Performs a chi-squared test for uniform distribution. The chi-squared test compares the actual distribution of character frequencies against a uniform distribution. The p-value should ideally be greater than 0.05 to indicate that the distribution is statistically uniform and not easily predictable.';
    case 'serial_correlation':
      return 'Measures the correlation between adjacent characters in the ciphertext. This test checks if adjacent characters are similar or have patterns. A low value close to 0 indicates good randomness, meaning that adjacent characters are uncorrelated and more unpredictable.';
    case 'run_length':
      return 'Analyzes the length of consecutive 1s and 0s in the binary representation of the text. Ideally, you want varied run lengths, avoiding too long or too short runs, as this indicates more complex encryption. Short and long runs can make encryption easier to analyze.';
    case 'block_entropy':
      return 'Calculates the entropy for fixed-size blocks in the encrypted data. Higher entropy in blocks indicates better randomness and stronger encryption. The ideal entropy value is closer to 8 bits, indicating a high degree of uncertainty in the block data.';
    case 'skewness_and_kurtosis':
      return 'Analyzes the distribution of characters for skewness (asymmetry) and kurtosis (peakedness) in the data. Skewness near 0 and kurtosis near 3 indicate a normal distribution of values, which is ideal for random data. Skewness away from 0 and kurtosis much greater than 3 could indicate non-randomness.';
    case 'autocorrelation':
      return 'Measures the autocorrelation between adjacent characters in the text. A value close to 0 is ideal, as it indicates that adjacent characters are not related, and the text does not exhibit repeating patterns.';
      default:
        return 'Unknown test';
    }
  };

  const getDesiredRange = (testName) => {
    switch (testName) {
      case 'entropy':
        return 'Near 8 bits for high entropy, indicating randomness.';
      case 'frequency_analysis':
        return 'Uniform distribution of characters (ideally close to even distribution).';
      case 'diffusion_percentage':
        return 'Greater than 50%, higher is better.';
      case 'bitwise_distribution':
        return 'Close to 50% for both 0s and 1s.';
      case 'hamming_distance':
        return 'Higher is better, ideally between 3 and 5 on average.';
      case 'chi_squared_uniformity':
        return 'Chi-squared test should yield p-value > 0.05 for uniformity.';
      case 'serial_correlation':
        return 'Close to 0 for good diffusion.';
      case 'run_length':
        return 'Ideally should have varied run lengths, avoid too long or short runs.';
      case 'block_entropy':
        return 'Higher entropy in blocks, closer to 8 for better randomness.';
      case 'skewness_and_kurtosis':
        return 'Skewness near 0 and kurtosis near 3 indicate a normal distribution.';
      case 'autocorrelation':
        return 'Should be close to 0 for good randomness.';
      default:
        return '';
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#28293d', color: '#fff', flex: 1 }}>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          {/* Input Section */}
          <Paper sx={{ p: 3, bgcolor: '#1e1e2d', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Enter the text to be encrypted
            </Typography>
            <TextField
              label="Enter text to encrypt"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              sx={{
                backgroundColor: '#2a2b3d',
                borderRadius: '4px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#3c3c4d' },
                  '&:hover fieldset': { borderColor: '#575768' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="contained" color="primary" onClick={handleEncrypt}>
                Encrypt
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleReset}>
                Reset
              </Button>
            </Box>
          </Paper>

          {/* Encrypted Text Section */}
          {encryptedText && (
            <Paper sx={{ p: 3, bgcolor: '#1e1e2d', borderRadius: 2, mt: 3 }}>
              <Typography variant="h6" color="#4fc3f7">
                Encrypted Text:
              </Typography>
              <Box display="flex" alignItems="center">
                <Typography
                  variant="body1"
                  color="#ffffff"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '70%',
                  }}
                >
                  {encryptedText.length > 10
                    ? encryptedText.substring(0, 10) + '...'
                    : encryptedText}
                </Typography>
                <Button onClick={handleOpenEncryptedTextModal}
                  sx={{ ml: 1, textTransform: 'none' }}>
                  Show Encrypted Text
                </Button>
              </Box>

              <Typography variant="h6" color="#4fc3f7" sx={{ mt: 2 }}>
                Key Used:
              </Typography>
              <Box display="flex" alignItems="center">
                <Typography
                  variant="body2"
                  color="#ffffff"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '70%',
                  }}
                >
                  {keyHumanReadable
                    ? encryptionKey.slice(0, 10) + '...'
                    : stringToByteString(encryptionKey).slice(0, 14) + '...'}
                </Typography>
                <Button onClick={handleOpenModal}
                  sx={{ ml: 1, textTransform: 'none' }}>
                  Show Full Key
                </Button>
              </Box>

              <Divider sx={{ my: 2, backgroundColor: '#333' }} />

              {/* Bitshift Matrices */}
              <Button onClick={toggleBitshiftExpand}
                sx={{ color: '#4fc3f7', display: 'flex', alignItems: 'center' }}>
                {bitshiftExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {bitshiftExpanded ? 'Hide Bitshift Matrices' : 'Show Bitshift Matrices'}
                </Typography>
              </Button>

              <Collapse in={bitshiftExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" color="#4fc3f7">
                    Bitshift Matrices:
                  </Typography>
                  <Box sx={{
                    maxHeight: 200, overflowY: 'auto', p: 1,
                    backgroundColor: '#2a2b3d', borderRadius: 1
                  }}>
                    {bitshiftMatrices.map((matrix, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="body2" color="#ffffff">
                          {`Matrix ${index + 1}:`}
                        </Typography>
                        {bitshiftHumanReadable
                          ? matrix.map((row, rowIndex) => (
                            <Typography key={rowIndex} variant="body2" color="#ffffff">
                              {row.join(', ')}
                            </Typography>
                          ))
                          : <Typography variant="body2" color="#ffffff">
                              {JSON.stringify(matrix)}
                            </Typography>
                        }
                      </Box>
                    ))}
                  </Box>

                  <Switch
                    checked={bitshiftHumanReadable}
                    onChange={handleToggleBitshiftFormat}
                    color="primary"
                    inputProps={{
                      'aria-label': 'Toggle between human-readable and non-human-readable format'
                    }}
                    sx={{ mt: 2 }}
                  />
                  <Typography variant="body2" color="#ffffff">
                    {bitshiftHumanReadable
                      ? 'Human-readable'
                      : 'Non-human-readable (JSON)'}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Tooltip title="Copy Human-readable Format" arrow>
                      <IconButton onClick={() => handleCopyMatrices('human')}
                        color="primary" sx={{ mr: 2 }}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy Python Format" arrow>
                      <IconButton onClick={() => handleCopyMatrices('python')}
                        color="primary">
                        <CodeIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Collapse>

              <Divider sx={{ my: 2, backgroundColor: '#333' }} />

              {/* Copy All Data */}
              <Button variant="outlined" color="primary" sx={{ mt: 2 }}
                onClick={handleSpecialCopy}>
                Copy All Data
              </Button>
            </Paper>
          )}

          {/* Run Tests Section */}
          {testButtonVisible && (
            <Paper sx={{ p: 3, bgcolor: '#1e1e2d', borderRadius: 2, mt: 3 }}>
              <Button variant="contained" color="secondary"
                onClick={handleTestEncryption}>
                Run Tests
              </Button>
            </Paper>
          )}

          {/* Show/Hide Test Results Section */}
          {showTestResultsButton && (
            <Paper sx={{ p: 3, bgcolor: '#1e1e2d', borderRadius: 2, mt: 3 }}>
              <Button variant="contained" color="primary"
                onClick={toggleTestSection}>
                {testSectionExpanded ? 'Hide Test Results' : 'Show Test Results'}
              </Button>

              <Collapse in={testSectionExpanded} timeout="auto" unmountOnExit>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {testResults && Object.entries(testResults).map(([testName, result]) => (
                    <Grid item xs={12} key={testName}>
                      <Paper sx={{ p: 2, backgroundColor: '#333', borderRadius: 1 }}>
                        <Typography variant="h6" color="#4fc3f7">
                          {testName.replace(/_/g, ' ')}
                        </Typography>

                        {/* Test Description */}
                        <Typography variant="body2" color="#ffffff" sx={{ mt: 1 }}>
                          <strong>Definition: </strong>
                          {getTestDescription(testName)}
                        </Typography>

                        {/* Test Result */}
                        <Typography variant="body1" color="#ffffff" sx={{ mt: 1 }}>
                          <strong>Result: </strong>
                          {typeof result === 'object'
                            ? Object.entries(result)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')
                            : result}
                        </Typography>

                        {/* Desired Range */}
                        <Typography variant="body2" color="#ffffff" sx={{ mt: 1 }}>
                          <strong>Desired Range: </strong>
                          {getDesiredRange(testName)}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Collapse>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          {/* Encryption Flow Section */}
          <Paper sx={{ p: 3, bgcolor: '#1e1e2d', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Encryption Flow
            </Typography>
            <EncryptionFlow rounds={rounds} />
          </Paper>
        </Grid>
      </Grid>

      {/* Full Key Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: '#1e1e2d', boxShadow: 24, p: 4,
          borderRadius: 2
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="#4fc3f7">
              Full Encryption Key
            </Typography>
            <IconButton onClick={handleCloseModal} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body1" sx={{
            mt: 2, wordWrap: 'break-word', maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {keyHumanReadable ? encryptionKey : stringToByteString(encryptionKey)}
          </Typography>

          <Switch
            checked={keyHumanReadable}
            onChange={handleToggleKeyFormat}
            color="primary"
            inputProps={{
              'aria-label': 'Toggle between human-readable and bytes key format'
            }}
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="#ffffff" sx={{ mt: 1 }}>
            {keyHumanReadable ? 'Human-readable' : 'Bytes'}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Button onClick={() => handleCopyKey(false)}
              variant="outlined" color="primary">
              Copy Key
            </Button>
            <Button onClick={() => handleCopyKey(true)}
              variant="outlined" color="primary" sx={{ ml: 2 }}>
              Copy Bytes Key
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Encrypted Text Modal */}
      <Modal open={isEncryptedTextModalOpen}
        onClose={handleCloseEncryptedTextModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, bgcolor: '#1e1e2d', boxShadow: 24, p: 4,
          borderRadius: 2
        }}>
          <Box display="flex" justifyContent="space-between"
            alignItems="center">
            <Typography variant="h6" color="#4fc3f7">
              Full Encrypted Text
            </Typography>
            <IconButton onClick={handleCloseEncryptedTextModal}
              color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body1" sx={{
            mt: 2, wordWrap: 'break-word', maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {encryptedText}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button onClick={handleCopyEncryptedText}
              variant="outlined" color="primary">
              Copy Encrypted Text
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Copy Format Dialog */}
      <Dialog open={openDialog} onClose={handleDialogCancel}>
        <DialogTitle>Select Copy Format</DialogTitle>
        <DialogContent>
          <Button onClick={() => handleDialogClose('human')}
            variant="outlined" color="primary" fullWidth sx={{ mb: 2 }}>
            Human-readable
          </Button>
          <Button onClick={() => handleDialogClose('non-human')}
            variant="outlined" color="primary" fullWidth>
            Bytes Format
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for showing copied data message */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success"
          sx={{ width: '100%' }}>
          Data copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EncryptPage;
