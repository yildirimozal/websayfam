'use client';

import React from 'react';
import { 
  Box,
  Card,
  Typography,
  IconButton,
} from '@mui/material';
import Image from 'next/image';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
} from '@mui/icons-material';
import { ResizableBox } from 'react-resizable';
import NoteInteractions from '../NoteInteractions';
import usePublicCorkBoard from './usePublicCorkBoard';

const NoteList: React.FC = () => {
  const { 
    notes, 
    activeNote, 
    handleNoteClick, 
    handleMouseDown, 
    handleResize, 
    handleResizeStop, 
    canEditNote,
    isResizing,
    theme,
    handleDeleteNote,
    setEditingNote,
    setIsDialogOpen,
    handleLikeToggle,
    handleCommentAdd
  } = usePublicCorkBoard();

  return (
    <>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            position: 'absolute',
            left: note.position.x,
            top: note.position.y,
            zIndex: activeNote === note.id ? 1000 : 1,
            touchAction: 'none',
          }}
        >
          <ResizableBox
            width={note.size?.width || 200}
            height={note.size?.height || 150}
            onResize={handleResize(note.id!)}
            onResizeStop={handleResizeStop(note.id!)}
            minConstraints={[150, 100]}
            maxConstraints={[400, 400]}
            resizeHandles={canEditNote(note) ? ['se'] : []}
            draggableOpts={{ enableUserSelectHack: false }}
          >
            <Card
              onClick={(e) => handleNoteClick(e, note)}
              onMouseDown={(e) => handleMouseDown(e, note.id!)}
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
                      setEditingNote(note);
                      setIsDialogOpen(true);
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
                      handleDeleteNote(note.id!);
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
                    noteId={note.id!}
                    likes={note.likes || []}
                    comments={note.comments || []}
                    onLikeToggle={() => handleLikeToggle(note.id!)}
                    onCommentAdd={(content) => handleCommentAdd(note.id!, content)}
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
                  <Image
                    src={note.content}
                    alt="Pano resmi"
                    fill
                    style={{ 
                      objectFit: 'cover',
                      pointerEvents: 'none',
                    }}
                  />
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
          </ResizableBox>
        </div>
      ))}
    </>
  );
};

export default NoteList;
