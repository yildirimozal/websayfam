'use client';

import { Box, Paper, Typography, Avatar, Link, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FavoriteVideo {
  _id: string;
  videoId: string;
  title: string;
}

interface Channel {
  channelId: string;
  title: string;
  thumbnailUrl: string;
  customUrl: string;
}

const staticChannels: Channel[] = [
  {
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
    title: 'freeCodeCamp',
    thumbnailUrl: `https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg`,
    customUrl: 'https://www.youtube.com/@freecodecamp'
  },
  {
    channelId: 'UCsBjURrPoezykLs9EqgamOA',
    title: 'Fireship',
    thumbnailUrl: `https://i.ytimg.com/vi/jNQXAC9IVRw/default.jpg`,
    customUrl: 'https://www.youtube.com/@Fireship'
  },
  {
    channelId: 'UCW5YeuERMmlnqo4oq8vwUpg',
    title: 'The Net Ninja',
    thumbnailUrl: `https://i.ytimg.com/vi/y6120QOlsfU/default.jpg`,
    customUrl: 'https://www.youtube.com/@NetNinja'
  },
  {
    channelId: 'UCvmINlrza7JHB1zkIOuXEbw',
    title: 'Academind',
    thumbnailUrl: `https://i.ytimg.com/vi/9bZkp7q19f0/default.jpg`,
    customUrl: 'https://www.youtube.com/@academind'
  }
];

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

const channelVariants = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2
    }
  }
};

export default function YouTubePlaylist() {
  const [videos, setVideos] = useState<FavoriteVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/favorite-videos');
      if (!response.ok) {
        throw new Error('Videolar alınamadı');
      }
      const data = await response.json();
      setVideos(Array.isArray(data) ? data : []);
      setIsLoading(false);
      setKey(prev => prev + 1);
    } catch (error) {
      console.error('Videolar alınırken hata:', error);
      setVideos([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
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
        overflow: 'hidden'
      }}
    >
      {/* Channel Circles */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} justifyContent="center">
          {staticChannels.map((channel) => (
            <Grid item key={channel.channelId}>
              <Link 
                href={channel.customUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ textDecoration: 'none' }}
              >
                <motion.div
                  variants={channelVariants}
                  whileHover="hover"
                >
                  <Avatar
                    src={`https://i.ytimg.com/vi/${channel.channelId}/default.jpg`}
                    alt={channel.title}
                    sx={{
                      width: 50,
                      height: 50,
                      border: '2px solid',
                      borderColor: 'primary.main',
                      cursor: 'pointer'
                    }}
                  />
                </motion.div>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>

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
                    paddingTop: 'calc(56.25% * 0.7)',
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
