import React from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: 250, bgcolor: '#1e1e2d', color: '#fff', height: '100vh', p: 2 }}>
      <Typography variant="h6" gutterBottom>Dashboard</Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        {/* Encrypt Button (redirects to root page) */}
        <Button
          startIcon={<FontAwesomeIcon icon={faLock} color="#4fc3f7" />}
          onClick={() => navigate('/')}
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            color: '#fff',
            textTransform: 'none',
            backgroundColor: '#2b2d3b',
            '&:hover': { backgroundColor: '#3c3d4e' },
          }}
        >
          Encrypt
        </Button>

        {/* Decrypt Button */}
        <Button
          startIcon={<FontAwesomeIcon icon={faUnlock} color="#4fc3f7" />}
          onClick={() => navigate('/decrypt')}
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            color: '#fff',
            textTransform: 'none',
            backgroundColor: '#2b2d3b',
            '&:hover': { backgroundColor: '#3c3d4e' },
          }}
        >
          Decrypt
        </Button>

        {/* About Button */}
        <Button
          onClick={() => navigate('/about')}
          startIcon={<FontAwesomeIcon icon={faInfoCircle} color="#4fc3f7" />}
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            color: '#fff',
            textTransform: 'none',
            backgroundColor: '#2b2d3b',
            '&:hover': { backgroundColor: '#3c3d4e' },
          }}
        >
          About
        </Button>
      </Box>
      <Divider sx={{ my: 2, backgroundColor: '#333' }} />
    </Box>
  );
}

export default Sidebar;
