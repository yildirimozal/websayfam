'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, useTheme } from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    const incrementVisitCount = async () => {
      try {
        const response = await fetch('/api/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setVisitCount(data.totalVisits);
        }
      } catch (error) {
        console.error('Ziyaret sayısı güncellenirken hata:', error);
      }
    };

    const getVisitCount = async () => {
      try {
        const response = await fetch('/api/visits');
        if (response.ok) {
          const data = await response.json();
          setVisitCount(data.totalVisits);
        }
      } catch (error) {
        console.error('Ziyaret sayısı alınırken hata:', error);
      }
    };

    incrementVisitCount();
    
    // Her 30 saniyede bir ziyaret sayısını güncelle
    const interval = setInterval(getVisitCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
          >
            Copyright © {new Date().getFullYear()} Özal Yıldırım
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <VisibilityIcon
              sx={{
                fontSize: '1rem',
                color: theme.palette.text.secondary,
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {visitCount.toLocaleString()} ziyaret
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
