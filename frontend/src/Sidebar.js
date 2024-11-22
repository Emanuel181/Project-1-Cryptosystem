import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  Tooltip,
  Collapse,
  IconButton,
  TextField,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faLock,
    faUnlock,
    faInfoCircle,
    faSearch,
    faUserCircle,
    faHammer,
    faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Sidebar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(true);

  const isActive = (path) => window.location.pathname === path;

  return (
<Box
  sx={{
    width: isCollapsed ? 80 : 280,
    height: '100vh',
    bgcolor: '#1e1e2d',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    p: 2,
    boxShadow: '4px 0 10px rgba(0, 0, 0, 0.5)',
    transition: 'width 0.3s ease',
    overflowY: 'auto', // Enables vertical scrolling
    overflowX: 'hidden', // Prevents horizontal scrolling
  }}
>

      {/* Top Section: Encryption Suite, Search Bar, and Operations */}
      <Box>
        {/* Collapsible Icon */}
        <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
          <Tooltip title={isCollapsed ? 'Expand' : 'Collapse'} placement="right" arrow>
            <IconButton
              onClick={() => setIsCollapsed(!isCollapsed)}
              sx={{
                color: '#4fc3f7',
                '&:hover': { bgcolor: '#3c3d4e' },
              }}
            >
              <FontAwesomeIcon icon={faBars} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Encryption Suite Title */}
        {!isCollapsed && (
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#4fc3f7',
            }}
          >
            Encryption Suite
          </Typography>
        )}

        {/* Search Bar */}
        {!isCollapsed && (
          <TextField
            placeholder="Search..."
            variant="outlined"
            fullWidth
            sx={{
              mb: 3,
              bgcolor: 'rgba(43, 45, 59, 0.8)',
              borderRadius: 1,
              '&:hover': { bgcolor: 'rgba(43, 45, 59, 1)' },
            }}
            InputProps={{
              startAdornment: (
                <FontAwesomeIcon icon={faSearch} style={{ marginRight: '8px', color: '#4fc3f7' }} />
              ),
              sx: { color: '#fff' },
            }}
          />
        )}

        {/* Operations Section */}
        <Box>
          <Tooltip title="Operations" placement="right" arrow disableHoverListener={!isCollapsed}>
            <Button
              onClick={() => setOperationsOpen(!operationsOpen)}
              endIcon={
                !isCollapsed &&
                (operationsOpen ? (
                  <FontAwesomeIcon icon={faUnlock} />
                ) : (
                  <FontAwesomeIcon icon={faLock} />
                ))
              }
              sx={{
                justifyContent: isCollapsed ? 'center' : 'space-between',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              {!isCollapsed && 'Operations'}
            </Button>
          </Tooltip>
          <Collapse in={operationsOpen && !isCollapsed}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                startIcon={!isCollapsed && <FontAwesomeIcon icon={faLock} />}
                onClick={() => navigate('/')}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  backgroundColor: isActive('/') ? '#4fc3f7' : '#2b2d3b',
                  color: isActive('/') ? '#1e1e2d' : '#fff',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'medium',
                  '&:hover': { backgroundColor: '#3c3d4e' },
                }}
              >
                {!isCollapsed && 'Encrypt'}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                startIcon={!isCollapsed && <FontAwesomeIcon icon={faUnlock} />}
                onClick={() => navigate('/decrypt')}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  backgroundColor: isActive('/decrypt') ? '#4fc3f7' : '#2b2d3b',
                  color: isActive('/decrypt') ? '#1e1e2d' : '#fff',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'medium',
                  '&:hover': { backgroundColor: '#3c3d4e' },
                }}
              >
                {!isCollapsed && 'Decrypt'}
              </Button>
            </motion.div>
               {/* Brute Force Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                startIcon={!isCollapsed && <FontAwesomeIcon icon={faHammer} />}
                onClick={() => navigate('/bruteforce')}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  backgroundColor: isActive('/bruteforce') ? '#4fc3f7' : '#2b2d3b',
                  color: isActive('/bruteforce') ? '#1e1e2d' : '#fff',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'medium',
                  '&:hover': { backgroundColor: '#3c3d4e' },
                }}
              >
                {!isCollapsed && 'Brute Force'}
              </Button>
            </motion.div>
              {/* Side Channel Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                startIcon={!isCollapsed && <FontAwesomeIcon icon={faChartLine} />}
                onClick={() => navigate('/sidechannel')}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  backgroundColor: isActive('/sidechannel') ? '#4fc3f7' : '#2b2d3b',
                  color: isActive('/sidechannel') ? '#1e1e2d' : '#fff',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'medium',
                  '&:hover': { backgroundColor: '#3c3d4e' },
                }}
              >
                {!isCollapsed && 'Side Channel'}
              </Button>
            </motion.div>
          </Collapse>
        </Box>
      </Box>

      {/* Bottom Section: About and Profile */}
      <Box>
        <Divider sx={{ my: 2, backgroundColor: '#333' }} />
        <Tooltip title="About" placement="right" arrow disableHoverListener={!isCollapsed}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              startIcon={!isCollapsed && <FontAwesomeIcon icon={faInfoCircle} />}
              onClick={() => navigate('/about')}
              fullWidth
              sx={{
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                backgroundColor: isActive('/about') ? '#4fc3f7' : '#2b2d3b',
                color: isActive('/about') ? '#1e1e2d' : '#fff',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'medium',
                '&:hover': { backgroundColor: '#3c3d4e' },
              }}
            >
              {!isCollapsed && 'About'}
            </Button>
          </motion.div>

        </Tooltip>

        <Collapse in={!isCollapsed}>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <FontAwesomeIcon
              icon={faUserCircle}
              size="3x"
              style={{
                color: '#4fc3f7',
                textShadow: '0px 4px 8px rgba(79, 195, 247, 0.8)',
              }}
            />
            <Typography
              variant="body1"
              sx={{
                mt: 1,
                fontWeight: 'medium',
                color: '#fff',
                textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              John Doe
            </Typography>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => console.log('Logging out...')}
                variant="outlined"
                color="secondary"
                size="small"
                sx={{
                  mt: 1,
                  textTransform: 'none',
                  boxShadow: '0px 4px 10px rgba(255, 99, 71, 0.3)',
                  '&:hover': {
                    backgroundColor: '#ff6347',
                    color: '#fff',
                    boxShadow: '0px 4px 15px rgba(255, 99, 71, 0.5)',
                  },
                }}
              >
                Logout
              </Button>
            </motion.div>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}

export default Sidebar;
