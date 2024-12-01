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
import { Note } from '../types';

interface EditNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  note: Note;
}

export const EditNoteDialog: React.FC<EditNoteDialogProps> = ({
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

  const handleSave = () => {
    onSave(content);
    onClose();
  };

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
          onChange={(e) => setContent(e.target.value)}
          placeholder={note.type === 'note' ? 'Notunuzu yazın...' : 'Resim URL\'si girin...'}
          variant="outlined"
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          İptal
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={!content.trim()}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditNoteDialog;
