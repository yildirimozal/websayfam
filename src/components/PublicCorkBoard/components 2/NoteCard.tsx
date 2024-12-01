'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, Comment as CommentIcon } from '@mui/icons-material';
import Image from 'next/image';
import { ResizableBox } from 'react-resizable';
import { useTheme } from '@mui/material';
import { NoteCardProps } from '../types';

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isActive,
  isResizing,
  canEdit,
  isLiked,
  onDragStart,
  onResize,
  onResizeStop,
  onDelete,
  onLikeToggle,
  onCommentClick,
}) => {
  const theme = useTheme();

  return (
    <ResizableBox
      width={note.size?.width || 200}
      height={note.size?.height || 200}
      onResize={onResize}
      onResizeStop={onResizeStop}
      minConstraints={[150, 150]}
      maxConstraints={[400, 400]}
      resizeHandles={['se']}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <Card
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: note.type === 'note' ? '#fff7ba' : 'white',
          transform: `rotate(${note.rotation}deg) ${isActive ? 'scale(1.02)' : ''}`,
          transition: 'transform 0.2s ease-in-out',
          cursor: canEdit ? (isResizing ? 'se-resize' : 'move') : 'default',
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
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          pb: '40px',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'flex',
            gap: 0.5,
            p: 0.5,
          }}
        >
          {canEdit && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255,0,0,0.1)',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {note.type === 'note' ? (
          <CardContent sx={{ height: 'calc(100% - 40px)', overflow: 'auto', pt: 4, pb: '0 !important' }}>
            <Typography 
              sx={{
                fontSize: '1rem',
                color: '#2c1810',
                lineHeight: 1.5,
                fontFamily: '"Kalam", cursive',
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
              height: 'calc(100% - 40px)',
              p: 1,
              backgroundColor: 'white',
              pt: 4,
            }}
          >
            <Image
              src={note.content}
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
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            padding: '4px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onLikeToggle();
              }}
              sx={{ 
                color: isLiked ? 'red' : 'inherit',
                '&:hover': { color: 'red' },
              }}
            >
              {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {note.likes?.length || 0}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onCommentClick();
              }}
            >
              <CommentIcon />
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {note.comments?.length || 0}
            </Typography>
          </Box>
        </Box>
      </Card>
    </ResizableBox>
  );
};

export default NoteCard;
