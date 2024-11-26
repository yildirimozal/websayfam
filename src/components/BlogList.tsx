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
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import Link from 'next/link';
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
}

interface BlogListProps {
  blogs: BlogPost[];
  isAdmin?: boolean;
}

export default function BlogList({ blogs, isAdmin }: BlogListProps) {
  const theme = useTheme();
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

      // Sayfayı yenile
      window.location.reload();
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
                  <Link href={`/blog/edit/${blog._id}`} passHref>
                    <Button
                      startIcon={<EditIcon />}
                      size="small"
                      color="primary"
                    >
                      Düzenle
                    </Button>
                  </Link>
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
                  background: 'linear-gradient(transparent, white)',
                }
              }}>
                <ReactMarkdown>{blog.content}</ReactMarkdown>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(blog.createdAt).toLocaleDateString('tr-TR')} - {blog.author.name}
                </Typography>
                <Link href={`/blog/${blog.slug}`} passHref>
                  <Button size="small" color="primary">
                    Devamını Oku
                  </Button>
                </Link>
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
