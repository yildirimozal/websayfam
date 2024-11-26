import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/config';
import Hero from '@/components/Hero';
import dynamic from 'next/dynamic';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';

const BlogList = dynamic(() => import('@/components/BlogList'), {
  ssr: true
});

async function getBlogs() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const query = session?.user?.isAdmin ? {} : { published: true };
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(blogs));
  } catch (error) {
    console.error('Blog getirme hatası:', error);
    return [];
  }
}

export default async function BlogPage() {
  const blogs = await getBlogs();
  const session = await getServerSession(authOptions);

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
            <BlogList blogs={blogs} isAdmin={session?.user?.isAdmin} />
          </Grid>
        </Container>
      </Box>
    </>
  );
}
