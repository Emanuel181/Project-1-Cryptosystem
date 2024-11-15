import React, { useState } from 'react';
import ReactFlow, { Background, Controls } from 'react-flow-renderer';
import { Typography, Box, Modal, Paper, IconButton, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import Particles from 'react-tsparticles';

function EncryptionFlow({ rounds }) {
  const [selectedStep, setSelectedStep] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Open modal with selected round details
  const handleNodeClick = (round) => {
    setSelectedStep(round);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStep(null);
  };

  // Generate nodes for all rounds with sequential numbering
  const nodes = rounds.map((round, index) => ({
    id: `${index}`,
    data: {
      label: (
        <div
          onClick={() => handleNodeClick(round)}
          style={{
            cursor: 'pointer',
            padding: '20px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          <Typography
            variant="h6"
            style={{
              color: '#e0e0e0',
              fontWeight: 'bold',
              fontSize: '18px',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
              marginBottom: '8px',
            }}
          >
            Block {index + 1}
          </Typography>
          <div style={{ fontSize: '14px', color: '#f0f0f0', lineHeight: '1.4' }}>
            Current Block: {round.current_character || 'N/A'}
          </div>
          <div style={{ fontSize: '14px', color: '#f0f0f0', lineHeight: '1.4' }}>
            Sub-key Used: {round.key_character || 'N/A'}
          </div>
          <div style={{ fontSize: '14px', color: '#f0f0f0', lineHeight: '1.4' }}>
            Encrypted State: {round.text_state || 'N/A'}
          </div>
          <div style={{ marginTop: '10px', color: '#4fc3f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ExpandMoreIcon />
            <Typography variant="caption" style={{ marginLeft: '4px', color: '#4fc3f7' }}>Click to expand</Typography>
          </div>
        </div>
      ),
    },
    position: { x: 50 + index * 200, y: 100 + (index % 2) * 250 },
    style: {
      background: `rgba(40, 40, 60, 0.95)`,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 0 10px rgba(255,255,255,0.2), 0 0 10px rgba(79, 195, 247, 0.6)',
      width: 250,
      height: 180,
      padding: '10px',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
  }));

  const edges = rounds.slice(1).map((_, index) => ({
    id: `e${index}-${index + 1}`,
    source: `${index}`,
    target: `${index + 1}`,
    type: 'smoothstep',
    animated: true,
    style: {
      stroke: '#4fc3f7',
      strokeWidth: 2,
      strokeDasharray: '5 5',
    },
    markerEnd: {
      type: 'arrowclosed',
      color: '#4fc3f7',
    },
  }));

  const particleOptions = {
    particles: {
      number: { value: 40 },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: { value: 0.1 },
      size: { value: { min: 1, max: 3 } },
      move: { enable: true, speed: 0.3, direction: 'none', random: true, outMode: 'bounce' },
    },
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '700px',
        maxWidth: '90%',
        width: '100%',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #222738, #181c27)',
        overflowX: 'auto',
        borderRadius: '15px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      <Particles options={particleOptions} style={{ position: 'absolute', top: 0, left: 0, zIndex: -1, width: '100%', height: '100%' }} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        snapToGrid={true}
        snapGrid={[20, 20]}
        nodesDraggable={false}
        style={{ height: '100%', width: '100%' }}
      >
        <Background color="#4fc3f7" gap={20} style={{ opacity: 0.2 }} />
        <Controls />
      </ReactFlow>

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            p: 4,
            borderRadius: 2,
            backgroundColor: '#1e1e2d',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Block {selectedStep ? selectedStep.round + 1 : ''} Details</Typography>
            <IconButton onClick={handleCloseModal} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body1" mb={1}>Current Block: {selectedStep?.current_character || 'N/A'}</Typography>
          <Typography variant="body1" mb={1}>Sub-key Used: {selectedStep?.key_character || 'N/A'}</Typography>
          <Typography variant="body1" mb={1}>Encrypted State: {selectedStep?.text_state || 'N/A'}</Typography>
          <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleCloseModal}>
            Close
          </Button>
        </Paper>
      </Modal>
    </div>
  );
}

export default EncryptionFlow;
