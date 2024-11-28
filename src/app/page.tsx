'use client';

import { Box, Container, useTheme } from '@mui/material';
import Hero from '../components/Hero';
import AINewsFeed from '../components/AINewsFeed';
import Publications from '../components/Publications';
import Courses from '../components/Courses';
import Blog from '../components/Blog';
import CorkBoard from '../components/CorkBoard';
import YouTubePlaylist from '../components/YouTubePlaylist';

export default function Home() {
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
        {/* Cork Board and News Section */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Box 
            sx={{ 
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { 
                xs: '1fr',
                md: '7fr 5fr'
              }
            }}
          >
            <Box>
              <CorkBoard />
            </Box>
            <Box>
              <AINewsFeed />
            </Box>
          </Box>
        </Box>

        {/* Blog and YouTube Section */}
        <Box sx={{ mb: { xs: 4, md: 8 } }}>
          <Box 
            sx={{ 
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { 
                xs: '1fr',
                md: '7fr 5fr'
              }
            }}
          >
            <Box>
              <Blog />
            </Box>
            <Box>
              <YouTubePlaylist />
            </Box>
          </Box>
        </Box>

        {/* Publications Section */}
        <Box sx={{ mb: { xs: 4, md: 8 } }}>
          <Publications />
        </Box>

        {/* Courses Section */}
        <Box sx={{ mb: { xs: 4, md: 8 } }}>
          <Courses />
        </Box>
      </Container>
    </Box>
  );
}
