'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { EditNoteDialogProps } from '../types';

const MAX_LENGTH = 200;

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

const EditNoteDialog: React.FC<EditNoteDialogProps> = ({
  open,
  onClose,
  onSave,
  note,
}) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery('(max-width:320px)');
  const isSmScreen = useMediaQuery('(max-width:375px)');

  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(note.color || '#fff9c4');
  const [selectedFont, setSelectedFont] = useState(note.fontFamily || 'Roboto');

  useEffect(() => {
    if (open && note) {
      setContent(note.content);
      setSelectedColor(note.color);
      setSelectedFont(note.fontFamily);
    }
  }, [open, note]);

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_LENGTH) {
      setContent(newContent);
    }
  };

  const handleSave = () => {
    if (content.length <= MAX_LENGTH) {
      onSave(content, selectedColor, selectedFont);
      onClose();
    }
  };

  const remainingChars = MAX_LENGTH - content.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isXsScreen}
    >
      <DialogTitle sx={{ 
        fontSize: { xs: '1.1rem', sm: '1.25rem' },
        p: { xs: 2, sm: 3 }
      }}>
        Notu Düzenle
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <TextField
          autoFocus
          multiline
          rows={isXsScreen ? 3 : 4}
          fullWidth
          value={content}
          onChange={handleContentChange}
          placeholder={note.type === 'note' ? 'Notunuzu yazın...' : 'Resim URL\'si girin...'}
          variant="outlined"
          margin="normal"
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

        {note.type === 'note' && (
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
                  onClick={() => setSelectedColor(color.value)}
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
                  onClick={() => setSelectedFont(font.value)}
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
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
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
          onClick={onClose}
          size={isSmScreen ? "small" : "medium"}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          İptal
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={!content.trim() || content.length > MAX_LENGTH}
          size={isSmScreen ? "small" : "medium"}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditNoteDialog;
