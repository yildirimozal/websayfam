'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Chip,
  styled,
  Link,
  CircularProgress,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { NewReleases, Launch } from '@mui/icons-material';

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  source: string;
  createdAt: string;
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  '&:last-child': {
    borderBottom: 'none',
  },
  position: 'relative',
  minHeight: '150px',
  display: 'flex',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    minHeight: 'auto',
    gap: theme.spacing(1),
  },
}));

const NewsContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('sm')]: {
    order: 2,
  },
}));

const NewsImage = styled('img')(({ theme }) => ({
  width: '150px',
  height: '100px',
  borderRadius: theme.shape.borderRadius,
  objectFit: 'cover',
  flexShrink: 0,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    height: '180px',
    order: 1,
  },
}));

const NewsTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  marginBottom: '4px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  },
}));

const NewsDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  marginBottom: '4px',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
    WebkitLineClamp: 3,
  },
}));

const NewsDate = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: 'auto',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
    flexWrap: 'wrap',
  },
}));

const DISPLAY_COUNT = 3;
const ROTATION_INTERVAL = 8000; // 8 saniye
const FADE_DURATION = 1000; // 1 saniye
const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=AI+News';

const AINewsFeed: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [displayedNews, setDisplayedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeStates, setFadeStates] = useState<boolean[]>([true, true, true]);

  // Haberleri karıştır ve yeni 3 haber seç
  const rotateNews = () => {
    setFadeStates([false, false, false]);
    
    setTimeout(() => {
      const currentIds = new Set(displayedNews.map(news => news._id));
      const availableNews = allNews.filter(news => !currentIds.has(news._id));
      
      let newDisplayNews;
      if (availableNews.length >= DISPLAY_COUNT) {
        newDisplayNews = availableNews
          .sort(() => Math.random() - 0.5)
          .slice(0, DISPLAY_COUNT);
      } else {
        newDisplayNews = [...allNews]
          .sort(() => Math.random() - 0.5)
          .slice(0, DISPLAY_COUNT);
      }
      
      setDisplayedNews(newDisplayNews);
      setTimeout(() => {
        setFadeStates([true, true, true]);
      }, 100);
    }, FADE_DURATION);
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setAllNews(data);
        const initialNews = [...data]
          .sort(() => Math.random() - 0.5)
          .slice(0, DISPLAY_COUNT);
        setDisplayedNews(initialNews);
        setLoading(false);
      } catch (err) {
        setError('Haberler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (allNews.length > DISPLAY_COUNT) {
      const interval = setInterval(rotateNews, ROTATION_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [allNews, displayedNews]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DEFAULT_IMAGE;
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        mb: 4,
        boxShadow: 3,
        height: '100%',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease-in-out'
        }
      }}
    >
      <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant={isMobile ? "h6" : "h5"}>
              AI Güncel Haberler
            </Typography>
          </Box>
          <Chip
            icon={<NewReleases />}
            label="Güncel"
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
        <List disablePadding>
          {displayedNews.map((item, index) => (
            <Fade key={item._id} in={fadeStates[index]} timeout={FADE_DURATION}>
              <StyledListItem>
                <NewsContent>
                  <NewsTitle color="primary">
                    {item.title}
                    <Link href={item.url} target="_blank" rel="noopener noreferrer">
                      <Launch fontSize="small" />
                    </Link>
                  </NewsTitle>
                  <NewsDescription color="text.secondary">
                    {item.description}
                  </NewsDescription>
                  <NewsDate color="text.secondary">
                    {formatDate(item.publishedAt)}
                    <Chip
                      label={item.source}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </NewsDate>
                </NewsContent>
                <NewsImage
                  src={item.imageUrl || DEFAULT_IMAGE}
                  alt={item.title}
                  onError={handleImageError}
                />
              </StyledListItem>
            </Fade>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default AINewsFeed;
