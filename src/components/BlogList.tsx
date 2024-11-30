'use client';

import React, { useState } from 'react';
import { 
  Grid,
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Visibility, Favorite } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false
});

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  slug: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
  views: number;
  likes: string[];
}

interface BlogListProps {
  blogs: BlogPost[];
  isAdmin?: boolean;
}

export default function BlogList({ blogs, isAdmin }: BlogListProps) {
  const theme = useTheme();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;

    try {
      const response = await fetch(`/api/blogs/${blogToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Blog silinirken hata oluştu');
      }

      router.refresh();
    } catch (error) {
      console.error('Blog silme hatası:', error);
    } finally {
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  return (
    <>
      {blogs.map((blog) => (
        <Grid item xs={12} key={blog._id}>
          <Card 
            sx={{ 
              position: 'relative',
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out',
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {blog.title}
                  {!blog.published && (
                    <Chip 
                      label="Taslak" 
                      size="small" 
                      color="warning" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </Typography>
                {isAdmin && (
                  <Button
                    startIcon={<EditIcon />}
                    size="small"
                    color="primary"
                    onClick={() => router.push(`/blog/edit/${blog._id}`)}
                  >
                    Düzenle
                  </Button>
                )}
              </Box>
              <Box sx={{ mb: 2 }}>
                {blog.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
              <Box sx={{ 
                mb: 2, 
                maxHeight: 100, 
                overflow: 'hidden',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50px',
                  background: `linear-gradient(transparent, ${theme.palette.background.paper})`,
                }
              }}>
                <ReactMarkdown>{blog.content}</ReactMarkdown>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(blog.createdAt).toLocaleDateString('tr-TR')} - {blog.author.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" disabled>
                        <Visibility fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
                        {blog.views || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" disabled>
                        <Favorite fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
                        {blog.likes?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => router.push(`/blog/${blog.slug}`)}
                >
                  Devamını Oku
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Blog Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography>
            Bu blogu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
