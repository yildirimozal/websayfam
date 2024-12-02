'use client';

import React, { useEffect } from 'react';
import { 
  Box,
  Card,
  Typography,
  IconButton,
  useTheme
} from '@mui/material';
import Image from 'next/image';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
} from '@mui/icons-material';
import NoteInteractions from '../NoteInteractions';
import { usePublicCorkBoard } from './usePublicCorkBoard';

const NoteList: React.FC = () => {
  const theme = useTheme();
  const { 
    notes, 
    activeNote,
    isResizing,
    canEditNote,
    handleDeleteNote,
    handleLikeToggle,
    handleCommentAdd,
    setSelectedNote
  } = usePublicCorkBoard();

  // En alttaki notun pozisyonunu bul
  const maxBottom = notes.reduce((max, note) => {
    const bottom = note.position.y + (note.size?.height || 200);
    return Math.max(max, bottom);
  }, 0);

  // Minimum yükseklik 100vh, maksimum yükseklik en alttaki not + 100px
  const containerHeight = Math.max(maxBottom + 100, window.innerHeight);

  // Parent container'ın yüksekliğini güncelle
  useEffect(() => {
    const container = document.querySelector('.public-cork-board');
    if (container) {
      container.style.height = `${containerHeight}px`;
    }
  }, [containerHeight]);

  return (
    <>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            position: 'absolute',
            left: note.position.x,
            top: note.position.y,
            width: note.size?.width || 200,
            height: note.size?.height || 150,
            zIndex: activeNote === note.id ? 1000 : 1,
            touchAction: 'none',
          }}
        >
          <Card
            onClick={() => setSelectedNote(note)}
            sx={{
              width: '100%',
              height: '100%',
              backgroundColor: note.type === 'note' ? '#fff7ba' : 'white',
              transform: `rotate(${note.rotation}deg) ${activeNote === note.id ? 'scale(1.02)' : ''}`,
              transition: 'transform 0.2s ease-in-out',
              cursor: canEditNote(note) ? (isResizing ? 'se-resize' : 'move') : 'pointer',
              boxShadow: `
                ${theme.shadows[activeNote === note.id ? 8 : 2]},
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
              '&:hover': {
                '& .zoom-icon': {
                  opacity: 1,
                }
              }
            }}
          >
            {canEditNote(note) && (
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
                    setSelectedNote(note);
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
                    handleDeleteNote(note.id);
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
              <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
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
                <Box sx={{ mt: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                  {note.author?.name || 'Anonim'}
                </Box>
                <NoteInteractions
                  noteId={note.id}
                  likes={note.likes || []}
                  comments={note.comments?.map(comment => ({
                    ...comment,
                    createdAt: new Date(comment.createdAt)
                  })) || []}
                  onLikeToggle={() => handleLikeToggle(note.id)}
                  onCommentAdd={(content) => handleCommentAdd(note.id, content)}
                />
              </Box>
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
                {note.content && (
                  <Image
                    src={note.content}
                    alt="Pano resmi"
                    fill
                    style={{ 
                      objectFit: 'cover',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 5, 
                  left: 5, 
                  fontSize: '0.8rem', 
                  color: 'text.secondary',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  padding: '2px 6px',
                  borderRadius: 1,
                }}>
                  {note.author?.name || 'Anonim'}
                </Box>
              </Box>
            )}
          </Card>
        </div>
      ))}
    </>
  );
};

export default NoteList;
