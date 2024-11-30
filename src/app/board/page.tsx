'use client';

import React from 'react';
import { Box, Grid, useTheme } from '@mui/material';
import PublicCorkBoard from '../../components/PublicCorkBoard/index';
import ChatPanel from '../../components/ChatPanel';
import Hero from '../../components/Hero';

const BoardPage = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      <Hero />
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ 
              height: 'calc(100vh - 300px)', // Hero yüksekliği için ayarlama
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              overflow: 'hidden'
            }}>
              <PublicCorkBoard />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              height: 'calc(100vh - 300px)', // Hero yüksekliği için ayarlama
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <ChatPanel />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BoardPage;
