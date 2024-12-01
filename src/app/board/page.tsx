'use client';

import React, { useState } from 'react';
import { Box, Grid, useTheme, IconButton, useMediaQuery, Drawer, Badge } from '@mui/material';
import { Chat as ChatIcon, Close as CloseIcon, ChatBubbleOutline as ChatBubbleOutlineIcon } from '@mui/icons-material';
import PublicCorkBoard from '../../components/PublicCorkBoard/index';
import ChatPanel from '../../components/ChatPanel';
import Hero from '../../components/Hero';

const BoardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasNewMessages] = useState(true); // Örnek olarak true ayarlandı

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
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
          {!isMobile && (
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
          )}
        </Grid>
      </Box>

      {/* Mobil Chat Toggle Butonu */}
      {isMobile && (
        <>
          <Badge
            color="error"
            variant="dot"
            invisible={!hasNewMessages || isChatOpen}
            sx={{
              position: 'fixed',
              left: isChatOpen ? 'auto' : 16,
              right: isChatOpen ? 16 : 'auto',
              bottom: 16,
              zIndex: 1200,
            }}
          >
            <IconButton
              onClick={toggleChat}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                boxShadow: theme.shadows[3],
                width: 56,
                height: 56,
                '& .MuiSvgIcon-root': {
                  fontSize: 28
                }
              }}
            >
              {isChatOpen ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
            </IconButton>
          </Badge>

          {/* Mobil Chat Drawer */}
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
      )}
    </Box>
  );
};

export default BoardPage;
