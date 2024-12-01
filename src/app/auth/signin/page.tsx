'use client';

import { signIn } from 'next-auth/react';
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

export default function SignIn() {
  const theme = useTheme();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Typography component="h1" variant="h4">
          Kullanıcı Girişi
        </Typography>
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={() => signIn('google', { callbackUrl: '/' })}
          sx={{
            backgroundColor: '#4285f4',
            '&:hover': {
              backgroundColor: '#357abd',
            },
            px: 4,
            py: 1.5,
          }}
        >
          Google ile Giriş Yap
        </Button>
      </Box>
    </Container>
  );
}
