'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import BlogEditor from '@/components/BlogEditor';
import Hero from '@/components/Hero';

export default async function CreateBlogPage() {
  const session = await getServerSession();

  // Admin değilse ana sayfaya yönlendir
  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  return (
    <Box>
      <Hero />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Yeni Blog Yazısı Oluştur
        </Typography>
        <BlogEditor />
      </Container>
    </Box>
  );
}
