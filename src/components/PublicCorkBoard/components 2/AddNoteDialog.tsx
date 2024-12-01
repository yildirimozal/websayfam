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
} from '@mui/material';
import { AddNoteDialogProps } from '../types';

export const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'note' | 'image'>('note');

  const handleAdd = () => {
    onAdd(content, type);
    setContent('');
    setType('note');
  };

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
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === 'note' ? 'Notunuzu yazın...' : 'Resim URL\'si girin...'}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          İptal
        </Button>
        <Button 
          onClick={handleAdd}
          variant="contained"
          disabled={!content.trim()}
        >
          Ekle
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNoteDialog;
