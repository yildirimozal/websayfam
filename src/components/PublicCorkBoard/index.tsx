'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Card, useTheme, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import NoteCard from './components/NoteCard';
import AddNoteDialog from './components/AddNoteDialog';
import EditNoteDialog from './components/EditNoteDialog';
import CommentDialog from './components/CommentDialog';
import { usePublicCorkBoard } from './usePublicCorkBoard';
import type { Note } from './types';

const PublicCorkBoard = () => {
  const theme = useTheme();
  const boardRef = useRef<HTMLDivElement>(null);
  const {
    session,
    notes,
    activeNote,
    setActiveNote,
    dragOffset,
    setDragOffset,
    isResizing,
    setIsResizing,
    canEditNote,
    canMoveNote,
    handleAddNote,
    handleDeleteNote,
    handleUpdateNote,
    handleUpdateNotePosition,
    handleUpdateNoteSize,
    handleLikeToggle,
    handleCommentAdd,
    handleCommentDelete,
  } = usePublicCorkBoard();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activeNote && boardRef.current) {
        const note = notes.find(n => n.id === activeNote);
        if (note) {
          const rect = boardRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - dragOffset.x;
          const y = e.clientY - rect.top - dragOffset.y;
          handleUpdateNotePosition(note.id, { x, y });
        }
      }
    };

    const handleMouseUp = () => {
      if (activeNote) {
        setActiveNote(null);
      }
    };

    if (activeNote) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeNote, notes, dragOffset, handleUpdateNotePosition, setActiveNote]);

  const handleDragStart = (note: Note) => (e: React.MouseEvent | React.TouchEvent) => {
    if (!canMoveNote(note)) return;

    if (e.type === 'mousedown') {
      const mouseEvent = e as React.MouseEvent;
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
      });
    }
    setActiveNote(note.id);
  };

  const handleResize = (note: Note) => (e: any, { size }: any) => {
    setIsResizing(true);
    handleUpdateNoteSize(note.id, size);
  };

  const handleResizeStop = () => {
    setIsResizing(false);
  };

  const handleCommentClick = (note: Note) => {
    setSelectedNote(note);
    setIsCommentDialogOpen(true);
  };

  const handleEditClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditDialogOpen(true);
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <Card
        ref={boardRef}
        sx={{
          height: '100%',
          width: '100%',
          backgroundColor: '#D2B48C',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%),
            repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 4px)
          `,
          boxShadow: theme.shadows[3],
          borderRadius: 2,
          p: 2,
          position: 'relative',
          overflow: 'hidden',
          border: '12px solid #BC8F8F',
          touchAction: 'none',
          cursor: activeNote ? 'grabbing' : 'default',
        }}
      >
        {notes.map((note) => (
          <Box
            key={note.id}
            sx={{
              position: 'absolute',
              left: note.position.x,
              top: note.position.y,
              transform: `rotate(${note.rotation}deg)`,
              transition: activeNote === note.id ? 'none' : 'transform 0.3s ease-in-out',
              zIndex: activeNote === note.id ? 1000 : 1,
              cursor: canMoveNote(note) ? 'grab' : 'default',
              '&:hover': {
                zIndex: 999
              }
            }}
          >
            <NoteCard
              note={note}
              isActive={note.id === activeNote}
              isResizing={isResizing}
              canEdit={canEditNote(note)}
              canMove={canMoveNote(note)}
              isLiked={note.likes.includes(session?.user?.email || '')}
              onDragStart={handleDragStart(note)}
              onResize={handleResize(note)}
              onResizeStop={handleResizeStop}
              onDelete={() => handleDeleteNote(note.id)}
              onLikeToggle={() => handleLikeToggle(note.id)}
              onCommentClick={() => handleCommentClick(note)}
              onEdit={() => handleEditClick(note)}
            />
          </Box>
        ))}

        {session?.user && (
          <Fab
            color="primary"
            aria-label="add note"
            onClick={() => setIsAddDialogOpen(true)}
            sx={{
              position: 'absolute',
              right: 20,
              top: 20,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              width: 56,
              height: 56,
              boxShadow: theme.shadows[8],
              zIndex: 1300,
            }}
          >
            <AddIcon />
          </Fab>
        )}

        <AddNoteDialog
          open={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddNote}
        />

        {selectedNote && (
          <>
            <EditNoteDialog
              open={isEditDialogOpen}
              onClose={() => setIsEditDialogOpen(false)}
              note={selectedNote}
              onSave={(content: string) => handleUpdateNote(selectedNote.id, content)}
            />

            <CommentDialog
              open={isCommentDialogOpen}
              onClose={() => setIsCommentDialogOpen(false)}
              comments={selectedNote.comments}
              onAdd={(content: string) => handleCommentAdd(selectedNote.id, content)}
              onDelete={(commentId: string) => handleCommentDelete(selectedNote.id, commentId)}
              noteAuthorEmail={selectedNote.author.email}
            />
          </>
        )}
      </Card>
    </Box>
  );
};

export default PublicCorkBoard;
