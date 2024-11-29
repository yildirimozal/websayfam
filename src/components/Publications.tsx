'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Stack, 
  useTheme, 
  CircularProgress,
  Link,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Article as ArticleIcon,
  School as SchoolIcon,
  LocalLibrary as LibraryIcon,
  Timeline as TimelineIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import type { Publication } from '@/lib/scholar';

const Publications = () => {
  const theme = useTheme();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch('/api/publications');
        if (!response.ok) {
          throw new Error('Yayınlar alınamadı');
        }
        const data = await response.json();
        setPublications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography 
        variant="h4" 
        component="h2" 
        gutterBottom
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 4,
          color: theme.palette.primary.main,
          fontWeight: 600,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: '60px',
            height: '4px',
            backgroundColor: theme.palette.primary.main,
            borderRadius: '2px'
          }
        }}
      >
        <ArticleIcon /> Akademik Yayınlar
      </Typography>

      <Stack spacing={3}>
        {publications.map((pub, index) => (
          <Card 
            key={index}
            sx={{ 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
                '& .publication-icons': {
                  opacity: 1
                }
              },
              position: 'relative',
              overflow: 'visible'
            }}
          >
            <CardContent sx={{ position: 'relative' }}>
              <Box 
                className="publication-icons"
                sx={{ 
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  display: 'flex',
                  gap: 1,
                  opacity: 0.6,
                  transition: 'opacity 0.3s ease'
                }}
              >
                <Tooltip title="Google Scholar'da Görüntüle">
                  <IconButton 
                    component="a" 
                    href={pub.url} 
                    target="_blank"
                    size="small"
                    sx={{ 
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark
                      }
                    }}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Link
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                color="inherit"
                sx={{
                  display: 'block',
                  mb: 2,
                  '&:hover': {
                    color: theme.palette.primary.main
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  component="h3"
                  sx={{ 
                    fontWeight: 500,
                    lineHeight: 1.4,
                    mb: 1
                  }}
                >
                  {pub.title}
                </Typography>
              </Link>

              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center" 
                sx={{ 
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SchoolIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {pub.journal}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimelineIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {pub.year}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LibraryIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {pub.citations} alıntı
                  </Typography>
                </Box>
              </Stack>

              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                {pub.journal.split(' ').map((tag, i) => (
                  <Chip 
                    key={i} 
                    label={tag} 
                    size="small"
                    sx={{ 
                      backgroundColor: `${theme.palette.primary.main}15`,
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.main}25`,
                      }
                    }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Publications;
