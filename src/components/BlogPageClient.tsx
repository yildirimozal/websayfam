'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import Hero from '@/components/Hero';
import BlogList from '@/components/BlogList';
import { Add as AddIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  return (
    <>
      <Hero />
      <Box>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {isAdmin && (
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/blog/create')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Yeni Blog Yazısı
              </Button>
            </Box>
          )}
          
          {!blogs || blogs.length === 0 ? (
            <Typography variant="h6" textAlign="center" color="text.secondary">
              Henüz blog yazısı bulunmuyor.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              <BlogList blogs={blogs} isAdmin={isAdmin} />
            </Grid>
          )}
        </Container>
      </Box>
    </>
  );
}
