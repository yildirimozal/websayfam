'use client';

import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface TimerProps {
  remainingTime: number;
  totalTime: number;
}

const Timer: React.FC<TimerProps> = ({ remainingTime, totalTime }) => {
  // Kalan süreyi dakika ve saniye olarak hesapla
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);

  // İlerleme çubuğu için yüzde hesapla
  const progress = (remainingTime / totalTime) * 100;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: 200,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: '#2c1810' }}>
        Kalan Süre
      </Typography>
      <Typography variant="h4" sx={{ textAlign: 'center', color: '#2c1810', mb: 1 }}>
        {`${minutes}:${seconds.toString().padStart(2, '0')}`}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: progress < 30 ? '#f44336' : progress < 70 ? '#ff9800' : '#4caf50',
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};

export default Timer;
