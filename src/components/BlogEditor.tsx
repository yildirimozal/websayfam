'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Paper,
  Typography,
  Chip,
  Stack,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import type MDEditor from '@uiw/react-md-editor';

const MarkdownEditor = dynamic<any>(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface BlogEditorProps {
  initialData?: {
    _id?: string;
    title: string;
    content: string;
    tags: string[];
    published: boolean;
  };
}

const BlogEditor: React.FC<BlogEditorProps> = ({ initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [published, setPublished] = useState(initialData?.published || false);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const theme = useTheme();

  const handleSave = useCallback(async () => {
    if (!session?.user?.isAdmin) {
      setError('Bu işlem için admin yetkisi gereklidir');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Başlık ve içerik alanları zorunludur');
      return;
    }

    setLoading(true);
    try {
      const isEditing = initialData?._id;
      const url = isEditing ? `/api/blogs/${initialData._id}` : '/api/blogs';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          tags,
          published,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Blog kaydedilirken bir hata oluştu');
      }

      const blog = await response.json();
      router.push(`/blog/${blog.slug}`);
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  }, [title, content, tags, published, initialData, router, session]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!session?.user?.isAdmin) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {initialData?._id ? 'Blog Düzenle' : 'Yeni Blog Oluştur'}
        </Typography>

        <TextField
          fullWidth
          label="Blog Başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Etiketler
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
              />
            ))}
          </Stack>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              label="Yeni Etiket"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <IconButton onClick={handleAddTag} color="primary">
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            İçerik
          </Typography>
          <div data-color-mode={theme.palette.mode}>
            <MarkdownEditor
              value={content}
              onChange={(value: string) => setContent(value)}
              preview="edit"
              height={400}
            />
          </div>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
            }
            label={published ? 'Yayında' : 'Taslak'}
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BlogEditor;
