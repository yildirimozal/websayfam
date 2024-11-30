'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { EditNoteDialogProps } from '../types';

const MAX_LENGTH = 200;

const EditNoteDialog: React.FC<EditNoteDialogProps> = ({
  open,
  onClose,
  onSave,
  note,
}) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (open && note) {
      setContent(note.content);
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
      onSave(content);
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
    >
      <DialogTitle>Notu Düzenle</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          value={content}
          onChange={handleContentChange}
          placeholder={note.type === 'note' ? 'Notunuzu yazın...' : 'Resim URL\'si girin...'}
          variant="outlined"
          margin="normal"
          error={content.length > MAX_LENGTH}
          helperText={`${remainingChars} karakter kaldı`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          İptal
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={!content.trim() || content.length > MAX_LENGTH}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditNoteDialog;
