'use client';

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';

interface Comment {
  userId: string;
  content: string;
  createdAt: Date;
}

interface NoteInteractionsProps {
  noteId: string;
  likes: string[];
  comments: Comment[];
  onLikeToggle: () => void;
  onCommentAdd: (content: string) => void;
}

const NoteInteractions: React.FC<NoteInteractionsProps> = ({
  noteId,
  likes,
  comments,
  onLikeToggle,
  onCommentAdd,
}) => {
  const { data: session } = useSession();
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  const isLiked = session?.user?.id ? likes.includes(session.user.id) : false;

  const handleCommentSubmit = () => {
    if (commentContent.trim()) {
      onCommentAdd(commentContent.trim());
      setCommentContent('');
      setIsCommentDialogOpen(false);
    }
  };

  return (
    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        size="small"
        onClick={onLikeToggle}
        disabled={!session}
        sx={{ 
          color: isLiked ? 'error.main' : 'inherit',
          '&:hover': {
            color: isLiked ? 'error.dark' : 'error.light'
          }
        }}
      >
        {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
      </IconButton>
      <span style={{ fontSize: '0.8rem' }}>{likes.length}</span>

      <IconButton
        size="small"
        onClick={() => setIsCommentDialogOpen(true)}
        disabled={!session}
      >
        <CommentIcon fontSize="small" />
      </IconButton>
      <span style={{ fontSize: '0.8rem' }}>{comments.length}</span>

      <Dialog
        open={isCommentDialogOpen}
        onClose={() => setIsCommentDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Yorum Ekle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Yorumunuz"
            fullWidth
            multiline
            rows={3}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCommentDialogOpen(false)}>İptal</Button>
          <Button onClick={handleCommentSubmit} variant="contained" color="primary">
            Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NoteInteractions;
