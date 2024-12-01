import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
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
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
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
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLiked = session?.user?.email && likes.includes(session.user.email);

  const handleLikeClick = async () => {
    if (!session) {
      setError('Beğeni yapmak için giriş yapmalısınız');
      return;
    }

    try {
      setIsLoading(true);
      await onLikeToggle();
    } catch (error) {
      setError('Beğeni işlemi sırasında bir hata oluştu');
      console.error('Beğeni hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!session) {
      setError('Yorum yapmak için giriş yapmalısınız');
      return;
    }

    if (!newComment.trim()) return;

    try {
      setIsLoading(true);
      await onCommentAdd(newComment.trim());
      setNewComment('');
      setIsCommentDialogOpen(false);
    } catch (error) {
      setError('Yorum eklenirken bir hata oluştu');
      console.error('Yorum hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton 
        onClick={handleLikeClick}
        disabled={isLoading || !session}
        size="small"
        color="error"
      >
        {isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : isLiked ? (
          <FavoriteIcon />
        ) : (
          <FavoriteBorderIcon />
        )}
      </IconButton>
      <Typography variant="body2" sx={{ mr: 2 }}>
        {likes.length}
      </Typography>

      <IconButton
        onClick={() => setShowComments(true)}
        size="small"
        color="primary"
      >
        <CommentIcon />
      </IconButton>
      <Typography variant="body2">
        {comments.length}
      </Typography>

      {/* Yorumlar Dialog */}
      <Dialog
        open={showComments}
        onClose={() => setShowComments(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yorumlar</DialogTitle>
        <DialogContent>
          <List>
            {comments.map((comment, index) => (
              <React.Fragment key={comment._id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{comment.userName[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={comment.userName}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {comment.content}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(comment.createdAt), { 
                            addSuffix: true,
                            locale: tr 
                          })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < comments.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', p: 2, gap: 1 }}>
          {session ? (
            <>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Yorumunuzu yazın..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isLoading}
              />
              <Box sx={{ alignSelf: 'flex-end' }}>
                <Button onClick={() => setShowComments(false)}>
                  İptal
                </Button>
                <Button 
                  onClick={handleCommentSubmit}
                  variant="contained"
                  disabled={!newComment.trim() || isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Yorum Yap'
                  )}
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Yorum yapmak için giriş yapmalısınız
            </Typography>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NoteInteractions;
