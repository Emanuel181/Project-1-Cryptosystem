import React, { useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Grid, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import anime from 'animejs';

function RoundStep({ round, index }) {
  useEffect(() => {
    anime({
      targets: `.round-${index} .matrix-cell`,
      backgroundColor: '#ffeb3b',
      duration: 500,
      easing: 'easeInOutQuad',
      delay: anime.stagger(100)
    });
  }, [index]);

  return (
    <Accordion className={`round-${index}`} sx={{ backgroundColor: `hsl(${index * 15}, 70%, 95%)`, marginTop: '10px' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Round {index + 1}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Tooltip title="Current text state in this encryption round" arrow>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Text State: <span className="matrix-cell" style={{ color: '#1a73e8' }}>{round.text_state}</span>
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Key character used for this round" arrow>
              <Typography className="key-character" variant="body2" sx={{ fontWeight: 'bold' }}>
                🔑 Key Character Used: <span className="matrix-cell" style={{ color: '#ff9800' }}>{round.key_character}</span>
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Character encrypted in this round" arrow>
              <Typography className="current-character" variant="body2" sx={{ fontWeight: 'bold' }}>
                🔒 Character Encrypted: <span className="matrix-cell" style={{ color: '#4caf50' }}>{round.current_character}</span>
              </Typography>
            </Tooltip>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

export default RoundStep;
