'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Fab, Tooltip, useTheme } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { usePublicCorkBoard } from './usePublicCorkBoard';
import NoteCard from './components/NoteCard';
import AddNoteDialog from './components/AddNoteDialog';
import EditNoteDialog from './components/EditNoteDialog';
import CommentDialog from './components/CommentDialog';
import NoteDetailDialog from './components/NoteDetailDialog';
import Timer from './components/Timer';
import { Note } from './types';
import { useSession } from 'next-auth/react';

const PublicCorkBoard = () => {
  const theme = useTheme();
  const { data: session } = useSession();
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardHeight, setBoardHeight] = useState<number>(0);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const {
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
  } = usePublicCorkBoard();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [commentNote, setCommentNote] = useState<Note | null>(null);

  // Client-side'da window.innerHeight'ı ayarla
  useEffect(() => {
    setBoardHeight(window.innerHeight);
  }, []);

  // Yüksekliği hesapla ve güncelle
  const updateBoardHeight = useCallback(() => {
    if (notes.length === 0) {
      setBoardHeight(window.innerHeight);
      return;
    }

    const maxBottom = notes.reduce((max, note) => {
      const bottom = note.position.y + (note.size?.height || 200);
      return Math.max(max, bottom);
    }, 0);

    setBoardHeight(Math.max(maxBottom + 100, window.innerHeight));
  }, [notes]);

  // Not listesi değiştiğinde yüksekliği güncelle
  useEffect(() => {
    updateBoardHeight();
  }, [notes, updateBoardHeight]);

  // Aktif not veya boyutlandırma durumu değiştiğinde yüksekliği güncelle
  useEffect(() => {
    if (activeNote || isResizing) {
      const interval = setInterval(updateBoardHeight, 100);
      return () => clearInterval(interval);
    }
  }, [activeNote, isResizing, updateBoardHeight]);

  // Pencere boyutu değiştiğinde yüksekliği güncelle
  useEffect(() => {
    window.addEventListener('resize', updateBoardHeight);
    return () => window.removeEventListener('resize', updateBoardHeight);
  }, [updateBoardHeight]);

  // Seçili notu güncelle
  useEffect(() => {
    if (selectedNote) {
      const updatedNote = notes.find(note => note.id === selectedNote.id);
      if (updatedNote) {
        setSelectedNote(updatedNote);
      }
    }
  }, [notes, selectedNote]);

  const handleEdit = useCallback((note: Note) => {
    setEditingNote(note);
  }, []);

  const handleCommentClick = useCallback((note: Note) => {
    setCommentNote(note);
  }, []);

  const handleNoteClick = useCallback((note: Note) => {
    console.log('Note clicked:', note);
    setSelectedNote(note);
    setIsDetailDialogOpen(true);
  }, []);

  const handleDetailClose = useCallback(() => {
    console.log('Closing detail dialog');
    setIsDetailDialogOpen(false);
    setSelectedNote(null);
  }, []);

  const handleNoteLikeToggle = useCallback(async (noteId: string) => {
    await handleLikeToggle(noteId);
  }, [handleLikeToggle]);

  const handleNoteCommentAdd = useCallback(async (noteId: string, content: string) => {
    await handleCommentAdd(noteId, content);
  }, [handleCommentAdd]);

  const handleNoteCommentDelete = useCallback(async (noteId: string, commentId: string) => {
    await handleCommentDelete(noteId, commentId);
  }, [handleCommentDelete]);

  const isAdmin = session?.user?.email === 'ozalyildirim@firat.edu.tr';

  return (
    <div
      ref={boardRef}
      style={{
        height: boardHeight,
        maxHeight: 2000,
        backgroundColor: '#D2B48C',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%),
          repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 4px)
        `,
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        borderRadius: '8px',
        padding: '16px',
        border: '12px solid #BC8F8F',
        position: 'relative',
        userSelect: 'none',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <Timer remainingTime={remainingTime} totalTime={TIMER_DURATION} />

      {session && (isAdmin || canAddNote) && (
        <Tooltip title={canAddNote ? "Yeni Not Ekle" : "Bu periyotta daha fazla not ekleyemezsiniz"}>
          <div style={{ 
            position: 'absolute',
            top: 1,
            left: 4,
            zIndex: 1000
          }}>
            <Fab
              color="primary"
              onClick={() => setIsAddDialogOpen(true)}
              disabled={!canAddNote && !isAdmin}
              size="medium"
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              <AddIcon />
            </Fab>
          </div>
        </Tooltip>
      )}

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
            updateBoardHeight();
          }}
          onResize={(e, direction, ref, delta, position) => {
            setIsResizing(true);
            handleUpdateNoteSize(note.id, {
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height)
            });
            updateBoardHeight();
          }}
          onResizeStop={() => {
            setIsResizing(false);
            setActiveNote(null);
            updateBoardHeight();
          }}
          onDelete={() => {
            handleDeleteNote(note.id);
            updateBoardHeight();
          }}
          onLikeToggle={() => handleLikeToggle(note.id)}
          onCommentClick={() => handleCommentClick(note)}
          onEdit={() => handleEdit(note)}
          onClick={() => handleNoteClick(note)}
        />
      ))}

      <AddNoteDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={async (content, type, color, fontFamily) => {
          await handleAddNote(content, type, color, fontFamily);
          updateBoardHeight();
        }}
      />

      {editingNote && (
        <EditNoteDialog
          note={editingNote}
          open={!!editingNote}
          onClose={() => setEditingNote(null)}
          onSave={async (content, color, fontFamily) => {
            await handleUpdateNote(editingNote.id, content, color, fontFamily);
            setEditingNote(null);
            updateBoardHeight();
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
        open={isDetailDialogOpen}
        onClose={handleDetailClose}
        onLikeToggle={handleNoteLikeToggle}
        onCommentAdd={handleNoteCommentAdd}
        onCommentDelete={handleNoteCommentDelete}
        isLiked={selectedNote && session?.user?.email ? selectedNote.likes.includes(session.user.email) : false}
      />
    </div>
  );
};

export default PublicCorkBoard;
