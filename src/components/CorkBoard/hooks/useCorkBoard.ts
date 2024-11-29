import { useState, useRef, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { useSession } from 'next-auth/react';

export const useCorkBoard = () => {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const activeNoteRef = useRef<string | null>(null);
  const notesRef = useRef<Note[]>([]);
  const previousNotesRef = useRef<Note[]>([]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    activeNoteRef.current = activeNote;
  }, [activeNote]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/private-notes');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Notlar yüklenirken hata oluştu');
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Notlar yüklenirken beklenmeyen bir hata oluştu');
      }
      console.error('Notlar yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    const note = notesRef.current.find(n => n._id === noteId);
    if (!note) return;

    previousNotesRef.current = notesRef.current;
    try {
      const response = await fetch(`/api/private-notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Not güncellenirken hata oluştu');
      }

      const data = await response.json();
      setNotes(prev => prev.map(n => 
        n._id === noteId ? { ...n, ...data } : n
      ));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Not güncellenirken beklenmeyen bir hata oluştu');
      }
      setNotes(previousNotesRef.current);
      console.error('Not güncellenirken hata:', error);
    }
  };

  const handleAddNote = async () => {
    if (!editingNote || !session?.user?.isAdmin) return;

    try {
      const method = editingNote._id ? 'PUT' : 'POST';
      const endpoint = editingNote._id ? `/api/private-notes/${editingNote._id}` : '/api/private-notes';
      const body = editingNote._id 
        ? JSON.stringify(editingNote)
        : JSON.stringify({
            ...editingNote,
            position: { x: 20, y: 20 },
            rotation: Math.random() * 6 - 3,
            size: { width: 200, height: 150 },
            color: 'yellow',
            userId: session.user.id,
            likes: [],
            comments: []
          });

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Not eklenirken/güncellenirken hata oluştu');
      }

      await fetchNotes();
      setIsDialogOpen(false);
      setEditingNote(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Not eklenirken/güncellenirken beklenmeyen bir hata oluştu');
      }
      console.error('Not eklenirken/güncellenirken hata:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!session?.user?.isAdmin) return;

    try {
      const response = await fetch(`/api/private-notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Not silinirken hata oluştu');
      }

      await fetchNotes();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Not silinirken beklenmeyen bir hata oluştu');
      }
      console.error('Not silinirken hata:', error);
    }
  };

  return {
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
  };
};
