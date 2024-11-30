'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import { Note } from '../types';

interface AddNoteDialogProps {
  open: boolean;
  editingNote: Note | null;
  onClose: () => void;
  onSave: () => void;
  onNoteChange: (note: Note) => void;
}

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

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Arkaplan Rengi
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {colorOptions.map((color) => (
            <Box
              key={color.value}
              onClick={() => onNoteChange({
                ...editingNote!,
                color: color.value
              })}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: color.value,
                borderRadius: 1,
                cursor: 'pointer',
                border: editingNote?.color === color.value ? '2px solid #000' : '1px solid #ccc',
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
              onClick={() => onNoteChange({
                ...editingNote!,
                fontFamily: font.value
              })}
              sx={{
                padding: '8px 12px',
                backgroundColor: editingNote?.fontFamily === font.value ? '#e3f2fd' : '#f5f5f5',
                borderRadius: 1,
                cursor: 'pointer',
                border: editingNote?.fontFamily === font.value ? '2px solid #1976d2' : '1px solid #ccc',
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
