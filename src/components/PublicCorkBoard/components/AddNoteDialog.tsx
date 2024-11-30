'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { AddNoteDialogProps } from '../types';

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

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'note' | 'image'>('note');
  const [selectedColor, setSelectedColor] = useState('#fff9c4');
  const [selectedFont, setSelectedFont] = useState('Roboto');

  const handleAdd = () => {
    if (content.length <= MAX_LENGTH) {
      console.log('AddNoteDialog handleAdd called with:', {
        content,
        type,
        color: selectedColor,
        fontFamily: selectedFont
      });
      onAdd(content, type, selectedColor, selectedFont);
      setContent('');
      setType('note');
      setSelectedColor('#fff9c4');
      setSelectedFont('Roboto');
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
    onClose();
  };

  const handleColorSelect = (color: string) => {
    console.log('Color selected:', color);
    setSelectedColor(color);
  };

  const handleFontSelect = (font: string) => {
    console.log('Font selected:', font);
    setSelectedFont(font);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Yeni Not Ekle</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Button
            variant={type === 'note' ? 'contained' : 'outlined'}
            onClick={() => setType('note')}
            sx={{ mr: 1 }}
          >
            Not
          </Button>
          <Button
            variant={type === 'image' ? 'contained' : 'outlined'}
            onClick={() => setType('image')}
          >
            Resim
          </Button>
        </Box>

        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          value={content}
          onChange={handleContentChange}
          placeholder={type === 'note' ? 'Notunuzu yazın...' : 'Resim URL\'si girin...'}
          variant="outlined"
          error={content.length > MAX_LENGTH}
          helperText={`${remainingChars} karakter kaldı`}
          sx={{ mb: 2 }}
        />

        {type === 'note' && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Arkaplan Rengi
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {colorOptions.map((color) => (
                <Box
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  sx={{
                    width: 40,
                    height: 40,
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

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Yazı Tipi
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {fontOptions.map((font) => (
                <Box
                  key={font.value}
                  onClick={() => handleFontSelect(font.value)}
                  sx={{
                    padding: '8px 12px',
                    backgroundColor: selectedFont === font.value ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: selectedFont === font.value ? '2px solid #1976d2' : '1px solid #ccc',
                    '&:hover': {
                      backgroundColor: '#e3f2fd'
                    },
                    fontFamily: font.value
                  }}
                >
                  {font.label}
                </Box>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          İptal
        </Button>
        <Button 
          onClick={handleAdd}
          variant="contained"
          disabled={!content.trim() || content.length > MAX_LENGTH}
        >
          Ekle
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNoteDialog;
