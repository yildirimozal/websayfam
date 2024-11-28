'use client';

import { Box, Paper, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FavoriteVideo {
  _id: string;
  videoId: string;
  title: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

export default function YouTubePlaylist() {
  const [videos, setVideos] = useState<FavoriteVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // Animasyonları tetiklemek için key

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/favorite-videos');
      const data = await response.json();
      setVideos(data);
      setIsLoading(false);
      setKey(prev => prev + 1); // Her veri çekişinde key'i güncelle
    } catch (error) {
      console.error('Videolar alınırken hata:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    // Her 30 saniyede bir videoları yenile
    const interval = setInterval(fetchVideos, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Paper 
      elevation={2}
      sx={{
        p: 2,
        height: '100%',
        bgcolor: 'background.paper',
        overflow: 'hidden' // Animasyonlar için taşmaları engelle
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Favori Videolarım
      </Typography>
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            key={key}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {videos.map((video, index) => (
              <motion.div
                key={video._id}
                variants={itemVariants}
                layout
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '300px',
                    margin: '0 auto',
                    paddingTop: 'calc(56.25% * 0.7)', // 16:9 aspect ratio with reduced height
                    mb: index !== videos.length - 1 ? 2 : 0
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <iframe
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </Box>
                </Box>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  );
}
