'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  Avatar,
  Badge,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Note } from '../types';
import { useSession } from 'next-auth/react';

interface NoteDetailDialogProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onLikeToggle: (noteId: string) => void;
  onCommentAdd: (noteId: string, content: string) => void;
  onCommentDelete: (noteId: string, commentId: string) => void;
  isLiked: boolean;
}

const NoteDetailDialog = ({
  note,
  open,
  onClose,
  onLikeToggle,
  onCommentAdd,
  onCommentDelete,
  isLiked
}: NoteDetailDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState('');

  if (!note) return null;

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    onCommentAdd(note.id, newComment);
    setNewComment('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  const handleCommentDelete = (comment: any) => {
    const commentId = `${comment.userId}_${new Date(comment.createdAt).getTime()}`;
    console.log('Deleting comment:', commentId);
    onCommentDelete(note.id, commentId);
  };

  const canDeleteComment = (authorEmail: string | undefined) => {
    if (!session?.user?.email) return false;
    return session.user.email === authorEmail || session.user.email === 'ozalyildirim@firat.edu.tr';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: '90vh',
          margin: fullScreen ? 0 : 2,
          borderRadius: fullScreen ? 0 : 2,
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: note.type === 'note' ? note.color : 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={note.author?.image}
            alt={note.author?.name}
            sx={{ width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {note.author?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(note.createdAt).toLocaleString('tr-TR')}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, bgcolor: note.type === 'note' ? note.color : 'background.paper' }}>
          {note.type === 'note' ? (
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: note.fontFamily,
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}
            >
              {note.content}
            </Typography>
          ) : (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <img
                src={note.url}
                alt={`${note.author?.name}'in resmi`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Tooltip title={session ? (isLiked ? "Beğeniyi kaldır" : "Beğen") : "Beğenmek için giriş yapın"}>
              <IconButton
                onClick={() => onLikeToggle(note.id)}
                disabled={!session}
                color={isLiked ? "primary" : "default"}
              >
                <Badge
                  badgeContent={note.likes.length}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      right: -3,
                      top: 3,
                    }
                  }}
                >
                  {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </Badge>
              </IconButton>
            </Tooltip>
            <Typography color="text.secondary">
              {note.likes.length} beğeni
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Yorumlar ({note.comments.length})
            </Typography>

            <Box sx={{ maxHeight: '40vh', overflow: 'auto', pr: 1 }}>
              {note.comments.map((comment) => (
                <Box
                  key={comment.id}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 2,
                    p: 2,
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  }}
                >
                  <Avatar
                    src={comment.author.image}
                    alt={comment.author.name}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {comment.author.name}
                      </Typography>
                      {canDeleteComment(comment.author.email) && (
                        <IconButton
                          size="small"
                          onClick={() => handleCommentDelete(comment)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="body2">{comment.content}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.createdAt).toLocaleString('tr-TR')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {session && (
        <DialogActions sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Yorumunuzu yazın..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={4}
            />
            <IconButton
              color="primary"
              onClick={handleCommentSubmit}
              disabled={!newComment.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default NoteDetailDialog;
