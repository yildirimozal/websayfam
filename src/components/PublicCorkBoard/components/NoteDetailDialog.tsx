'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Note } from '../types';

interface NoteDetailDialogProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
}

const NoteDetailDialog: React.FC<NoteDetailDialogProps> = ({
  note,
  open,
  onClose,
}) => {
  if (!note) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: note.type === 'note' ? note.color : 'white',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pr: 1,
        bgcolor: 'rgba(255,255,255,0.9)',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            {note.type === 'note' ? 'Not Detayı' : 'Resim Detayı'}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {note.author?.name}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ 
        p: note.type === 'image' ? 0 : 2,
        minHeight: note.type === 'image' ? '70vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white'
      }}>
        {note.type === 'note' ? (
          <Typography
            sx={{
              fontSize: '1.2rem',
              fontFamily: note.fontFamily,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {note.content}
          </Typography>
        ) : (
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <img
              src={note.content}
              alt={`${note.author?.name}'in resmi`}
              style={{ 
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                display: 'block'
              }}
              onError={(e) => {
                console.error('Resim yüklenemedi:', note.content);
                e.currentTarget.style.display = 'none';
              }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ 
        bgcolor: 'rgba(255,255,255,0.9)',
        borderTop: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, pl: 2 }}>
          {new Date(note.createdAt).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
        <Button onClick={onClose}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteDetailDialog;
