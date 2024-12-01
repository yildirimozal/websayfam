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
  Box,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon, Login as LoginIcon } from '@mui/icons-material';
import { Note, Comment, CommentDialogProps } from '../types';
import { useSession } from 'next-auth/react';
import NextLink from 'next/link';

const CommentDialog: React.FC<CommentDialogProps> = ({
  note,
  open,
  onClose,
  onAddComment,
  onDeleteComment,
  canDeleteComment
}) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery('(max-width:320px)');
  const isSmScreen = useMediaQuery('(max-width:375px)');
  const { data: session } = useSession();

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
      fullScreen={isXsScreen}
      PaperProps={{
        sx: {
          margin: isXsScreen ? 0 : 2,
          borderRadius: isXsScreen ? 0 : 2
        }
      }}
    >
      <DialogTitle sx={{ 
        p: { xs: 2, sm: 3 },
        fontSize: { xs: '1.1rem', sm: '1.25rem' }
      }}>
        Yorumlar
      </DialogTitle>
      <DialogContent sx={{ 
        p: { xs: 2, sm: 3 },
        pt: { xs: 2, sm: 3 }
      }}>
        <List sx={{ 
          mb: 2,
          maxHeight: isXsScreen ? 'calc(100vh - 250px)' : '400px',
          overflow: 'auto'
        }}>
          {note.comments.length === 0 ? (
            <Typography 
              color="text.secondary" 
              align="center" 
              sx={{ 
                py: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
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
                      size={isSmScreen ? "small" : "medium"}
                      sx={{ 
                        '& .MuiSvgIcon-root': {
                          fontSize: isXsScreen ? '1.25rem' : '1.5rem'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )
                }
                sx={{ 
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1.5, sm: 2 }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={comment.author.image} 
                    alt={comment.author.name}
                    sx={{
                      width: isXsScreen ? 32 : 40,
                      height: isXsScreen ? 32 : 40
                    }}
                  >
                    {comment.author.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: isXsScreen ? 'flex-start' : 'center',
                      flexDirection: isXsScreen ? 'column' : 'row',
                      gap: isXsScreen ? 0.5 : 1
                    }}>
                      <Typography 
                        variant="subtitle2" 
                        component="span"
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        {comment.author.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      >
                        {new Date(comment.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        mt: 0.5,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {comment.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
        {session ? (
          <TextField
            fullWidth
            multiline
            rows={isXsScreen ? 2 : 3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            variant="outlined"
            disabled={isSubmitting}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />
        ) : (
          <Alert 
            severity="info"
            icon={<LoginIcon />}
            action={
              <Button
                color="inherit"
                size="small"
                component={NextLink}
                href="/auth/signin"
              >
                Giriş Yap
              </Button>
            }
          >
            Yorum yapabilmek için giriş yapmalısınız
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 },
        flexDirection: isXsScreen ? 'column' : 'row',
        gap: isXsScreen ? 1 : 0
      }}>
        <Button 
          onClick={onClose}
          fullWidth={isXsScreen}
          size={isSmScreen ? "small" : "medium"}
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Kapat
        </Button>
        {session && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!newComment.trim() || isSubmitting}
            fullWidth={isXsScreen}
            size={isSmScreen ? "small" : "medium"}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Yorum Yap
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;
