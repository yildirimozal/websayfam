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
  FormHelperText,
} from '@mui/material';
import { AddNoteDialogProps } from '../types';

const MAX_LENGTH = 200;

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'note' | 'image'>('note');

  const handleAdd = () => {
    if (content.length <= MAX_LENGTH) {
      onAdd(content, type);
      setContent('');
      setType('note');
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_LENGTH) {
      setContent(newContent);
    }
  };

  const remainingChars = MAX_LENGTH - content.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
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
