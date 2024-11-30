'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Avatar, Chip, useTheme, Divider, CircularProgress, Button } from '@mui/material';
import { AccessTime, Home } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import BlogInteractions from '@/components/BlogInteractions';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <CircularProgress />
});

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  slug: string;
  tags: string[];
  category: string;
  published: boolean;
  views: number;
  likes: string[];
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
}

export default function BlogPost() {
  const theme = useTheme();
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!params.slug) return;

      try {
        console.log('Blog yazısı yükleniyor... Slug:', params.slug);
        const response = await fetch(`/api/blogs?slug=${params.slug}`);
        
        if (!response.ok) {
          throw new Error('Blog yazısı yüklenirken hata oluştu');
        }
        
        const data = await response.json();
        console.log('Blog yazısı yanıtı:', data);
        setPost(data);
      } catch (err) {
        console.error('Blog yazısı yükleme hatası:', err);
        setError(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [params.slug]);

  if (loading) {
    return (
      <Box sx={{ 
        py: 8, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" color="error">
            {error || 'Blog yazısı bulunamadı'}
          </Typography>
        </Container>
      </Box>
    );
  }

  const {
    _id,
    title,
    content,
    tags,
    views,
    likes,
    createdAt,
    author
  } = post;

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        {/* Ana Sayfa Butonu */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={() => router.push('/')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
              }
            }}
          >
            Ana Sayfaya Dön
          </Button>
        </Box>

        {/* Yazar Bilgisi */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar 
            src="/profile.jpg"
            sx={{ 
              width: 56, 
              height: 56,
              mr: 2,
              border: `2px solid ${theme.palette.primary.main}`
            }}
          />
          <Box>
            <Typography 
              variant="h6"
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5
              }}
            >
              {author.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {new Date(createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">·</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                <Typography variant="body2" color="text.secondary">
                  {Math.ceil(content.split(' ').length / 200)} dk okuma
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Blog Başlığı */}
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            mb: 3,
            color: theme.palette.text.primary,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          {title}
        </Typography>

        {/* Etiketler */}
        <Box sx={{ mb: 4 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              sx={{ 
                mr: 1,
                mb: 1,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(144, 202, 249, 0.08)'
                  : 'rgba(25, 118, 210, 0.08)',
                color: theme.palette.primary.main,
                fontWeight: 500,
                fontSize: '0.9rem',
                height: 32
              }}
            />
          ))}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Blog İçeriği */}
        <Box sx={{ 
          '& p': { 
            mb: 2.5,
            lineHeight: 1.8,
            fontSize: '1.125rem',
            color: theme.palette.text.primary
          },
          '& h2': {
            mt: 4,
            mb: 2,
            fontWeight: 700,
            fontSize: '1.75rem',
            color: theme.palette.text.primary
          },
          '& h3': {
            mt: 3,
            mb: 2,
            fontWeight: 600,
            fontSize: '1.5rem',
            color: theme.palette.text.primary
          },
          '& ul, & ol': {
            mt: 0,
            mb: 2.5,
            pl: 4,
            '& li': {
              mb: 1,
              fontSize: '1.125rem',
              color: theme.palette.text.primary
            }
          },
          '& blockquote': {
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            pl: 3,
            py: 1,
            my: 3,
            fontStyle: 'italic',
            bgcolor: theme.palette.mode === 'dark' 
              ? 'rgba(144, 202, 249, 0.08)'
              : 'rgba(25, 118, 210, 0.08)'
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 1,
            my: 2
          },
          '& code': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(144, 202, 249, 0.08)'
              : 'rgba(25, 118, 210, 0.08)',
            padding: '2px 6px',
            borderRadius: 1,
            fontSize: '0.9em',
            fontFamily: 'monospace'
          },
          '& pre': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(144, 202, 249, 0.08)'
              : 'rgba(25, 118, 210, 0.08)',
            padding: 2,
            borderRadius: 1,
            overflow: 'auto',
            '& code': {
              backgroundColor: 'transparent',
              padding: 0
            }
          }
        }}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </Box>

        {/* Blog Etkileşimleri */}
        <BlogInteractions 
          blogId={_id}
          initialLikes={likes}
          initialViews={views}
        />
      </Container>
    </Box>
  );
}
