'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Typography,
  Box,
  Alert,
  Divider,
  IconButton,
  Paper,
  useTheme,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  Send as SendIcon, 
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { CommentDialogProps, Comment } from '../types';

const CommentDialog: React.FC<CommentDialogProps> = ({
  open, 
  onClose, 
  onAdd, 
  onDelete,
  comments: initialComments = [], 
  onCommentAdd,
  noteAuthorEmail
}) => {
  const theme = useTheme();
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState(initialComments);

  useEffect(() => {
    setLocalComments(initialComments);
  }, [initialComments]);

  const handleAddComment = async () => {
    if (newComment.trim() && session?.user?.email) {
      try {
        // Geçici yorum oluştur
        const tempComment: Comment = {
          id: 'temp_' + Date.now(),
          userId: session.user.email,
          content: newComment.trim(),
          createdAt: new Date(),
          author: {
            id: session.user.email,
            name: session.user.name || 'İsimsiz Kullanıcı',
            email: session.user.email,
            image: session.user.image || undefined
          }
        };

        // Yerel yorumları güncelle
        setLocalComments(prev => [...prev, tempComment]);
        setNewComment('');

        // API'ye gönder
        await onAdd(newComment.trim());
        onCommentAdd?.();
      } catch (error) {
        // Hata durumunda geçici yorumu kaldır
        setLocalComments(prev => prev.filter(c => c.id !== 'temp_' + Date.now()));
        console.error('Yorum ekleme hatası:', error);
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, commentId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedCommentId(null);
  };

  const handleDeleteComment = async () => {
    if (selectedCommentId && onDelete) {
      try {
        // Yerel yorumları güncelle
        setLocalComments(prev => prev.filter(c => c.id !== selectedCommentId));
        handleMenuClose();

        // API'ye gönder
        await onDelete(selectedCommentId);
      } catch (error) {
        // Hata durumunda yorumları geri yükle
        console.error('Yorum silme hatası:', error);
      }
    }
  };

  const canDeleteComment = (comment: Comment) => {
    if (!session?.user?.email) return false;
    const isAdmin = session.user.email === 'ozalyildirim@firat.edu.tr';
    const isNoteOwner = session.user.email === noteAuthorEmail;
    const isCommentOwner = session.user.email === comment.author?.email;
    return isAdmin || isNoteOwner || isCommentOwner;
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'dd MMM yyyy HH:mm');
    } catch (error) {
      console.error('Tarih formatı hatası:', error);
      return 'Geçersiz tarih';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'background.paper',
          p: 2
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Yorumlar
        </Typography>
        <IconButton 
          edge="end" 
          onClick={onClose}
          aria-label="close"
          sx={{ 
            color: 'text.secondary',
            '&:hover': { 
              color: 'text.primary',
              bgcolor: 'action.hover' 
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto', p: 2 }}>
          {(!localComments || localComments.length === 0) ? (
            <Paper 
              elevation={0}
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 200,
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Henüz yorum yapılmamış
              </Typography>
            </Paper>
          ) : (
            <List disablePadding>
              {localComments.map((comment, index) => (
                <React.Fragment key={comment.id || index}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      px: 2, 
                      py: 1.5,
                      '&:hover': { 
                        bgcolor: 'action.hover',
                        borderRadius: 1
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={comment.author?.image || '/default-avatar.png'} 
                        alt={comment.author?.name || ''}
                        sx={{ 
                          width: 40, 
                          height: 40,
                          boxShadow: theme.shadows[2]
                        }}
                      >
                        {comment.author?.name?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography 
                            component="span" 
                            variant="subtitle1"
                            sx={{ 
                              fontWeight: 600,
                              color: 'text.primary'
                            }}
                          >
                            {comment.author?.name}
                          </Typography>
                          {canDeleteComment(comment) && (
                            <Tooltip title="Yorum seçenekleri">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, comment.id)}
                                sx={{ 
                                  ml: 1,
                                  color: 'text.secondary',
                                  '&:hover': { 
                                    color: 'text.primary',
                                    bgcolor: 'action.hover'
                                  }
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography
                            component="div"
                            variant="body2"
                            color="text.primary"
                            sx={{ 
                              mb: 0.5,
                              lineHeight: 1.5
                            }}
                          >
                            {comment.content}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ 
                              display: 'block',
                              fontSize: '0.75rem'
                            }}
                          >
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < localComments.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          {session?.user ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                placeholder="Yorumunuzu yazın..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    '&:hover': {
                      '& > fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  },
                }}
              />
              <IconButton
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                color="primary"
                sx={{ 
                  alignSelf: 'flex-end',
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          ) : (
            <Alert 
              severity="info" 
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: 'primary.main'
                }
              }}
            >
              Yorum yapabilmek için giriş yapmanız gerekiyor.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={handleDeleteComment}
          sx={{ 
            color: 'error.main',
            '&:hover': { 
              bgcolor: 'error.light',
              color: 'error.dark'
            }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Yorumu Sil
        </MenuItem>
      </Menu>
    </Dialog>
  );
};

export default CommentDialog;
