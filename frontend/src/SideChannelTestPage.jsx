import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function SideChannelTestPage() {
  const [inputText, setInputText] = useState('');
  const [testType, setTestType] = useState('timing');
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Reset testResults when testType changes
  useEffect(() => {
    setTestResults(null);
  }, [testType]);

  const handleStartTest = () => {
    if (!inputText) {
      setSnackbarMessage('Please provide input text for testing.');
      setOpenSnackbar(true);
      return;
    }

    setIsTesting(true);

    fetch('http://localhost:5000/api/side_channel_test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input_text: inputText, test_type: testType }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Received data:', data);
        if (data.error) {
          setSnackbarMessage(data.error);
          setOpenSnackbar(true);
        } else {
          // For 'all' test type, data.results is an object with each test type as keys
          if (testType === 'all') {
            setTestResults(data.results);
          } else {
            setTestResults(data.results[testType]);
          }
        }
        setIsTesting(false);
      })
      .catch((error) => {
        console.error('Error during side-channel test:', error);
        setSnackbarMessage('Error occurred during side-channel test.');
        setOpenSnackbar(true);
        setIsTesting(false);
      });
  };

  const handleReset = () => {
    setInputText('');
    setTestResults(null);
    setIsTesting(false);
    setSnackbarMessage('');
    setOpenSnackbar(false);
  };

  const renderChartForTest = (testKey, testData) => {
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: `${testKey.charAt(0).toUpperCase() + testKey.slice(1)} Analysis` },
      },
    };

    if (testKey === 'timing' || testKey === 'cache' || testKey === 'power' || testKey === 'hamming') {
      // Line chart for numerical array data
      return (
        <Paper
          key={testKey}
          sx={{
            p: 3,
            bgcolor: '#ffffff',
            borderRadius: 2,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            mt: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {testKey.charAt(0).toUpperCase() + testKey.slice(1)} Test Results
          </Typography>
          <Line
            data={{
              labels: testData.map((_, index) => index + 1),
              datasets: [
                {
                  label: 'Metric Value',
                  data: testData,
                  borderColor: '#4fc3f7',
                  fill: false,
                },
              ],
            }}
            options={chartOptions}
          />
        </Paper>
      );
    }

    if (testKey === 'memory') {
      // For memory test, we need to process the data appropriately
      // Since the data is a list of lists of memory stats, we'll aggregate the data
      const aggregatedStats = {};

      testData.forEach((attempt) => {
        attempt.forEach((stat) => {
          const line = stat.line || 'Unknown';
          if (!aggregatedStats[line]) {
            aggregatedStats[line] = {
              size: 0,
              count: 0,
            };
          }
          aggregatedStats[line].size += stat.size;
          aggregatedStats[line].count += stat.count;
        });
      });

      const labels = Object.keys(aggregatedStats);
      const sizes = labels.map((line) => aggregatedStats[line].size);
      const counts = labels.map((line) => aggregatedStats[line].count);

      return (
        <Paper
          key={testKey}
          sx={{
            p: 3,
            bgcolor: '#ffffff',
            borderRadius: 2,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            mt: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Memory Access Pattern Analysis
          </Typography>
          <Bar
            data={{
              labels: labels,
              datasets: [
                {
                  label: 'Total Memory Size (KB)',
                  data: sizes,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                },
                {
                  label: 'Total Allocations',
                  data: counts,
                  backgroundColor: 'rgba(153, 102, 255, 0.6)',
                  borderColor: 'rgba(153, 102, 255, 1)',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Memory Access Pattern Analysis' },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </Paper>
      );
    }

    // Fallback for unknown test types
    return null;
  };

  const renderCharts = () => {
    if (!testResults) {
      return (
        <Paper
          sx={{
            p: 3,
            bgcolor: '#ffffff',
            borderRadius: 2,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6">Please run the {testType} test to see results.</Typography>
        </Paper>
      );
    }

    if (testType === 'all') {
      // Render charts for all test results
      return Object.keys(testResults).map((key) => renderChartForTest(key, testResults[key]));
    } else {
      // Render chart for the selected test type
      return renderChartForTest(testType, testResults);
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
              Side-Channel Testing
            </Typography>

            <TextField
              label="Input Text"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              sx={{ mt: 2 }}
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="test-type-label">Select Test Type</InputLabel>
              <Select
                labelId="test-type-label"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                label="Select Test Type"
              >
                <MenuItem value="timing">Timing Analysis</MenuItem>
                <MenuItem value="cache">Cache Timing Analysis</MenuItem>
                <MenuItem value="power">Power Consumption Analysis</MenuItem>
                <MenuItem value="memory">Memory Access Pattern Analysis</MenuItem>
                <MenuItem value="hamming">Hamming Weight Analysis</MenuItem>
                <MenuItem value="all">All Tests</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleStartTest}
                disabled={isTesting || !inputText}
                sx={{ textTransform: 'none' }}
              >
                {isTesting ? <CircularProgress size={24} /> : 'Start Side-Channel Test'}
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
        </Grid>

        <Grid item xs={12} md={6}>
          {renderCharts()}
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SideChannelTestPage;
