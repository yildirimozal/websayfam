'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Chip,
  styled
} from '@mui/material';
import { NewReleases, AutoAwesome } from '@mui/icons-material';

interface NewsItem {
  title: string;
  date: string;
  description: string;
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const NewsTitle = styled(Typography)({
  fontWeight: 600,
  fontSize: '1rem',
  marginBottom: '4px',
});

const NewsDescription = styled(Typography)({
  fontSize: '0.875rem',
  marginBottom: '4px',
});

const NewsDate = styled(Typography)({
  fontSize: '0.75rem',
});

const newsData: NewsItem[] = [
  {
    title: "OpenAI GPT-4V Görsel Yetenekleri Geliştirildi",
    date: "2024",
    description: "Yapay zeka modeli artık görselleri daha detaylı analiz edebiliyor."
  },
  {
    title: "Google Gemini Ultra Duyuruldu",
    date: "2024",
    description: "Google'ın en gelişmiş yapay zeka modeli kullanıma sunuldu."
  },
  {
    title: "AI Destekli Sağlık Teşhisleri",
    date: "2024",
    description: "Yapay zeka, hastalık teşhislerinde %95 doğruluk oranına ulaştı."
  },
  {
    title: "Otonom Araçlarda AI Gelişmeleri",
    date: "2024",
    description: "Yeni nesil sürücüsüz araçlar yapay zeka ile daha güvenli."
  }
];

const AINewsFeed: React.FC = () => {
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
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoAwesome sx={{ mr: 2 }} color="primary" />
            <Typography variant="h5">
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
          {newsData.map((news, index) => (
            <StyledListItem key={index}>
              <ListItemIcon>
                <AutoAwesome color="primary" />
              </ListItemIcon>
              <Box>
                <NewsTitle color="primary">
                  {news.title}
                </NewsTitle>
                <NewsDescription color="text.secondary">
                  {news.description}
                </NewsDescription>
                <NewsDate color="text.secondary">
                  {news.date}
                </NewsDate>
              </Box>
            </StyledListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default AINewsFeed;
