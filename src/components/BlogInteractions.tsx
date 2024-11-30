'use client';

import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Favorite, FavoriteBorder, Visibility } from '@mui/icons-material';

interface BlogInteractionsProps {
  blogId: string;
  initialLikes: string[];
  initialViews: number;
}

export default function BlogInteractions({ blogId, initialLikes = [], initialViews = 0 }: BlogInteractionsProps) {
  const theme = useTheme();
  const [likes, setLikes] = useState<string[]>(initialLikes);
  const [views, setViews] = useState<number>(initialViews);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // IP adresine göre beğeni durumunu kontrol et
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!blogId) return;

      try {
        console.log('Beğeni durumu kontrol ediliyor... Blog ID:', blogId);
        const response = await fetch(`/api/blogs/${blogId}/like`);
        
        if (!response.ok) {
          throw new Error('Beğeni durumu kontrol edilemedi');
        }

        const data = await response.json();
        console.log('Beğeni durumu yanıtı:', data);
        
        if (typeof data.hasLiked === 'boolean') {
          setIsLiked(data.hasLiked);
        }
        if (Array.isArray(data.likes)) {
          setLikes(data.likes);
        }
      } catch (error) {
        console.error('Beğeni durumu kontrol hatası:', error);
      }
    };

    checkLikeStatus();
  }, [blogId]);

  // Görüntülenme sayısını güncelle
  useEffect(() => {
    const updateViews = async () => {
      if (!blogId) return;

      try {
        console.log('Görüntülenme güncelleniyor... Blog ID:', blogId);
        const response = await fetch(`/api/blogs/${blogId}/view`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Görüntülenme güncellenemedi');
        }

        const data = await response.json();
        console.log('Görüntülenme yanıtı:', data);
        
        if (typeof data.views === 'number') {
          setViews(data.views);
        }
      } catch (error) {
        console.error('Görüntülenme güncelleme hatası:', error);
      }
    };

    updateViews();
  }, [blogId]);

  const handleLike = async () => {
    if (isLoading || !blogId) return;

    try {
      setIsLoading(true);
      console.log('Beğeni işlemi başlatılıyor... Blog ID:', blogId);
      
      const response = await fetch(`/api/blogs/${blogId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Beğeni işlemi başarısız oldu');
      }

      const data = await response.json();
      console.log('Beğeni işlemi yanıtı:', data);
      
      if (Array.isArray(data.likes)) {
        setLikes(data.likes);
      }
      if (typeof data.hasLiked === 'boolean') {
        setIsLiked(data.hasLiked);
      }
    } catch (error) {
      console.error('Beğeni hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 3,
      mt: 4,
      py: 2,
      borderTop: `1px solid ${theme.palette.divider}`,
      borderBottom: `1px solid ${theme.palette.divider}`
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton 
          onClick={handleLike}
          disabled={isLoading}
          sx={{ 
            color: isLiked ? theme.palette.error.main : theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(244, 67, 54, 0.08)'
                : 'rgba(244, 67, 54, 0.08)',
            }
          }}
        >
          {isLiked ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {likes.length} beğeni
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Visibility sx={{ color: theme.palette.text.secondary }} />
        <Typography variant="body2" color="text.secondary">
          {views} görüntülenme
        </Typography>
      </Box>
    </Box>
  );
}
