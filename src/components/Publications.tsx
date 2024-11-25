'use client';

import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Stack, useTheme } from '@mui/material';
import { Article as ArticleIcon } from '@mui/icons-material';

const publications = [
  {
    title: 'Yapay Zeka Destekli Öğrenme Sistemleri',
    journal: 'Bilişim Teknolojileri Dergisi',
    citations: 45,
    year: 2024,
    tags: ['Yapay Zeka', 'Eğitim Teknolojileri'],
  },
  {
    title: 'Derin Öğrenme Modellerinin Performans Analizi',
    journal: 'Veri Bilimi Dergisi',
    citations: 32,
    year: 2023,
    tags: ['Derin Öğrenme', 'Performans Analizi'],
  },
  {
    title: 'Doğal Dil İşleme Teknikleri ve Uygulamaları',
    journal: 'Yapay Zeka Araştırmaları',
    citations: 28,
    year: 2023,
    tags: ['NLP', 'Yapay Zeka'],
  },
];

const Publications = () => {
  const theme = useTheme();

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
          mb: 3,
          color: theme.palette.primary.main,
        }}
      >
        <ArticleIcon /> Yayınlar
      </Typography>

      <Stack spacing={3}>
        {publications.map((pub, index) => (
          <Card 
            key={index}
            sx={{ 
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {pub.title}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {pub.journal} • {pub.year}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {pub.citations} alıntı
              </Typography>
              <Stack direction="row" spacing={1} mt={2}>
                {pub.tags.map((tag, i) => (
                  <Chip 
                    key={i} 
                    label={tag} 
                    size="small"
                    sx={{ 
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
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
