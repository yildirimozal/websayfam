'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Note } from '../types';

interface AddNoteDialogProps {
  open: boolean;
  editingNote: Note | null;
  onClose: () => void;
  onSave: () => void;
  onNoteChange: (note: Note) => void;
}

export const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  open,
  editingNote,
  onClose,
  onSave,
  onNoteChange,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {editingNote?._id ? 'Notu Düzenle' : 'Yeni Not Ekle'}
      </DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Tip"
          value={editingNote?.type || 'note'}
          onChange={(e) => onNoteChange({ 
            ...editingNote!,
            type: e.target.value as 'note' | 'image' | 'video'
          })}
          fullWidth
          margin="normal"
          SelectProps={{
            native: true,
          }}
        >
          <option value="note">Not</option>
          <option value="image">Resim</option>
          <option value="video">Video</option>
        </TextField>
        <TextField
          autoFocus
          margin="dense"
          label={editingNote?.type === 'note' ? 'İçerik' : 'URL'}
          fullWidth
          multiline={editingNote?.type === 'note'}
          rows={editingNote?.type === 'note' ? 4 : 1}
          value={editingNote?.content || ''}
          onChange={(e) => onNoteChange({ 
            ...editingNote!,
            content: e.target.value 
          })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          İptal
        </Button>
        <Button onClick={onSave} variant="contained">
          {editingNote?._id ? 'Güncelle' : 'Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
