'use client';

import React, { useState, useRef } from 'react';
import { Box, Card, Fab, Tooltip, useTheme } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { usePublicCorkBoard } from './usePublicCorkBoard';
import NoteCard from './components/NoteCard';
import AddNoteDialog from './components/AddNoteDialog';
import EditNoteDialog from './components/EditNoteDialog';
import CommentDialog from './components/CommentDialog';
import NoteDetailDialog from './components/NoteDetailDialog';
import Timer from './components/Timer';
import { Note } from './types';

const PublicCorkBoard = () => {
  const theme = useTheme();
  const boardRef = useRef<HTMLDivElement>(null);

  const {
    session,
    notes,
    activeNote,
    setActiveNote,
    isResizing,
    setIsResizing,
    canEditNote,
    canMoveNote,
    canAddNote,
    handleAddNote,
    handleDeleteNote,
    handleUpdateNote,
    handleUpdateNotePosition,
    handleUpdateNoteSize,
    handleLikeToggle,
    handleCommentAdd,
    handleCommentDelete,
    remainingTime,
    TIMER_DURATION,
    selectedNote,
    setSelectedNote
  } = usePublicCorkBoard();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [commentNote, setCommentNote] = useState<Note | null>(null);

  const handleEdit = (note: Note) => {
    setEditingNote(note);
  };

  const handleCommentClick = (note: Note) => {
    setCommentNote(note);
  };

  const isAdmin = session?.user?.email === 'ozalyildirim@firat.edu.tr';

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Card
        ref={boardRef}
        sx={{
          height: '100vh',
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
          userSelect: 'none'
        }}
      >
        <Timer remainingTime={remainingTime} totalTime={TIMER_DURATION} />

        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isActive={note.id === activeNote}
            isResizing={isResizing}
            canEdit={canEditNote(note)}
            canMove={canMoveNote(note)}
            isLiked={session?.user?.email ? note.likes.includes(session.user.email) : false}
            onDragStart={() => setActiveNote(note.id)}
            onDragStop={(e, data) => {
              handleUpdateNotePosition(note.id, { x: data.x, y: data.y });
              setActiveNote(null);
            }}
            onResize={(e, direction, ref, delta, position) => {
              setIsResizing(true);
              handleUpdateNoteSize(note.id, {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height)
              });
            }}
            onResizeStop={() => {
              setIsResizing(false);
              setActiveNote(null);
            }}
            onDelete={() => handleDeleteNote(note.id)}
            onLikeToggle={() => handleLikeToggle(note.id)}
            onCommentClick={() => handleCommentClick(note)}
            onEdit={() => handleEdit(note)}
            onClick={() => setSelectedNote(note)}
          />
        ))}

        {session && (isAdmin || canAddNote) && (
          <Tooltip title={canAddNote ? "Yeni Not Ekle" : "Bu periyotta daha fazla not ekleyemezsiniz"}>
            <Box sx={{ position: 'fixed', bottom: 500, right: 460, zIndex: 1000 }}>
              <Fab
                color="primary"
                onClick={() => setIsAddDialogOpen(true)}
                disabled={!canAddNote && !isAdmin}
              >
                <AddIcon />
              </Fab>
            </Box>
          </Tooltip>
        )}

        <AddNoteDialog
          open={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddNote}
        />

        {editingNote && (
          <EditNoteDialog
            note={editingNote}
            open={!!editingNote}
            onClose={() => setEditingNote(null)}
            onSave={(content, color, fontFamily) => {
              handleUpdateNote(editingNote.id, content, color, fontFamily);
              setEditingNote(null);
            }}
          />
        )}

        {commentNote && (
          <CommentDialog
            note={commentNote}
            open={!!commentNote}
            onClose={() => setCommentNote(null)}
            onAddComment={(content) => handleCommentAdd(commentNote.id, content)}
            onDeleteComment={(commentId) => handleCommentDelete(commentNote.id, commentId)}
            canDeleteComment={(comment) => 
              session?.user?.email === comment.author.email ||
              session?.user?.email === 'ozalyildirim@firat.edu.tr'
            }
          />
        )}

        <NoteDetailDialog
          note={selectedNote}
          open={!!selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      </Card>
    </Box>
  );
};

export default PublicCorkBoard;
