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
  Divider,
} from '@mui/material';
import { CommentDialogProps } from '../types';
import { formatDate } from '../usePublicCorkBoard';

export const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  onClose,
  onAdd,
  comments,
  onCommentAdd,
}) => {
  const [content, setContent] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleAdd = () => {
    onAdd(content);
    setContent('');
    setIsAddingComment(false);
  };

  if (isAddingComment) {
    return (
      <Dialog
        open={open}
        onClose={() => {
          setIsAddingComment(false);
          onClose();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yorum Ekle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingComment(false)}>
            İptal
          </Button>
          <Button 
            onClick={handleAdd}
            variant="contained"
            disabled={!content.trim()}
          >
            Gönder
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Yorumlar
        <Button
          variant="contained"
          size="small"
          sx={{ float: 'right' }}
          onClick={() => {
            setIsAddingComment(true);
            onCommentAdd();
          }}
        >
          Yorum Ekle
        </Button>
      </DialogTitle>
      <DialogContent>
        <List>
          {comments.length === 0 ? (
            <ListItem>
              <ListItemText primary="Henüz yorum yapılmamış" />
            </ListItem>
          ) : (
            comments.map((comment, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={comment.content}
                    secondary={formatDate(comment.createdAt)}
                  />
                </ListItem>
                {index < comments.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;
