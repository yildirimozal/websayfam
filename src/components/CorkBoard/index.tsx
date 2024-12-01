'use client';

import React, { useCallback } from 'react';
import NoteCard from './components/NoteCard';
import AddNoteDialog from './components/AddNoteDialog';
import CorkBoardContainer from './components/CorkBoardContainer';
import { useCorkBoard } from './hooks/useCorkBoard';
import { Note } from './types';

const CorkBoard = () => {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const {
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    isDialogOpen,
    setIsDialogOpen,
    editingNote,
    setEditingNote,
    isResizing,
    setIsResizing,
    error,
    setError,
    isLoading,
    dragOffsetRef,
    activeNoteRef,
    notesRef,
    updateNote,
    handleAddNote,
    handleDeleteNote,
    session
  } = useCorkBoard();

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, noteId: string) => {
    if (!noteId || isResizing || !session?.user?.isAdmin) return;

    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.closest('.react-resizable-handle') ||
      target.closest('button')
    ) {
      return;
    }

    const note = notesRef.current.find(n => n._id === noteId);
    if (!note) return;

    e.preventDefault();
    e.stopPropagation();
    
    setActiveNote(noteId);
    dragOffsetRef.current = {
      x: e.clientX - note.position.x,
      y: e.clientY - note.position.y
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!boardRef.current) return;

      e.preventDefault();
      const bounds = boardRef.current.getBoundingClientRect();
      const newX = Math.min(Math.max(0, e.clientX - dragOffsetRef.current.x), bounds.width - (note.size?.width || 200));
      const newY = Math.min(Math.max(0, e.clientY - dragOffsetRef.current.y), bounds.height - (note.size?.height || 150));

      setActiveNote(noteId);
      notesRef.current = notesRef.current.map(n =>
        n._id === noteId
          ? { ...n, position: { x: newX, y: newY } }
          : n
      );
      
      setNotes(notesRef.current);
    };

    const handleMouseUp = async () => {
      const currentNoteId = activeNoteRef.current;
      if (currentNoteId) {
        const updatedNote = notesRef.current.find(n => n._id === currentNoteId);
        if (updatedNote) {
          await updateNote(currentNoteId, { position: updatedNote.position });
        }
      }
      setActiveNote(null);
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
    };

    document.addEventListener('mousemove', handleMouseMove, { capture: true });
    document.addEventListener('mouseup', handleMouseUp, { capture: true });
  }, [isResizing, session, setActiveNote, updateNote, setNotes]);

  const handleResize = useCallback((noteId: string) => (e: any, { size }: { size: { width: number; height: number } }) => {
    if (!session?.user?.isAdmin) return;

    e.stopPropagation();
    setIsResizing(true);
    setNotes((prev: Note[]) => prev.map((note: Note) =>
      note._id === noteId
        ? { ...note, size }
        : note
    ));
  }, [session, setIsResizing, setNotes]);

  const handleResizeStop = useCallback((noteId: string) => async (e: any, { size }: { size: { width: number; height: number } }) => {
    if (!session?.user?.isAdmin) return;

    e.stopPropagation();
    setIsResizing(false);
    await updateNote(noteId, { size });
  }, [session, setIsResizing, updateNote]);

  const handleNoteAction = async (content: string, type: 'note' | 'image', color: string, fontFamily: string) => {
    if (!content.trim()) return;

    if (editingNote?._id) {
      // Düzenleme modu
      await updateNote(editingNote._id, {
        content: type === 'note' ? content : editingNote.content,
        url: type === 'image' ? content : editingNote.url,
        color,
        fontFamily,
      });
    } else {
      // Yeni not ekleme modu
      await handleAddNote({
        type,
        content: type === 'note' ? content : '',
        url: type === 'image' ? content : undefined,
        color,
        fontFamily,
        position: { x: 50, y: 50 },
        size: { width: type === 'image' ? 300 : 200, height: type === 'image' ? 300 : 200 },
        rotation: Math.random() * 10 - 5,
      });
    }
  };

  return (
    <CorkBoardContainer
      isLoading={isLoading}
      error={error}
      onErrorClose={() => setError(null)}
      isAdmin={!!session?.user?.isAdmin}
      onAddClick={() => {
        setEditingNote(null);
        setIsDialogOpen(true);
      }}
      boardRef={boardRef}
    >
      {notes.map((note) => (
        <div
          key={note._id}
          style={{
            position: 'absolute',
            left: note.position.x,
            top: note.position.y,
            zIndex: activeNote === note._id ? 1000 : 1,
            touchAction: 'none',
          }}
        >
          <NoteCard
            note={note}
            isActive={activeNote === note._id}
            isResizing={isResizing}
            isAdmin={!!session?.user?.isAdmin}
            onMouseDown={(e) => handleMouseDown(e, note._id!)}
            onResize={handleResize(note._id!)}
            onResizeStop={handleResizeStop(note._id!)}
            onEdit={() => {
              setEditingNote(note);
              setIsDialogOpen(true);
            }}
            onDelete={() => handleDeleteNote(note._id!)}
          />
        </div>
      ))}

      {isDialogOpen && (
        <AddNoteDialog
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingNote(null);
          }}
          onAdd={handleNoteAction}
          editingNote={editingNote}
        />
      )}
    </CorkBoardContainer>
  );
};

export default CorkBoard;
