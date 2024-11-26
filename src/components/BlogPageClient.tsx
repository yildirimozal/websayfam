'use client';

import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import Hero from '@/components/Hero';
import BlogList from '@/components/BlogList';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  slug: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
}

interface BlogPageClientProps {
  blogs: BlogPost[];
  isAdmin?: boolean;
}

export default function BlogPageClient({ blogs, isAdmin }: BlogPageClientProps) {
  if (!blogs || blogs.length === 0) {
    return (
      <>
        <Hero />
        <Box>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h6" textAlign="center" color="text.secondary">
              Henüz blog yazısı bulunmuyor.
            </Typography>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Hero />
      <Box>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <BlogList blogs={blogs} isAdmin={isAdmin} />
          </Grid>
        </Container>
      </Box>
    </>
  );
}
