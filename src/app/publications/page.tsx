'use client';

import { Box, Container, useTheme } from '@mui/material';
import Publications from '@/components/Publications';
import Hero from '@/components/Hero';

export default function PublicationsPage() {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        transition: 'background-color 0.3s ease-in-out'
      }}
    >
      <Hero />
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: { xs: 4, md: 6 },
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Publications />
      </Container>
    </Box>
  );
}
