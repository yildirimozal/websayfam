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
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isXsScreen = useMediaQuery('(max-width:320px)');
  const isSmScreen = useMediaQuery('(max-width:375px)');

  if (!note) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isXsScreen}
      PaperProps={{
        sx: {
          borderRadius: isXsScreen ? 0 : 2,
          bgcolor: note.type === 'note' ? note.color : 'white',
          overflow: 'hidden',
          margin: isXsScreen ? 0 : 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pr: 1,
        pl: { xs: 2, sm: 3 },
        py: { xs: 1.5, sm: 2 },
        bgcolor: 'rgba(255,255,255,0.9)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        minHeight: isXsScreen ? 56 : 'auto'
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isXsScreen ? 'column' : 'row',
          alignItems: isXsScreen ? 'flex-start' : 'center'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mr: isXsScreen ? 0 : 2,
              mb: isXsScreen ? 0.5 : 0,
              fontSize: {
                xs: '1rem',
                sm: '1.25rem'
              }
            }}
          >
            {note.type === 'note' ? 'Not Detayı' : 'Resim Detayı'}
          </Typography>
          <Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{
              fontSize: {
                xs: '0.75rem',
                sm: '0.875rem'
              }
            }}
          >
            {note.author?.name}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          size={isSmScreen ? "small" : "medium"}
          sx={{
            padding: isXsScreen ? '4px' : '8px'
          }}
        >
          <CloseIcon sx={{ 
            fontSize: isXsScreen ? '1.25rem' : '1.5rem'
          }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ 
        p: note.type === 'image' ? 0 : { xs: 2, sm: 3 },
        minHeight: note.type === 'image' ? { xs: 'calc(100vh - 120px)', sm: '70vh' } : 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white'
      }}>
        {note.type === 'note' ? (
          <Typography
            sx={{
              fontSize: {
                xs: '1rem',
                sm: '1.2rem'
              },
              fontFamily: note.fontFamily,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.6
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
            overflow: 'hidden',
            backgroundColor: '#f5f5f5'
          }}>
            <img
              src={note.url}
              alt={`${note.author?.name}'in resmi`}
              style={{ 
                maxWidth: '100%',
                maxHeight: isXsScreen ? 'calc(100vh - 120px)' : '70vh',
                objectFit: 'contain',
                display: 'block'
              }}
              onError={(e) => {
                console.error('Resim yüklenemedi:', note.url);
                e.currentTarget.style.display = 'none';
              }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ 
        bgcolor: 'rgba(255,255,255,0.9)',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, sm: 2 },
        flexDirection: isXsScreen ? 'column' : 'row',
        alignItems: isXsScreen ? 'stretch' : 'center'
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            flex: 1, 
            pl: isXsScreen ? 0 : 2,
            mb: isXsScreen ? 1 : 0,
            textAlign: isXsScreen ? 'center' : 'left',
            fontSize: {
              xs: '0.7rem',
              sm: '0.75rem'
            }
          }}
        >
          {new Date(note.createdAt).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
        <Button 
          onClick={onClose}
          fullWidth={isXsScreen}
          size={isSmScreen ? "small" : "medium"}
          sx={{
            fontSize: {
              xs: '0.75rem',
              sm: '0.875rem'
            }
          }}
        >
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteDetailDialog;
