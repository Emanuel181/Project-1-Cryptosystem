import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import Chart from './Chart'; // Placeholder for chart components

function DashboardContent() {
  return (
    <Box sx={{ p: 3, bgcolor: '#28293d', color: '#fff', flex: 1 }}>
      <Typography variant="h5" gutterBottom>Overview</Typography>
      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#1e1e2d', borderRadius: 2 }}>
            <Typography variant="h6">Users</Typography>
            <Typography variant="h4">14k</Typography>
            <Typography variant="caption" color="success.main">+25% Last 30 days</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#1e1e2d', borderRadius: 2 }}>
            <Typography variant="h6">Conversions</Typography>
            <Typography variant="h4">325</Typography>
            <Typography variant="caption" color="error.main">-25% Last 30 days</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#1e1e2d', borderRadius: 2 }}>
            <Typography variant="h6">Event Count</Typography>
            <Typography variant="h4">200k</Typography>
            <Typography variant="caption" color="info.main">+5% Last 30 days</Typography>
          </Paper>
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#1e1e2d', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Sessions</Typography>
            <Chart /> {/* Placeholder for Line Chart */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#1e1e2d', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Page views and downloads</Typography>
            <Chart /> {/* Placeholder for Bar Chart */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardContent;
