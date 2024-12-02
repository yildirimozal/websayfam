'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Note } from './types';

export const usePublicCorkBoard = () => {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [canAddNote, setCanAddNote] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/public-notes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const normalizedNotes = Array.isArray(data.notes) ? data.notes : [];
      setNotes(normalizedNotes);
      
      // Seçili not varsa, onu da güncelle
      if (selectedNote) {
        const updatedSelectedNote = normalizedNotes.find((note: Note) => note.id === selectedNote.id);
        if (updatedSelectedNote) {
          setSelectedNote(updatedSelectedNote);
        }
      }
      
      if (data.timer) {
        setTimerStartTime(new Date(data.timer.startTime));
        setRemainingTime(data.timer.remainingTime);
        
        if (data.timer.wasReset && normalizedNotes.length === 0) {
          setNotes([]);
          setCanAddNote(true);
        }
      }
    } catch (err) {
      console.error('Notları yükleme hatası:', err);
      setError('Notlar yüklenirken bir hata oluştu');
    }
  }, [selectedNote]);

  useEffect(() => {
    fetchNotes();
    const interval = setInterval(fetchNotes, 2000);
    return () => clearInterval(interval);
  }, [fetchNotes]);

  const canEditNote = useCallback((note: Note) => {
    if (!session?.user?.email) return false;
    const isAdmin = session.user.email === 'ozalyildirim@firat.edu.tr';
    return isAdmin || session.user.email === note.author?.email;
  }, [session]);

  const canMoveNote = useCallback((note: Note) => {
    if (!session?.user?.email) return false;
    const isAdmin = session.user.email === 'ozalyildirim@firat.edu.tr';
    if (isAdmin) return true;
    return session.user.email === note.author?.email;
  }, [session]);

  const handleAddNote = async (content: string, type: 'note' | 'image', color: string, fontFamily: string): Promise<void> => {
    if (!session?.user) {
      setError('Not eklemek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await fetch('/api/public-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          type,
          color,
          fontFamily,
          author: {
            name: session.user.name,
            email: session.user.email,
            image: session.user.image
          }
        })
      });

      if (!response.ok) {
        throw new Error('Not eklenemedi');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Not ekleme hatası:', err);
      setError('Not eklenirken bir hata oluştu');
    }
  };

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/public-notes/${noteId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Not silinemedi');
      }

      // Silinen not seçili notsa, seçimi kaldır
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }

      await fetchNotes();
    } catch (err) {
      console.error('Not silme hatası:', err);
      setError('Not silinirken bir hata oluştu');
    }
  };

  const handleUpdateNote = async (noteId: string, content: string, color: string, fontFamily: string): Promise<void> => {
    try {
      const response = await fetch(`/api/public-notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, color, fontFamily })
      });

      if (!response.ok) {
        throw new Error('Not güncellenemedi');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Not güncelleme hatası:', err);
      setError('Not güncellenirken bir hata oluştu');
    }
  };

  const handleUpdateNotePosition = async (noteId: string, position: { x: number; y: number }): Promise<void> => {
    try {
      const response = await fetch(`/api/public-notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position })
      });

      if (!response.ok) {
        throw new Error('Not konumu güncellenemedi');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Not konumu güncelleme hatası:', err);
      setError('Not konumu güncellenirken bir hata oluştu');
    }
  };

  const handleUpdateNoteSize = async (noteId: string, size: { width: number; height: number }): Promise<void> => {
    try {
      const response = await fetch(`/api/public-notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size })
      });

      if (!response.ok) {
        throw new Error('Not boyutu güncellenemedi');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Not boyutu güncelleme hatası:', err);
      setError('Not boyutu güncellenirken bir hata oluştu');
    }
  };

  const handleLikeToggle = async (noteId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/public-notes/${noteId}/like`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Beğeni işlemi başarısız');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Beğeni hatası:', err);
      setError('Beğeni işlemi sırasında bir hata oluştu');
    }
  };

  const handleCommentAdd = async (noteId: string, content: string): Promise<void> => {
    try {
      const response = await fetch(`/api/public-notes/${noteId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Yorum eklenemedi');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Yorum ekleme hatası:', err);
      setError('Yorum eklenirken bir hata oluştu');
    }
  };

  const handleCommentDelete = async (noteId: string, commentId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/public-notes/${noteId}/comment/${commentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Yorum silinemedi');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Yorum silme hatası:', err);
      setError('Yorum silinirken bir hata oluştu');
    }
  };

  // Debug için log ekleyelim
  useEffect(() => {
    console.log('Selected Note:', selectedNote);
  }, [selectedNote]);

  return {
    session,
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    isResizing,
    setIsResizing,
    error,
    setError,
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
    timerStartTime,
    TIMER_DURATION: 12 * 60 * 60 * 1000,
    selectedNote,
    setSelectedNote
  };
};
