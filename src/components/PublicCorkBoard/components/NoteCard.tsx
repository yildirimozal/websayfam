'use client';

import React from 'react';
import { Card, CardContent, CardActions, IconButton, Typography, Box, Tooltip, Avatar, Badge } from '@mui/material';
import { Rnd } from 'react-rnd';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  isResizing: boolean;
  canEdit: boolean;
  canMove: boolean;
  isLiked: boolean;
  onDragStart: () => void;
  onResize: (e: any, direction: any, ref: any, delta: any, position: any) => void;
  onResizeStop: () => void;
  onDelete: () => void;
  onLikeToggle: () => void;
  onCommentClick: () => void;
  onEdit: () => void;
  onDragStop: (e: any, data: { x: number; y: number }) => void;
  onClick?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isActive,
  isResizing,
  canEdit,
  canMove,
  isLiked,
  onDragStart,
  onResize,
  onResizeStop,
  onDelete,
  onLikeToggle,
  onCommentClick,
  onEdit,
  onDragStop,
  onClick
}) => {
  const handleClick = (e: React.MouseEvent) => {
    // Eğer tıklama butonlardan geldiyse detay görünümünü açma
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.();
  };

  return (
    <Rnd
      size={{ width: note.size.width, height: note.size.height }}
      position={{ x: note.position.x, y: note.position.y }}
      enableResizing={canEdit ? {
        bottom: true,
        right: true,
        bottomRight: true
      } : false}
      disableDragging={!canMove}
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      onResize={onResize}
      onResizeStop={onResizeStop}
      bounds="parent"
      style={{
        zIndex: isActive ? 1000 : 1
      }}
    >
      <Card
        onClick={handleClick}
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: note.type === 'note' ? note.color : 'white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'box-shadow 0.3s ease',
          cursor: canMove ? 'grab' : 'pointer',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          },
          '&:active': {
            cursor: canMove ? 'grabbing' : 'pointer',
          },
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transform: `rotate(${note.rotation}deg)`
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1,
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: 'rgba(255,255,255,0.5)',
            zIndex: 1
          }}
        >
          <Avatar
            src={note.author?.image || '/default-avatar.png'}
            alt={note.author?.name || ''}
            sx={{ 
              width: 32,
              height: 32,
              mr: 1,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {note.author?.name?.charAt(0)}
          </Avatar>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {note.author?.name}
          </Typography>
        </Box>

        <CardContent 
          sx={{ 
            flexGrow: 1, 
            p: 0,
            position: 'relative',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {note.type === 'note' ? (
            <Box sx={{ p: 2, width: '100%', height: '100%' }}>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: note.fontFamily,
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  color: '#2c1810'
                }}
              >
                {note.content}
              </Typography>
            </Box>
          ) : (
            <Box 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              <img
                src={note.content}
                alt={`${note.author?.name}'in resmi`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: 'block'
                }}
                onError={(e) => {
                  console.error('Resim yüklenemedi:', note.content);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Box>
          )}
        </CardContent>

        <CardActions
          sx={{
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            p: 1,
            zIndex: 1
          }}
        >
          <Box>
            <Tooltip title={isLiked ? "Beğeniyi kaldır" : "Beğen"}>
              <Badge
                badgeContent={note.likes.length}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    right: 5,
                    top: 5,
                    border: `2px solid ${note.color}`
                  }
                }}
              >
                <IconButton
                  size="small"
                  onClick={onLikeToggle}
                  color={isLiked ? "primary" : "default"}
                >
                  {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Badge>
            </Tooltip>
            <Tooltip title="Yorumlar">
              <Badge
                badgeContent={note.comments.length}
                color="primary"
                sx={{
                  ml: 1,
                  '& .MuiBadge-badge': {
                    right: 5,
                    top: 5,
                    border: `2px solid ${note.color}`
                  }
                }}
              >
                <IconButton
                  size="small"
                  onClick={onCommentClick}
                >
                  <CommentIcon />
                </IconButton>
              </Badge>
            </Tooltip>
          </Box>

          {canEdit && (
            <Box>
              <Tooltip title="Düzenle">
                <IconButton
                  size="small"
                  onClick={onEdit}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sil">
                <IconButton
                  size="small"
                  onClick={onDelete}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </CardActions>

        {canEdit && !isResizing && (
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 20,
              height: 20,
              cursor: 'se-resize',
              backgroundColor: 'transparent',
              zIndex: 2
            }}
          />
        )}
      </Card>
    </Rnd>
  );
};

export default NoteCard;
