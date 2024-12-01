import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import { NoteDetailDialogProps } from '../types';

const NoteDetailDialog: React.FC<NoteDetailDialogProps> = ({
  note,
  open,
  onClose,
  onLike,
  isLiked,
  likeCount,
  commentCount,
  onCommentClick,
}) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery('(max-width:320px)');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isXsScreen}
    >
      <DialogTitle sx={{
        fontSize: isXsScreen ? '1.1rem' : '1.25rem',
        p: isXsScreen ? 2 : 3,
        backgroundColor: note.type === 'note' ? note.color : 'white',
      }}>
        {note.type === 'note' ? 'Not Detayı' : 'Resim Detayı'}
      </DialogTitle>
      <DialogContent sx={{ p: isXsScreen ? 2 : 3 }}>
        {note.type === 'note' ? (
          <Typography
            sx={{
              fontSize: {
                xs: '0.875rem',
                sm: '1rem',
                md: '1.1rem'
              },
              color: '#2c1810',
              lineHeight: 1.6,
              fontFamily: note.fontFamily || 'Roboto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {note.content}
          </Typography>
        ) : (
          <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
            <Image
              src={note.url || ''}
              alt="Not resmi"
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 4, 
          mt: 3,
          backgroundColor: 'rgba(0,0,0,0.03)',
          borderRadius: 1,
          p: 2
        }}>
          <IconButton
            onClick={onLike}
            sx={{ 
              color: isLiked ? 'red' : 'inherit',
              '&:hover': { color: 'red' }
            }}
          >
            <Badge badgeContent={likeCount} color="primary">
              {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </Badge>
          </IconButton>
          
          <IconButton onClick={onCommentClick}>
            <Badge badgeContent={commentCount} color="primary">
              <CommentIcon />
            </Badge>
          </IconButton>
        </Box>

        {note.author && (
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            {note.author.image && (
              <Image
                src={note.author.image}
                alt={note.author.name}
                width={24}
                height={24}
                style={{ borderRadius: '50%' }}
              />
            )}
            <Typography variant="body2" color="text.secondary">
              {note.author.name} tarafından oluşturuldu
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {new Date(note.createdAt).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: isXsScreen ? 2 : 3 }}>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteDetailDialog;
