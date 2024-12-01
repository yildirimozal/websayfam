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
  IconButton,
  useTheme,
  MenuItem,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Note } from '../types';

interface EditNoteDialogProps {
  note: Note;
  open: boolean;
  onClose: () => void;
  onSave: (content: string, color: string, fontFamily: string) => void;
}

const COLORS = [
  { value: '#fff9c4', label: 'Sarı' },
  { value: '#f8bbd0', label: 'Pembe' },
  { value: '#c8e6c9', label: 'Yeşil' },
  { value: '#bbdefb', label: 'Mavi' },
  { value: '#d7ccc8', label: 'Kahverengi' },
  { value: '#ffccbc', label: 'Turuncu' },
];

const FONTS = [
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Comic Sans MS', label: 'Comic Sans' },
  { value: 'Courier New', label: 'Courier New' },
];

const EditNoteDialog: React.FC<EditNoteDialogProps> = ({
  note,
  open,
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const [content, setContent] = useState(note.content || '');
  const [color, setColor] = useState(note.color);
  const [fontFamily, setFontFamily] = useState(note.fontFamily);

  const handleSave = () => {
    onSave(content, color, fontFamily);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: color,
          transition: 'background-color 0.3s ease',
        },
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        Not Düzenle
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            autoFocus
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Not içeriği..."
            variant="outlined"
            fullWidth
            InputProps={{
              sx: {
                fontFamily: fontFamily,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />

          <TextField
            select
            label="Renk"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
          >
            {COLORS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: 1,
                      backgroundColor: option.value,
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  {option.label}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Yazı Tipi"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
          >
            {FONTS.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                sx={{ fontFamily: option.value }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
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
