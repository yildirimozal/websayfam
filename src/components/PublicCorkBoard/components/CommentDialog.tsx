'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Note, Comment, CommentDialogProps } from '../types';

const CommentDialog: React.FC<CommentDialogProps> = ({
  note,
  open,
  onClose,
  onAddComment,
  onDeleteComment,
  canDeleteComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Yorumlar</DialogTitle>
      <DialogContent>
        <List sx={{ mb: 2 }}>
          {note.comments.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
              Henüz yorum yapılmamış
            </Typography>
          ) : (
            note.comments.map((comment) => (
              <ListItem
                key={comment.id}
                secondaryAction={
                  canDeleteComment(comment) && (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => onDeleteComment(comment.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar src={comment.author.image} alt={comment.author.name}>
                    {comment.author.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" component="span">
                        {comment.author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={comment.content}
                />
              </ListItem>
            ))
          )}
        </List>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Yorumunuzu yazın..."
          variant="outlined"
          disabled={isSubmitting}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Kapat
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!newComment.trim() || isSubmitting}
        >
          Yorum Yap
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;
