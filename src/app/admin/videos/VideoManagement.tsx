'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface Video {
  _id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  order: number;
}

export default function VideoManagement() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [open, setOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    videoId: '',
    title: '',
    thumbnail: '',
    channelTitle: '',
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/favorite-videos');
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Videolar yüklenirken hata:', error);
    }
  };

  const handleOpen = (video?: Video) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        videoId: video.videoId,
        title: video.title,
        thumbnail: video.thumbnail,
        channelTitle: video.channelTitle,
      });
    } else {
      setEditingVideo(null);
      setFormData({
        videoId: '',
        title: '',
        thumbnail: '',
        channelTitle: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingVideo(null);
    setFormData({
      videoId: '',
      title: '',
      thumbnail: '',
      channelTitle: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        await fetch(`/api/favorite-videos/${editingVideo._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/favorite-videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      handleClose();
      fetchVideos();
    } catch (error) {
      console.error('Video kaydedilirken hata:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/favorite-videos/${id}`, {
        method: 'DELETE',
      });
      fetchVideos();
    } catch (error) {
      console.error('Video silinirken hata:', error);
    }
  };

  const handleMove = async (videoId: string, direction: 'up' | 'down') => {
    const currentIndex = videos.findIndex((v) => v._id === videoId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === videos.length - 1)
    ) {
      return;
    }

    const newVideos = [...videos];
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newVideos[currentIndex], newVideos[swapIndex]] = [
      newVideos[swapIndex],
      newVideos[currentIndex],
    ];

    const updatedVideos = newVideos.map((video, index) => ({
      ...video,
      order: index,
    }));

    try {
      await fetch('/api/favorite-videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: updatedVideos }),
      });
      setVideos(updatedVideos);
    } catch (error) {
      console.error('Video sırası güncellenirken hata:', error);
    }
  };

  const handleSeedData = async () => {
    try {
      await fetch('/api/favorite-videos/seed');
      fetchVideos();
    } catch (error) {
      console.error('Örnek veriler eklenirken hata:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={() => handleOpen()}>
          Yeni Video Ekle
        </Button>
        <Button variant="outlined" onClick={handleSeedData}>
          Örnek Verileri Yükle
        </Button>
      </Box>

      <List>
        {videos.map((video, index) => (
          <Card key={video._id} sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img
                src={video.thumbnail}
                alt={video.title}
                style={{ width: 120, height: 'auto' }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{video.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {video.channelTitle}
                </Typography>
              </Box>
              <Box>
                <IconButton
                  onClick={() => handleMove(video._id, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleMove(video._id, 'down')}
                  disabled={index === videos.length - 1}
                >
                  <ArrowDownwardIcon />
                </IconButton>
                <IconButton onClick={() => handleOpen(video)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(video._id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingVideo ? 'Video Düzenle' : 'Yeni Video Ekle'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Video ID"
              value={formData.videoId}
              onChange={(e) =>
                setFormData({ ...formData, videoId: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Başlık"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Küçük Resim URL"
              value={formData.thumbnail}
              onChange={(e) =>
                setFormData({ ...formData, thumbnail: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Kanal Adı"
              value={formData.channelTitle}
              onChange={(e) =>
                setFormData({ ...formData, channelTitle: e.target.value })
              }
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>İptal</Button>
            <Button type="submit" variant="contained">
              Kaydet
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
