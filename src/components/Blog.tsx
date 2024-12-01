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
  CircularProgress,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { AccessTime, Visibility, Favorite } from '@mui/icons-material';
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
  views: number;
  likes: string[];
}

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery('(max-width:320px)');
  const isSmScreen = useMediaQuery('(max-width:375px)');
  
  return (
    <Card 
      sx={{ 
        mb: { xs: 2, sm: 3 },
        width: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2}>
          {/* Sol Taraf - Yazar Bilgisi */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: { xs: 1.5, sm: 2 },
              flexDirection: isXsScreen ? 'column' : 'row',
              gap: isXsScreen ? 1 : 0
            }}>
              <Avatar 
                src="/profile.jpg"
                sx={{ 
                  width: { xs: 32, sm: 40 }, 
                  height: { xs: 32, sm: 40 },
                  mr: isXsScreen ? 0 : 1.5,
                  border: `2px solid ${theme.palette.primary.main}`
                }}
              />
              <Box sx={{ textAlign: isXsScreen ? 'center' : 'left' }}>
                <Typography 
                  variant={isSmScreen ? "subtitle2" : "subtitle1"}
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    lineHeight: 1.2
                  }}
                >
                  {post.author.name}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  justifyContent: isXsScreen ? 'center' : 'flex-start',
                  flexWrap: 'wrap'
                }}>
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
                variant={isSmScreen ? "h6" : "h5"}
                component="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: {
                    xs: '1.1rem',
                    sm: '1.25rem',
                    md: '1.5rem'
                  },
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
                mb: { xs: 1.5, sm: 2 },
                lineHeight: 1.6,
                fontSize: {
                  xs: '0.875rem',
                  sm: '1rem',
                  md: '1.1rem'
                },
                display: '-webkit-box',
                WebkitLineClamp: isXsScreen ? 2 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {post.content.substring(0, isXsScreen ? 100 : 200)}...
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: { xs: 1.5, sm: 2 },
              flexDirection: isXsScreen ? 'column' : 'row',
              gap: isXsScreen ? 1 : 0
            }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 0.5,
                flexWrap: 'wrap',
                justifyContent: isXsScreen ? 'center' : 'flex-start',
                width: isXsScreen ? '100%' : 'auto'
              }}>
                {post.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size={isSmScreen ? "small" : "medium"}
                    sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(144, 202, 249, 0.08)'
                        : 'rgba(25, 118, 210, 0.08)',
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      fontSize: {
                        xs: '0.75rem',
                        sm: '0.875rem'
                      },
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(144, 202, 249, 0.16)'
                          : 'rgba(25, 118, 210, 0.16)',
                      }
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                justifyContent: isXsScreen ? 'center' : 'flex-end',
                width: isXsScreen ? '100%' : 'auto'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton size={isSmScreen ? "small" : "medium"} disabled>
                    <Visibility fontSize={isSmScreen ? "small" : "medium"} />
                  </IconButton>
                  <Typography variant="caption" color="text.secondary">
                    {post.views || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton size={isSmScreen ? "small" : "medium"} disabled>
                    <Favorite fontSize={isSmScreen ? "small" : "medium"} />
                  </IconButton>
                  <Typography variant="caption" color="text.secondary">
                    {post.likes?.length || 0}
                  </Typography>
                </Box>
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
  const isXsScreen = useMediaQuery('(max-width:320px)');

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
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      px: { 
        xs: isXsScreen ? 1 : 2, 
        sm: 3 
      } 
    }}>
      {blogs.map((post) => (
        <BlogCard key={post._id} post={post} />
      ))}
    </Box>
  );
};

export default Blog;
