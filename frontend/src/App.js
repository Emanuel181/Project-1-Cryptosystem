import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import EncryptPage from './EncryptPage';
import DecryptPage from './DecryptPage';
import Sidebar from './Sidebar';
import {Box} from "@mui/material";
import About from './About';

function App() {
  return (
    <Router>
      <Box display="flex" height="100vh" bgcolor="#1e1e2d">
        <Sidebar />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/encrypt" element={<EncryptPage />} />
            <Route path="/" element={<Navigate to="/encrypt" />} />  {/* Redirect root to /encrypt */}
            <Route path="/decrypt" element={<DecryptPage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
