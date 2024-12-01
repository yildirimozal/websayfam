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
  useMediaQuery
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
  
  const isXsScreen = useMediaQuery('(max-width:320px)');
  const isSmScreen = useMediaQuery('(max-width:375px)');

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
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: isXsScreen ? 'stretch' : 'flex-start',
                flexDirection: isXsScreen ? 'column' : 'row',
                gap: isXsScreen ? 1 : 0,
                mb: { xs: 1.5, sm: 2 } 
              }}>
                <Typography 
                  variant={isSmScreen ? "h6" : "h5"} 
                  component="h2" 
                  sx={{
                    fontSize: {
                      xs: '1.1rem',
                      sm: '1.25rem',
                      md: '1.5rem'
                    },
                    lineHeight: 1.3,
                    mb: isXsScreen ? 1 : 0
                  }}
                >
                  {blog.title}
                  {!blog.published && (
                    <Chip 
                      label="Taslak" 
                      size="small" 
                      color="warning" 
                      sx={{ 
                        ml: 1,
                        height: { xs: 20, sm: 24 },
                        '& .MuiChip-label': {
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }
                      }} 
                    />
                  )}
                </Typography>
                {isAdmin && (
                  <Button
                    startIcon={<EditIcon sx={{ fontSize: isSmScreen ? '1rem' : '1.25rem' }} />}
                    size={isSmScreen ? "small" : "medium"}
                    color="primary"
                    onClick={() => router.push(`/blog/edit/${blog._id}`)}
                    sx={{
                      minWidth: isXsScreen ? '100%' : 'auto',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Düzenle
                  </Button>
                )}
              </Box>
              <Box sx={{ 
                mb: { xs: 1.5, sm: 2 },
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5
              }}>
                {blog.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size={isSmScreen ? "small" : "medium"}
                    sx={{ 
                      height: { xs: 20, sm: 24 },
                      '& .MuiChip-label': {
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ 
                mb: { xs: 1.5, sm: 2 }, 
                maxHeight: { xs: 80, sm: 100 }, 
                overflow: 'hidden',
                position: 'relative',
                fontSize: { xs: '0.875rem', sm: '1rem' },
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
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexDirection: isXsScreen ? 'column' : 'row',
                gap: isXsScreen ? 1 : 0
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 2 },
                  flexDirection: isXsScreen ? 'column' : 'row',
                  width: isXsScreen ? '100%' : 'auto'
                }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      textAlign: isXsScreen ? 'center' : 'left',
                      width: isXsScreen ? '100%' : 'auto'
                    }}
                  >
                    {new Date(blog.createdAt).toLocaleDateString('tr-TR')} - {blog.author.name}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    justifyContent: isXsScreen ? 'center' : 'flex-start',
                    width: isXsScreen ? '100%' : 'auto'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" disabled>
                        <Visibility sx={{ fontSize: isSmScreen ? '1rem' : '1.25rem' }} />
                      </IconButton>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {blog.views || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" disabled>
                        <Favorite sx={{ fontSize: isSmScreen ? '1rem' : '1.25rem' }} />
                      </IconButton>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {blog.likes?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Button 
                  size={isSmScreen ? "small" : "medium"}
                  color="primary"
                  onClick={() => router.push(`/blog/${blog.slug}`)}
                  sx={{
                    minWidth: isXsScreen ? '100%' : 'auto',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
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
        fullScreen={isXsScreen}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          p: { xs: 2, sm: 3 }
        }}>
          Blog Silme Onayı
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Bu blogu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            size={isSmScreen ? "small" : "medium"}
          >
            İptal
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            size={isSmScreen ? "small" : "medium"}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
