'use client';

import React from 'react';
import { Box, Card, useTheme, Fab, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface CorkBoardContainerProps {
  children: React.ReactNode;
  isLoading: boolean;
  error: string | null;
  onErrorClose: () => void;
  isAdmin: boolean;
  onAddClick: () => void;
  boardRef: React.RefObject<HTMLDivElement>;
}

export const CorkBoardContainer: React.FC<CorkBoardContainerProps> = ({
  children,
  isLoading,
  error,
  onErrorClose,
  isAdmin,
  onAddClick,
  boardRef,
}) => {
  const theme = useTheme();

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
        ref={boardRef}
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
        {children}
      </Card>

      {isAdmin && (
        <Fab 
          color="primary" 
          aria-label="add note"
          onClick={onAddClick}
          sx={{ 
            position: 'absolute',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={onErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={onErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};
