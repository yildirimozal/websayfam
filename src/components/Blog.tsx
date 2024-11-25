'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  useTheme,
  Avatar,
  CircularProgress
} from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import NextLink from 'next/link';

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
  summary?: string;
}

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        mb: 3,
        width: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Sol Taraf - Yazar Bilgisi */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src="/profile.jpg"
                sx={{ 
                  width: 40, 
                  height: 40,
                  mr: 1.5,
                  border: `2px solid ${theme.palette.primary.main}`
                }}
              />
              <Box>
                <Typography 
                  variant="subtitle1"
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    lineHeight: 1.2
                  }}
                >
                  {post.author.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(post.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">·</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary }} />
                    <Typography variant="caption" color="text.secondary">
                      {Math.ceil(post.content.length / 1000)} dk
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Sağ Taraf - Blog İçeriği */}
          <Grid item xs={12}>
            <NextLink href={`/blog/${post.slug}`} passHref style={{ textDecoration: 'none' }}>
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 2,
                  '&:hover': {
                    color: theme.palette.primary.main
                  }
                }}
              >
                {post.title}
              </Typography>
            </NextLink>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                lineHeight: 1.6,
                fontSize: '1.1rem'
              }}
            >
              {post.content.substring(0, 200)}...
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2
            }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {post.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="medium"
                    sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(144, 202, 249, 0.08)'
                        : 'rgba(25, 118, 210, 0.08)',
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(144, 202, 249, 0.16)'
                          : 'rgba(25, 118, 210, 0.16)',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const Blog: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) {
          throw new Error('Bloglar yüklenirken hata oluştu');
        }
        const data = await response.json();
        setBlogs(data.filter((blog: BlogPost) => blog.published));
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

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      {blogs.map((post) => (
        <BlogCard key={post._id} post={post} />
      ))}
    </Box>
  );
};

export default Blog;
