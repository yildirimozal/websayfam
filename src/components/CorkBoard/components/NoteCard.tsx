'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, IconButton, useTheme, Badge, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, Comment as CommentIcon } from '@mui/icons-material';
import Image from 'next/image';
import { ResizableBox } from 'react-resizable';
import { Note, Comment, NoteCardProps } from '../types';
import { useSession, signIn } from 'next-auth/react';

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isActive,
  isResizing,
  isAdmin,
  onMouseDown,
  onResize,
  onResizeStop,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const { data: session } = useSession();
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isViewCommentsDialogOpen, setIsViewCommentsDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(note.likeCount || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(note.commentCount || 0);

  useEffect(() => {
    if (session?.user && note._id) {
      checkLikeStatus();
    }
  }, [session, note._id]);

  const checkLikeStatus = async () => {
    if (!note._id) return;

    try {
      const response = await fetch(`/api/private-notes/${note._id}/like`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Beğeni durumu alınamadı');
      const data = await response.json();
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error('Beğeni durumu kontrol hatası:', error);
    }
  };

  useEffect(() => {
    if (isViewCommentsDialogOpen && note._id) {
      fetchComments();
    }
  }, [isViewCommentsDialogOpen, note._id]);

  const fetchComments = async () => {
    if (!note._id) return;

    try {
      const response = await fetch(`/api/private-notes/${note._id}/comment`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Yorumlar alınamadı');
      const data = await response.json();
      setComments(data.comments);
      setCommentCount(data.commentCount);
    } catch (error) {
      console.error('Yorumları getirme hatası:', error);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user) {
      await signIn('google', { callbackUrl: window.location.href });
      return;
    }

    if (!note._id) {
      console.error('Not ID bulunamadı');
      return;
    }

    try {
      const response = await fetch(`/api/private-notes/${note._id}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Beğeni işlemi başarısız oldu');
      }

      const data = await response.json();
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error('Beğeni hatası:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      await signIn('google', { callbackUrl: window.location.href });
      return;
    }

    if (!note._id) {
      console.error('Not ID bulunamadı');
      return;
    }

    if (!commentText.trim()) return;

    try {
      const response = await fetch(`/api/private-notes/${note._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: commentText }),
      });

      if (!response.ok) {
        throw new Error('Yorum ekleme başarısız oldu');
      }

      const data = await response.json();
      setCommentCount(data.commentCount);
      setCommentText('');
      setIsCommentDialogOpen(false);
      await fetchComments();
    } catch (error) {
      console.error('Yorum hatası:', error);
    }
  };

  const handleCommentClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user) {
      await signIn('google', { callbackUrl: window.location.href });
      return;
    }
    setIsViewCommentsDialogOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <ResizableBox
        width={note.size?.width || 200}
        height={note.size?.height || 150}
        onResize={onResize}
        onResizeStop={onResizeStop}
        minConstraints={[150, 100]}
        maxConstraints={[400, 400]}
        resizeHandles={['se']}
        draggableOpts={{ enableUserSelectHack: false }}
      >
        <Card
          onMouseDown={onMouseDown}
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: note.type === 'note' ? note.color : 'white',
            transform: `rotate(${note.rotation}deg) ${isActive ? 'scale(1.02)' : ''}`,
            transition: 'transform 0.2s ease-in-out',
            cursor: isAdmin ? (isResizing ? 'se-resize' : 'move') : 'default',
            boxShadow: `
              ${theme.shadows[isActive ? 8 : 2]},
              2px 2px 5px rgba(0,0,0,0.1)
            `,
            '&::before': note.type === 'note' ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '10px',
              backgroundColor: 'rgba(0,0,0,0.1)',
              clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)',
            } : undefined,
            userSelect: 'none',
          }}
        >
          {isAdmin && (
            <Box sx={{ 
              position: 'absolute', 
              top: 5, 
              right: 5, 
              zIndex: 1,
              display: 'flex',
              gap: 0.5,
            }}>
              <IconButton 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                sx={{ 
                  opacity: 0,
                  '&:hover': { opacity: 1 },
                  backgroundColor: 'rgba(255,255,255,0.8)',
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                sx={{ 
                  opacity: 0,
                  '&:hover': { opacity: 1 },
                  backgroundColor: 'rgba(255,255,255,0.8)',
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          {note.type === 'note' ? (
            <CardContent sx={{ height: '100%', overflow: 'auto', pt: 4, pb: '36px !important' }}>
              <Typography 
                sx={{
                  fontSize: '1rem',
                  color: '#2c1810',
                  lineHeight: 1.5,
                  fontFamily: note.fontFamily || 'Roboto',
                  fontWeight: 400,
                  pointerEvents: 'none',
                }}
              >
                {note.content}
              </Typography>
            </CardContent>
          ) : (
            <Box 
              sx={{ 
                position: 'relative',
                width: '100%',
                height: '100%',
                p: 1,
                backgroundColor: 'white',
                pt: 4,
              }}
            >
              <Image
                src={note.url || ''}
                alt="Pano resmi"
                fill
                style={{ 
                  objectFit: 'cover',
                  pointerEvents: 'none',
                }}
              />
            </Box>
          )}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: '4px',
              backgroundColor: 'rgba(255,255,255,0.8)',
            }}
          >
            <IconButton
              size="small"
              onClick={handleLike}
              sx={{ 
                color: isLiked ? 'red' : 'inherit',
                '&:hover': { color: 'red' },
              }}
            >
              <Badge badgeContent={likeCount} color="primary">
                {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </Badge>
            </IconButton>
            <IconButton
              size="small"
              onClick={handleCommentClick}
            >
              <Badge badgeContent={commentCount} color="primary">
                <CommentIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Box>
        </Card>
      </ResizableBox>

      {/* Yorum Ekleme Dialog'u */}
      <Dialog
        open={isCommentDialogOpen}
        onClose={() => setIsCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yorum Ekle</DialogTitle>
        <form onSubmit={handleComment}>
          <DialogContent>
            <TextField
              autoFocus
              multiline
              rows={3}
              fullWidth
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCommentDialogOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="contained" disabled={!commentText.trim()}>
              Gönder
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Yorumları Görüntüleme Dialog'u */}
      <Dialog
        open={isViewCommentsDialogOpen}
        onClose={() => setIsViewCommentsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Yorumlar
          <Button
            variant="contained"
            size="small"
            sx={{ float: 'right' }}
            onClick={(e) => {
              e.stopPropagation();
              setIsViewCommentsDialogOpen(false);
              setIsCommentDialogOpen(true);
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
          <Button onClick={() => setIsViewCommentsDialogOpen(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NoteCard;
