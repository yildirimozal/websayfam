'use client';

import React, { useState } from 'react';
import { Box, Grid, useTheme, IconButton, useMediaQuery, Drawer } from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import PublicCorkBoard from '../../components/PublicCorkBoard/index';
import ChatPanel from '../../components/ChatPanel';
import Hero from '../../components/Hero';

const BoardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const renderChatPanel = () => {
    if (isMobile) {
      return (
        <>
          <IconButton
            onClick={toggleChat}
            sx={{
              position: 'fixed',
              left: isChatOpen ? 'auto' : 16,
              right: isChatOpen ? 16 : 'auto',
              bottom: 16,
              zIndex: 1200,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              boxShadow: theme.shadows[3],
            }}
          >
            {isChatOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Drawer
            anchor="left"
            open={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            variant="temporary"
            PaperProps={{
              sx: {
                width: '85%',
                maxWidth: 360,
                backgroundColor: theme.palette.background.paper,
                height: '100%',
              }
            }}
          >
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <ChatPanel />
            </Box>
          </Drawer>
        </>
      );
    }

    return (
      <Grid item md={4}>
        <Box sx={{ 
          height: '80vh',
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
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      <Hero />
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ 
              height: '80vh',
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              overflow: 'hidden',
              position: 'relative'
            }}>
              <PublicCorkBoard />
            </Box>
          </Grid>
          {renderChatPanel()}
        </Grid>
      </Box>
    </Box>
  );
};

export default BoardPage;
