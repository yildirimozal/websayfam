'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, IconButton, useTheme, Badge, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, ListItemText, Divider, useMediaQuery, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, Comment as CommentIcon } from '@mui/icons-material';
import Image from 'next/image';
import { ResizableBox } from 'react-resizable';
import { Note, Comment, NoteCardProps } from '../types';
import { useSession, signIn } from 'next-auth/react';
import NoteDetailDialog from './NoteDetailDialog';

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
  const isXsScreen = useMediaQuery('(max-width:320px)');
  const isSmScreen = useMediaQuery('(max-width:375px)');
  
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isViewCommentsDialogOpen, setIsViewCommentsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(note.likeCount || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(note.commentCount || 0);

  useEffect(() => {
    if (note._id) {
      fetchLikeStatus();
    }
  }, [note._id]);

  const fetchLikeStatus = async () => {
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
    setIsViewCommentsDialogOpen(true);
  };

  const handleAddCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user) {
      signIn('google', { callbackUrl: window.location.href });
      return;
    }
    setIsViewCommentsDialogOpen(false);
    setIsCommentDialogOpen(true);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAdmin && !isResizing) {
      setIsDetailDialogOpen(true);
    } else {
      onMouseDown(e);
    }
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
        minConstraints={[isXsScreen ? 120 : (isSmScreen ? 150 : 200), isXsScreen ? 80 : (isSmScreen ? 100 : 150)]}
        maxConstraints={[isXsScreen ? 280 : (isSmScreen ? 320 : 800), isXsScreen ? 400 : (isSmScreen ? 500 : 800)]}
        resizeHandles={['se']}
        draggableOpts={{ enableUserSelectHack: false }}
      >
        <Card
          onMouseDown={handleCardClick}
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: note.type === 'note' ? note.color : 'white',
            transform: `rotate(${note.rotation}deg) ${isActive ? 'scale(1.02)' : ''}`,
            transition: 'transform 0.2s ease-in-out',
            cursor: isAdmin ? (isResizing ? 'se-resize' : 'move') : 'pointer',
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
              width: isXsScreen ? '30px' : '40px',
              height: isXsScreen ? '8px' : '10px',
              backgroundColor: 'rgba(0,0,0,0.1)',
              clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)',
            } : undefined,
            userSelect: 'none',
          }}
        >
          {isAdmin && (
            <Box sx={{ 
              position: 'absolute', 
              top: isXsScreen ? 2 : 5, 
              right: isXsScreen ? 2 : 5, 
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
                  padding: isXsScreen ? '4px' : '8px',
                }}
              >
                <EditIcon sx={{ fontSize: isXsScreen ? '0.9rem' : '1.2rem' }} />
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
                  padding: isXsScreen ? '4px' : '8px',
                }}
              >
                <DeleteIcon sx={{ fontSize: isXsScreen ? '0.9rem' : '1.2rem' }} />
              </IconButton>
            </Box>
          )}
          {note.type === 'note' ? (
            <CardContent sx={{ 
              height: '100%', 
              overflow: 'auto', 
              pt: isXsScreen ? 3 : 4, 
              pb: '36px !important',
              px: isXsScreen ? 1 : 2
            }}>
              <Typography 
                sx={{
                  fontSize: {
                    xs: '0.875rem',
                    sm: '0.9rem',
                    md: '1rem'
                  },
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
                p: isXsScreen ? 0.5 : 1,
                backgroundColor: 'white',
                pt: isXsScreen ? 3 : 4,
              }}
            >
              <Image
                src={note.url || ''}
                alt="Pano resmi"
                fill
                style={{ 
                  objectFit: 'contain',
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
              padding: isXsScreen ? '2px' : '4px',
              backgroundColor: 'rgba(255,255,255,0.8)',
            }}
          >
            <Tooltip title={session ? '' : 'Beğenmek için giriş yapın'}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleLike}
                  disabled={!session}
                  sx={{ 
                    color: isLiked ? 'red' : 'inherit',
                    '&:hover': { color: session ? 'red' : 'inherit' },
                    padding: isXsScreen ? '4px' : '8px',
                    opacity: session ? 1 : 0.6
                  }}
                >
                  <Badge 
                    badgeContent={likeCount} 
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: isXsScreen ? '0.6rem' : '0.75rem',
                        minWidth: isXsScreen ? '14px' : '20px',
                        height: isXsScreen ? '14px' : '20px',
                      }
                    }}
                  >
                    {isLiked ? 
                      <FavoriteIcon sx={{ fontSize: isXsScreen ? '0.9rem' : '1.2rem' }} /> : 
                      <FavoriteBorderIcon sx={{ fontSize: isXsScreen ? '0.9rem' : '1.2rem' }} />
                    }
                  </Badge>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={session ? '' : 'Yorum yapmak için giriş yapın'}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleCommentClick}
                  sx={{ 
                    padding: isXsScreen ? '4px' : '8px',
                    opacity: session ? 1 : 0.6
                  }}
                >
                  <Badge 
                    badgeContent={commentCount} 
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: isXsScreen ? '0.6rem' : '0.75rem',
                        minWidth: isXsScreen ? '14px' : '20px',
                        height: isXsScreen ? '14px' : '20px',
                      }
                    }}
                  >
                    <CommentIcon sx={{ fontSize: isXsScreen ? '0.9rem' : '1.2rem' }} />
                  </Badge>
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Card>
      </ResizableBox>

      {/* Detay Dialog'u */}
      <NoteDetailDialog
        note={note}
        open={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        onLike={handleLike}
        isLiked={isLiked}
        likeCount={likeCount}
        commentCount={commentCount}
        onCommentClick={() => setIsViewCommentsDialogOpen(true)}
      />

      {/* Yorum Ekleme Dialog'u */}
      <Dialog
        open={isCommentDialogOpen}
        onClose={() => setIsCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isXsScreen}
      >
        <DialogTitle sx={{ 
          fontSize: isXsScreen ? '1.1rem' : '1.25rem',
          p: isXsScreen ? 2 : 3
        }}>
          Yorum Ekle
        </DialogTitle>
        <form onSubmit={handleComment}>
          <DialogContent sx={{ p: isXsScreen ? 2 : 3 }}>
            <TextField
              autoFocus
              multiline
              rows={3}
              fullWidth
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: isXsScreen ? '0.875rem' : '1rem'
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: isXsScreen ? 2 : 3 }}>
            <Button 
              onClick={() => setIsCommentDialogOpen(false)}
              size={isXsScreen ? "small" : "medium"}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!commentText.trim()}
              size={isXsScreen ? "small" : "medium"}
            >
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
        fullScreen={isXsScreen}
      >
        <DialogTitle sx={{ 
          fontSize: isXsScreen ? '1.1rem' : '1.25rem',
          p: isXsScreen ? 2 : 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Yorumlar</span>
          {session && (
            <Button
              variant="contained"
              size={isXsScreen ? "small" : "medium"}
              sx={{ 
                fontSize: isXsScreen ? '0.75rem' : '0.875rem'
              }}
              onClick={handleAddCommentClick}
            >
              Yorum Ekle
            </Button>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: isXsScreen ? 1 : 2 }}>
          <List>
            {comments.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="Henüz yorum yapılmamış"
                  primaryTypographyProps={{
                    fontSize: isXsScreen ? '0.875rem' : '1rem'
                  }}
                />
              </ListItem>
            ) : (
              comments.map((comment, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={comment.content}
                      secondary={formatDate(comment.createdAt)}
                      primaryTypographyProps={{
                        fontSize: isXsScreen ? '0.875rem' : '1rem'
                      }}
                      secondaryTypographyProps={{
                        fontSize: isXsScreen ? '0.75rem' : '0.875rem'
                      }}
                    />
                  </ListItem>
                  {index < comments.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: isXsScreen ? 2 : 3 }}>
          <Button 
            onClick={() => setIsViewCommentsDialogOpen(false)}
            size={isXsScreen ? "small" : "medium"}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NoteCard;
