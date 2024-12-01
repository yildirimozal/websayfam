'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Container } from '@mui/material';
import { useParams, redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BlogEditor from '@/components/BlogEditor';
import Hero from '@/components/Hero';

export default function EditBlogPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Admin değilse ana sayfaya yönlendir
    if (!session?.user?.isAdmin) {
      redirect('/');
    }

    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${params.id}`);
        if (!response.ok) {
          throw new Error('Blog yüklenirken hata oluştu');
        }
        const data = await response.json();
        setBlog(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Beklenmeyen bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBlog();
    }
  }, [params.id, session]);

  if (loading) {
    return (
      <>
        <Hero />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Hero />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <Box>
      <Hero />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Blog Yazısını Düzenle
        </Typography>
        <BlogEditor initialData={blog} />
      </Container>
    </Box>
  );
}
