'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { AddNoteDialogProps } from '../types';

const MAX_LENGTH = 200;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const colorOptions = [
  { value: '#fff9c4', label: 'Sarı' },
  { value: '#f8bbd0', label: 'Pembe' },
  { value: '#c8e6c9', label: 'Yeşil' },
  { value: '#bbdefb', label: 'Mavi' },
  { value: '#e1bee7', label: 'Mor' },
  { value: '#ffccbc', label: 'Turuncu' }
];

const fontOptions = [
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Playfair Display', label: 'Playfair' },
  { value: 'Comic Sans MS', label: 'Comic Sans' }
];

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  open,
  onClose,
  onAdd,
  editingNote
}) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery('(max-width:320px)');
  const isSmScreen = useMediaQuery('(max-width:375px)');

  const [content, setContent] = useState('');
  const [type, setType] = useState<'note' | 'image'>('note');
  const [selectedColor, setSelectedColor] = useState('#fff9c4');
  const [selectedFont, setSelectedFont] = useState('Roboto');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingNote) {
      setContent(editingNote.type === 'note' ? editingNote.content || '' : editingNote.url || '');
      setType(editingNote.type);
      setSelectedColor(editingNote.color);
      setSelectedFont(editingNote.fontFamily);
    } else {
      setContent('');
      setType('note');
      setSelectedColor('#fff9c4');
      setSelectedFont('Roboto');
    }
  }, [editingNote]);

  const handleAdd = () => {
    const isValid = type === 'note' 
      ? content.trim() && content.length <= MAX_LENGTH
      : content.trim();

    if (isValid) {
      onAdd(content, type, selectedColor, selectedFont);
      handleClose();
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_LENGTH) {
      setContent(newContent);
    }
  };

  const remainingChars = MAX_LENGTH - content.length;

  const handleClose = () => {
    setContent('');
    setType('note');
    setSelectedColor('#fff9c4');
    setSelectedFont('Roboto');
    setUploadError(null);
    onClose();
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleFontSelect = (font: string) => {
    setSelectedFont(font);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Sadece resim dosyaları yüklenebilir');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('isPublic', 'false');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Resim yüklenemedi');
      }

      const data = await response.json();
      setContent(data.url);
      setType('image');
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      setUploadError('Resim yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Sadece resim dosyaları yüklenebilir');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('isPublic', 'false');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Resim yüklenemedi');
      }

      const data = await response.json();
      setContent(data.url);
      setType('image');
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      setUploadError('Resim yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isXsScreen}
    >
      <DialogTitle sx={{ 
        fontSize: { xs: '1.1rem', sm: '1.25rem' },
        p: { xs: 2, sm: 3 }
      }}>
        {editingNote ? 'Notu Düzenle' : 'Yeni Not Ekle'}
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 2, mt: 1, display: 'flex', gap: 1 }}>
          <Button
            variant={type === 'note' ? 'contained' : 'outlined'}
            onClick={() => setType('note')}
            size={isSmScreen ? "small" : "medium"}
            sx={{ flex: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            disabled={!!editingNote}
          >
            Not
          </Button>
          <Button
            variant={type === 'image' ? 'contained' : 'outlined'}
            onClick={() => setType('image')}
            size={isSmScreen ? "small" : "medium"}
            sx={{ flex: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            disabled={!!editingNote}
          >
            Resim
          </Button>
        </Box>

        {type === 'image' ? (
          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 1,
                p: { xs: 1.5, sm: 2 },
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: '#f5f5f5'
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {isUploading ? (
                <CircularProgress size={isXsScreen ? 20 : 24} />
              ) : content ? (
                <Box sx={{ mt: { xs: 1, sm: 2 }, textAlign: 'center' }}>
                  <img
                    src={content}
                    alt="Yüklenen resim"
                    style={{
                      maxWidth: '100%',
                      maxHeight: isXsScreen ? '200px' : '300px',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              ) : (
                <>
                  <CloudUploadIcon sx={{ 
                    fontSize: { xs: 32, sm: 48 }, 
                    color: '#666' 
                  }} />
                  <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Resim yüklemek için tıklayın veya sürükleyin
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="textSecondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    (Maksimum 5MB)
                  </Typography>
                </>
              )}
            </Box>
            {uploadError && (
              <Typography 
                color="error" 
                variant="caption" 
                sx={{ 
                  mt: 1,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                {uploadError}
              </Typography>
            )}
          </Box>
        ) : (
          <TextField
            autoFocus
            multiline
            rows={isXsScreen ? 3 : 4}
            fullWidth
            value={content}
            onChange={handleContentChange}
            placeholder="Notunuzu yazın..."
            variant="outlined"
            error={content.length > MAX_LENGTH}
            helperText={`${remainingChars} karakter kaldı`}
            sx={{ 
              mb: 2,
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              },
              '& .MuiFormHelperText-root': {
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }
            }}
          />
        )}

        {type === 'note' && (
          <>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mt: 2, 
                mb: 1,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              Arkaplan Rengi
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: isXsScreen ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
              gap: 1,
              mb: 2 
            }}>
              {colorOptions.map((color) => (
                <Box
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  sx={{
                    width: isXsScreen ? 32 : 40,
                    height: isXsScreen ? 32 : 40,
                    backgroundColor: color.value,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: selectedColor === color.value ? '2px solid #000' : '1px solid #ccc',
                    '&:hover': {
                      opacity: 0.8
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={color.label}
                />
              ))}
            </Box>

            <Typography 
              variant="subtitle2" 
              sx={{ 
                mt: 2, 
                mb: 1,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              Yazı Tipi
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: isXsScreen ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: 1 
            }}>
              {fontOptions.map((font) => (
                <Box
                  key={font.value}
                  onClick={() => handleFontSelect(font.value)}
                  sx={{
                    padding: { xs: '6px 8px', sm: '8px 12px' },
                    backgroundColor: selectedFont === font.value ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: selectedFont === font.value ? '2px solid #1976d2' : '1px solid #ccc',
                    '&:hover': {
                      backgroundColor: '#e3f2fd'
                    },
                    fontFamily: font.value,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    textAlign: 'center'
                  }}
                >
                  {font.label}
                </Box>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
        <Button 
          onClick={handleClose}
          size={isSmScreen ? "small" : "medium"}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          İptal
        </Button>
        <Button 
          onClick={handleAdd}
          variant="contained"
          disabled={
            type === 'note' 
              ? !content.trim() || content.length > MAX_LENGTH 
              : !content.trim() || isUploading
          }
          size={isSmScreen ? "small" : "medium"}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {editingNote ? 'Güncelle' : 'Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNoteDialog;
