'use client';

import React from 'react';
import { Box, Typography, Card, CardContent, Grid, useTheme, Chip, Stack } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

const courses = [
  {
    code: 'CSE101',
    title: 'Bilgisayar Mühendisliğine Giriş',
    semester: 'Güz',
    level: 'Lisans',
    tags: ['Programlama', 'Algoritma'],
  },
  {
    code: 'CSE301',
    title: 'Yapay Zeka ve Makine Öğrenmesi',
    semester: 'Bahar',
    level: 'Lisans',
    tags: ['Yapay Zeka', 'Python'],
  },
  {
    code: 'CSE501',
    title: 'İleri Derin Öğrenme',
    semester: 'Güz',
    level: 'Lisansüstü',
    tags: ['Derin Öğrenme', 'PyTorch'],
  },
];

const Courses = () => {
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
        <SchoolIcon /> Dersler
      </Typography>

      <Grid container spacing={3}>
        {courses.map((course, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {course.title}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {course.code}
                  </Typography>
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {course.semester} Dönemi • {course.level}
                </Typography>
                <Stack direction="row" spacing={1} mt={2}>
                  {course.tags.map((tag, i) => (
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Courses;
