import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
  Divider,
  Collapse,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';
import EncryptionFlow from './EncryptionFlow';

// Utility Functions
const stringToByteString = (str) =>
  str
    .split('')
    .map((c) => '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

// Test Descriptions and Desired Ranges
const testDescriptions = {
  entropy:
    'Measures the randomness or unpredictability of the encrypted data. High entropy indicates that the encrypted text is more unpredictable and resistant to analysis.',
  frequency_analysis:
    'Analyzes the frequency of each character in the encrypted text. A uniform distribution makes frequency analysis harder for attackers.',
  diffusion_percentage:
    'Measures how each plaintext bit affects ciphertext bits. A higher percentage means changing one bit in plaintext alters many bits in ciphertext, indicating strong encryption.',
  bitwise_distribution:
    'Counts the distribution of 0s and 1s in the binary form of the text. Ideally, both should appear equally (close to 50%) to avoid exploitable patterns.',
  hamming_distance:
    'Measures the bitwise differences between adjacent characters. A higher average value (ideally between 3 and 5) ensures the ciphertext is highly varied.',
  chi_squared_uniformity:
    'Performs a chi-squared test for uniform distribution. A p-value greater than 0.05 indicates the distribution is statistically uniform and not easily predictable.',
  serial_correlation:
    'Measures the correlation between adjacent characters in the ciphertext. A low value close to 0 indicates good randomness.',
  run_length:
    'Analyzes the length of consecutive 1s and 0s in the binary representation. Varied run lengths (avoiding too long or too short runs) indicate more complex encryption.',
  block_entropy:
    'Calculates the entropy for fixed-size blocks. Higher entropy indicates better randomness and stronger encryption.',
  skewness_and_kurtosis:
    'Analyzes the distribution for skewness (asymmetry) and kurtosis (peakedness). Skewness near 0 and kurtosis near 3 indicate a normal distribution, ideal for random data.',
  autocorrelation:
    'Measures autocorrelation between adjacent characters. A value close to 0 indicates that adjacent characters are not related.',
};

const desiredRanges = {
  entropy: 'Near 8 bits for high entropy, indicating randomness.',
  frequency_analysis:
    'Uniform distribution of characters (ideally close to even distribution).',
  diffusion_percentage: 'Greater than 50%; higher is better.',
  bitwise_distribution: 'Close to 50% for both 0s and 1s.',
  hamming_distance: 'Higher is better; ideally between 3 and 5 on average.',
  chi_squared_uniformity:
    'Chi-squared test should yield p-value > 0.05 for uniformity.',
  serial_correlation: 'Close to 0 for good diffusion.',
  run_length: 'Varied run lengths; avoid too long or too short runs.',
  block_entropy:
    'Higher entropy in blocks; closer to 8 for better randomness.',
  skewness_and_kurtosis:
    'Skewness near 0 and kurtosis near 3 indicate a normal distribution.',
  autocorrelation: 'Should be close to 0 for good randomness.',
};

function EncryptPage() {
  const [inputText, setInputText] = useState('');
  const [rounds, setRounds] = useState([]);
  const [encryptedText, setEncryptedText] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [bitshiftMatrices, setBitshiftMatrices] = useState([]);
  const [testResults, setTestResults] = useState(null);
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
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Handlers
  const handleEncrypt = () => {
    if (!inputText.trim()) {
      setSnackbarMessage('Please enter text to encrypt.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    axios
      .post('http://localhost:5000/api/encrypt', { text: inputText })
      .then((response) => {
        setEncryptedText(response.data.encrypted_text);
        setRounds(response.data.rounds);
        setEncryptionKey(response.data.key);
        setBitshiftMatrices(response.data.bitshift_matrices);
        setTestResults(null);
        setTestButtonVisible(true);
        setShowTestResultsButton(false);
        setTestSectionExpanded(false);
        setSnackbarMessage('Encryption successful!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error('There was an error!', error);
        setSnackbarMessage('Encryption failed. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  const handleTestEncryption = () => {
    if (!encryptedText) {
      setSnackbarMessage('Please encrypt text before testing.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    axios
      .post('http://localhost:5000/api/advanced_test_encryption', {
        text: encryptedText,
      })
      .then((response) => {
        setTestResults(response.data.results);
        setShowTestResultsButton(true);
        setTestSectionExpanded(true);
      })
      .catch((error) => {
        console.error('Test encryption failed!', error);
        setSnackbarMessage('Test encryption failed. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
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
    setSnackbarMessage('');
    setSnackbarSeverity('success');
  };

  const handleCopyKey = (copyAsBytes) => {
    const keyToCopy = copyAsBytes
      ? stringToByteString(encryptionKey)
      : encryptionKey;
    navigator.clipboard.writeText(keyToCopy);
    setSnackbarMessage('Key copied to clipboard!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleCopyEncryptedText = () => {
    navigator.clipboard.writeText(encryptedText);
    setSnackbarMessage('Encrypted text copied to clipboard!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleSpecialCopy = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = (format) => {
    let dataToCopy = '';

    if (format === 'human' || format === 'non-human') {
      const keyToCopy =
        format === 'human' ? encryptionKey : stringToByteString(encryptionKey);
      const matricesToCopy =
        format === 'human'
          ? bitshiftMatrices
              .map(
                (matrix, index) =>
                  `Matrix ${index + 1}:\n` +
                  matrix.map((row) => row.join('\t')).join('\n')
              )
              .join('\n\n')
          : JSON.stringify(bitshiftMatrices);

      dataToCopy = `
Encrypted Text: ${encryptedText}
Key: ${keyToCopy}
Bitshift Matrices: ${matricesToCopy}
`;
    } else if (format === 'input-encrypted') {
      dataToCopy = `
Input Text: ${inputText}
Encrypted Text: ${encryptedText}
`;
    }

    navigator.clipboard.writeText(dataToCopy.trim());
    setSnackbarMessage('Data copied to clipboard!');
    setSnackbarSeverity('success');
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
      matricesToCopy = bitshiftMatrices
        .map(
          (matrix, index) =>
            `Matrix ${index + 1}:\n` +
            matrix.map((row) => row.join('\t')).join('\n')
        )
        .join('\n\n');
    } else if (format === 'python') {
      const formatMatrixToPython = (matrix) => {
        return (
          '[' +
          matrix.map((row) => '[' + row.join(', ') + ']').join(',\n ') +
          ']'
        );
      };

      matricesToCopy = bitshiftMatrices
        .map(
          (matrix, index) =>
            `# Matrix ${index + 1}\nmatrix${index + 1} = ${formatMatrixToPython(
              matrix
            )}`
        )
        .join('\n\n');
    } else {
      matricesToCopy = JSON.stringify(bitshiftMatrices);
    }

    navigator.clipboard.writeText(matricesToCopy);
    setSnackbarMessage('Matrices copied to clipboard!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const toggleTestSection = () => setTestSectionExpanded(!testSectionExpanded);

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
        <Grid item xs={12} md={4}>
          {/* Input Section */}
          <Paper
            sx={{
              p: 3,
              bgcolor: '#ffffff',
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Encrypt Your Text
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
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ccc' },
                  '&:hover fieldset': { borderColor: '#999' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEncrypt}
                disabled={!inputText.trim()}
                sx={{ textTransform: 'none' }}
              >
                Encrypt
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                sx={{ textTransform: 'none' }}
              >
                Reset
              </Button>
            </Box>
          </Paper>

          {/* Encrypted Text Section */}
          {encryptedText && (
            <Paper
              sx={{
                p: 3,
                bgcolor: '#ffffff',
                borderRadius: 2,
                mt: 3,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              <Typography variant="h6" color="primary">
                Encrypted Text
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography
                  variant="body1"
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
                <Button
                  onClick={handleOpenEncryptedTextModal}
                  sx={{ ml: 1, textTransform: 'none' }}
                >
                  Show Full Text
                </Button>
              </Box>

              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                Encryption Key
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography
                  variant="body1"
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
                <Button
                  onClick={handleOpenModal}
                  sx={{ ml: 1, textTransform: 'none' }}
                >
                  Show Full Key
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Bitshift Matrices */}
              <Button
                onClick={toggleBitshiftExpand}
                sx={{ color: '#4fc3f7', textTransform: 'none' }}
              >
                {bitshiftExpanded ? (
                  <ExpandLessIcon sx={{ mr: 1 }} />
                ) : (
                  <ExpandMoreIcon sx={{ mr: 1 }} />
                )}
                {bitshiftExpanded ? 'Hide Bitshift Matrices' : 'Show Bitshift Matrices'}
              </Button>

              <Collapse in={bitshiftExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" color="primary">
                    Bitshift Matrices
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 200,
                      overflowY: 'auto',
                      p: 1,
                      bgcolor: '#fafafa',
                      borderRadius: 1,
                      mt: 1,
                    }}
                  >
                    {bitshiftMatrices.map((matrix, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Matrix {index + 1}:
                        </Typography>
                        {bitshiftHumanReadable ? (
                          matrix.map((row, rowIndex) => (
                            <Typography key={rowIndex} variant="body2">
                              {row.join(', ')}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2">
                            {JSON.stringify(matrix)}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Switch
                      checked={bitshiftHumanReadable}
                      onChange={handleToggleBitshiftFormat}
                      color="primary"
                    />
                    <Typography variant="body2">
                      {bitshiftHumanReadable ? 'Human-readable' : 'JSON Format'}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Tooltip title="Copy Human-readable Format" arrow>
                      <IconButton
                        onClick={() => handleCopyMatrices('human')}
                        color="primary"
                        sx={{ mr: 2 }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy Python Format" arrow>
                      <IconButton
                        onClick={() => handleCopyMatrices('python')}
                        color="primary"
                      >
                        <CodeIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Collapse>

              <Divider sx={{ my: 2 }} />

              {/* Copy All Data */}
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 2, textTransform: 'none' }}
                onClick={handleSpecialCopy}
              >
                Copy All Data
              </Button>
            </Paper>
          )}

          {/* Run Tests Section */}
          {testButtonVisible && (
            <Paper
              sx={{
                p: 3,
                bgcolor: '#ffffff',
                borderRadius: 2,
                mt: 3,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                onClick={handleTestEncryption}
                sx={{ textTransform: 'none' }}
              >
                Run Encryption Tests
              </Button>
            </Paper>
          )}

          {/* Show/Hide Test Results Section */}
          {showTestResultsButton && (
            <Paper
              sx={{
                p: 3,
                bgcolor: '#ffffff',
                borderRadius: 2,
                mt: 3,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={toggleTestSection}
                sx={{ textTransform: 'none' }}
              >
                {testSectionExpanded ? 'Hide Test Results' : 'Show Test Results'}
              </Button>

              <Collapse in={testSectionExpanded} timeout="auto" unmountOnExit>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {testResults &&
                    Object.entries(testResults).map(([testName, result]) => (
                      <Grid item xs={12} key={testName}>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: '#fafafa',
                            borderRadius: 1,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          }}
                        >
                          <Typography variant="h6" color="primary">
                            {testName.replace(/_/g, ' ')}
                          </Typography>

                          {/* Test Description */}
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Definition: </strong>
                            {testDescriptions[testName] || 'Unknown test'}
                          </Typography>

                          {/* Test Result */}
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            <strong>Result: </strong>
                            {typeof result === 'object'
                              ? Object.entries(result)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(', ')
                              : result}
                          </Typography>

                          {/* Desired Range */}
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Desired Range: </strong>
                            {desiredRanges[testName] || ''}
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
          <Paper
            sx={{
              p: 3,
              bgcolor: '#ffffff',
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Encryption Flow Visualization
            </Typography>
            <EncryptionFlow rounds={rounds} />
          </Paper>
        </Grid>
      </Grid>

      {/* Full Key Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: '#ffffff',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="primary">
              Full Encryption Key
            </Typography>
            <IconButton onClick={handleCloseModal} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography
            variant="body1"
            sx={{
              mt: 2,
              wordWrap: 'break-word',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {keyHumanReadable ? encryptionKey : stringToByteString(encryptionKey)}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Switch
              checked={keyHumanReadable}
              onChange={handleToggleKeyFormat}
              color="primary"
            />
            <Typography variant="body2">
              {keyHumanReadable ? 'Human-readable' : 'Bytes Format'}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              onClick={() => handleCopyKey(false)}
              variant="outlined"
              color="primary"
              sx={{ textTransform: 'none' }}
            >
              Copy Key
            </Button>
            <Button
              onClick={() => handleCopyKey(true)}
              variant="outlined"
              color="primary"
              sx={{ ml: 2, textTransform: 'none' }}
            >
              Copy Bytes Key
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Encrypted Text Modal */}
      <Modal
        open={isEncryptedTextModalOpen}
        onClose={handleCloseEncryptedTextModal}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: '#ffffff',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="primary">
              Full Encrypted Text
            </Typography>
            <IconButton onClick={handleCloseEncryptedTextModal} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography
            variant="body1"
            sx={{
              mt: 2,
              wordWrap: 'break-word',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {encryptedText}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              onClick={handleCopyEncryptedText}
              variant="outlined"
              color="primary"
              sx={{ textTransform: 'none' }}
            >
              Copy Encrypted Text
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Copy Format Dialog */}
      <Dialog open={openDialog} onClose={handleDialogCancel}>
        <DialogTitle>Select Copy Format</DialogTitle>
        <DialogContent>
          <Button
            onClick={() => handleDialogClose('human')}
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Copy Human-readable format
          </Button>
          <Button
            onClick={() => handleDialogClose('non-human')}
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Copy Bytes Format (for decryption)
          </Button>
          <Button
            onClick={() => handleDialogClose('input-encrypted')}
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ textTransform: 'none' }}
          >
            Copy Input Text and Encrypted Text (for brute force simulation)
          </Button>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogCancel}
            color="secondary"
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => {
          setSnackbarOpen(false);
          setSnackbarMessage('');
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => {
            setSnackbarOpen(false);
            setSnackbarMessage('');
          }}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EncryptPage;
