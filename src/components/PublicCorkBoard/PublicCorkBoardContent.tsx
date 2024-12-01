'use client';

import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  useTheme,
  CircularProgress,
} from '@mui/material';
import NoteList from './NoteList';
import NoteDialogs from './NoteDialogs';
import NoteActions from './NoteActions';
import usePublicCorkBoard from './usePublicCorkBoard';

const PublicCorkBoardContent: React.FC = () => {
  const theme = useTheme();
  const { isLoading } = usePublicCorkBoard();

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 500,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Card
        sx={{
          height: '100%',
          minHeight: 500,
          backgroundColor: '#D2B48C',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%),
            repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 4px)
          `,
          boxShadow: theme.shadows[3],
          borderRadius: 2,
          p: 2,
          position: 'relative',
          overflow: 'hidden',
          border: '12px solid #BC8F8F',
          touchAction: 'none',
        }}
      >
        <NoteList />
      </Card>

      <NoteDialogs />
      <NoteActions />
    </Box>
  );
};

export default PublicCorkBoardContent;
