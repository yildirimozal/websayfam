'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Button, 
  CircularProgress,
  Fab,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  IconButton,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Hero from '@/components/Hero';

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

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { data: session } = useSession();
  const theme = useTheme();
  const searchParams = useSearchParams();
  const isManageMode = searchParams.get('manage') === 'true' && session?.user?.isAdmin;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) {
          throw new Error('Bloglar yüklenirken hata oluştu');
        }
        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Beklenmeyen bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handlePublishToggle = async (blogId: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !currentState }),
      });

      if (!response.ok) {
        throw new Error('Blog durumu güncellenirken hata oluştu');
      }

      setBlogs(blogs.map(blog => 
        blog._id === blogId ? { ...blog, published: !currentState } : blog
      ));
      setSuccessMessage('Blog durumu başarıyla güncellendi');
    } catch (err) {
      setError('Blog durumu güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;

    try {
      const response = await fetch(`/api/blogs/${blogToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Blog silinirken hata oluştu');
      }

      setBlogs(blogs.filter(blog => blog._id !== blogToDelete));
      setSuccessMessage('Blog başarıyla silindi');
    } catch (err) {
      setError('Blog silinirken bir hata oluştu');
    } finally {
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedBlogs(blogs.map(blog => blog._id));
    } else {
      setSelectedBlogs([]);
    }
  };

  const handleSelectBlog = (blogId: string) => {
    setSelectedBlogs(prev => 
      prev.includes(blogId)
        ? prev.filter(id => id !== blogId)
        : [...prev, blogId]
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (isManageMode) {
    return (
      <>
        <Hero />
        <Box>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {successMessage && (
              <Alert 
                severity="success" 
                sx={{ mb: 2 }}
                onClose={() => setSuccessMessage(null)}
              >
                {successMessage}
              </Alert>
            )}
            
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1">
                Blog Yönetimi
              </Typography>
              <Link href="/blog/create" passHref>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Yeni Blog
                </Button>
              </Link>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedBlogs.length > 0 && selectedBlogs.length < blogs.length}
                        checked={selectedBlogs.length === blogs.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Başlık</TableCell>
                    <TableCell>Yazar</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow key={blog._id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedBlogs.includes(blog._id)}
                          onChange={() => handleSelectBlog(blog._id)}
                        />
                      </TableCell>
                      <TableCell>{blog.title}</TableCell>
                      <TableCell>{blog.author.name}</TableCell>
                      <TableCell>
                        {new Date(blog.createdAt).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={blog.published}
                          onChange={() => handlePublishToggle(blog._id, blog.published)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Link href={`/blog/${blog.slug}`} passHref>
                            <IconButton size="small" color="primary">
                              <VisibilityIcon />
                            </IconButton>
                          </Link>
                          <Link href={`/blog/edit/${blog._id}`} passHref>
                            <IconButton size="small" color="primary">
                              <EditIcon />
                            </IconButton>
                          </Link>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              setBlogToDelete(blog._id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

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
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Hero />
      <Box>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {blogs.filter(blog => blog.published || session?.user?.isAdmin).map((blog) => (
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
                      {session?.user?.isAdmin && (
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
          </Grid>
        </Container>
        
        {session?.user?.isAdmin && (
          <Fab
            color="primary"
            aria-label="add blog"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
            component={Link}
            href="/blog/create"
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
    </>
  );
}
