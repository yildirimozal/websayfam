'use client';

import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface TimerProps {
  remainingTime: number;
  totalTime: number;
}

const Timer: React.FC<TimerProps> = ({ remainingTime, totalTime }) => {
  // Kalan süreyi saat, dakika ve saniye olarak hesapla
  const hours = Math.floor(remainingTime / (1000 * 60 * 60));
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

  // İlerleme yüzdesini hesapla
  const progress = (remainingTime / totalTime) * 100;

  // İlerleme çubuğunun rengini belirle
  const getColor = () => {
    if (progress > 66) return 'success';
    if (progress > 33) return 'warning';
    return 'error';
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minWidth: 200,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
        Pano Temizlenecek
      </Typography>
      <Typography variant="body1" sx={{ mb: 1, fontFamily: 'monospace' }}>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={getColor()}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          },
        }}
      />
      <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center', color: 'text.secondary' }}>
        {hours === 0 ? `${minutes} dakika ${seconds} saniye` : `${hours} saat ${minutes} dakika`}
      </Typography>
    </Box>
  );
};

export default Timer;
