'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Note } from './types';

export const generateTempId = () => Math.random().toString(36).substr(2, 9);

// 12 saat = 12 * 60 * 60 * 1000 milisaniye
const TIMER_DURATION = 12 * 60 * 60 * 1000;

// Maksimum not boyutları
const MAX_NOTE_SIZE = {
  width: 250,
  height: 250
};

export const usePublicCorkBoard = () => {
  const { data: session, status } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [canAddNote, setCanAddNote] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const normalizeNote = useCallback((note: any): Note => {
    return {
      id: note.id || note._id || generateTempId(),
      content: note.content || '',
      type: note.type || 'note',
      url: note.url,
      author: note.author || null,
      position: note.position && typeof note.position.x === 'number' && typeof note.position.y === 'number' 
        ? note.position 
        : { x: 50, y: 50 },
      size: note.size && typeof note.size.width === 'number' && typeof note.size.height === 'number'
        ? {
            width: Math.min(note.size.width, MAX_NOTE_SIZE.width),
            height: Math.min(note.size.height, MAX_NOTE_SIZE.height)
          }
        : { width: 200, height: 200 },
      rotation: typeof note.rotation === 'number' ? note.rotation : 0,
      color: note.color || '#fff9c4',
      fontFamily: note.fontFamily || 'Roboto',
      likes: Array.isArray(note.likes) ? note.likes : [],
      comments: Array.isArray(note.comments) ? note.comments : [],
      createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
      updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date()
    };
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/public-notes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Server'dan gelen notları ve sayaç bilgisini işle
      const normalizedNotes = Array.isArray(data.notes) ? data.notes.map(normalizeNote) : [];
      setNotes(normalizedNotes);
      
      if (data.timer) {
        setTimerStartTime(new Date(data.timer.startTime));
        setRemainingTime(data.timer.remainingTime);
        
        // Eğer notlar sıfırlanmışsa ve client'ta hala notlar varsa
        if (data.timer.wasReset && normalizedNotes.length === 0) {
          setNotes([]);
          setCanAddNote(true); // Timer sıfırlandığında not ekleme hakkını geri ver
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu';
      setError(`Notları yüklerken hata: ${errorMessage}`);
      console.error('Notları yükleme hatası:', err);
    }
  }, [normalizeNote]);

  useEffect(() => {
    fetchNotes();
    
    // Her 5 saniyede bir sayaç bilgisini güncelle
    const interval = setInterval(fetchNotes, 5000);
    
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

    if (!session.user.name || !session.user.email) {
      setError('Kullanıcı bilgileri eksik');
      return;
    }

    try {
      const noteData = {
        content: content,
        type,
        position: { x: 50, y: 50 },
        size: { 
          width: Math.min(type === 'image' ? 250 : 200, MAX_NOTE_SIZE.width),
          height: Math.min(type === 'image' ? 250 : 200, MAX_NOTE_SIZE.height)
        },
        rotation: Math.random() * 10 - 5,
        color,
        fontFamily,
        author: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image || '/default-avatar.png'
        }
      };

      console.log('Creating note with data:', noteData);

      const response = await fetch('/api/public-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Not eklenemedi');
      }

      const data = await response.json();
      
      // Server'dan gelen notu ve sayaç bilgisini işle
      if (data.note) {
        setNotes(prev => [...prev, normalizeNote(data.note)]);
        // Admin değilse not ekleme hakkını kullandır
        if (session.user.email !== 'ozalyildirim@firat.edu.tr') {
          setCanAddNote(false);
        }
      }
      
      if (data.timer) {
        setTimerStartTime(new Date(data.timer.startTime));
        setRemainingTime(data.timer.remainingTime);
      }
    } catch (err) {
      console.error('Not ekleme hatası:', err);
      if (err instanceof Error && err.message.includes('Bu periyotta zaten bir not eklediniz')) {
        setCanAddNote(false);
      }
      setError(err instanceof Error ? err.message : 'Not eklenirken bir hata oluştu');
    }
  };

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    if (!session?.user) {
      setError('Not silmek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await fetch(`/api/public-notes/${noteId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Not silinemedi');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Not silme hatası:', err);
      setError('Not silinirken bir hata oluştu');
    }
  };

  const handleUpdateNote = async (noteId: string, content: string, color: string, fontFamily: string): Promise<void> => {
    if (!session?.user) {
      setError('Not güncellemek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await fetch(`/api/public-notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, color, fontFamily })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Not güncellenemedi');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Not güncelleme hatası:', err);
      setError('Not güncellenirken bir hata oluştu');
    }
  };

  const handleUpdateNotePosition = async (noteId: string, position: { x: number; y: number }): Promise<void> => {
    try {
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId 
            ? { ...note, position }
            : note
        )
      );

      const response = await fetch(`/api/public-notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Not konumu güncellenemedi');
      }
    } catch (err) {
      console.error('Not konumu güncelleme hatası:', err);
      setError('Not konumu güncellenirken bir hata oluştu');
      await fetchNotes();
    }
  };

  const handleUpdateNoteSize = async (noteId: string, size: { width: number; height: number }): Promise<void> => {
    if (!session?.user) {
      setError('Not boyutunu güncellemek için giriş yapmalısınız');
      return;
    }

    try {
      // Boyutu maksimum değerlerle sınırla
      const limitedSize = {
        width: Math.min(size.width, MAX_NOTE_SIZE.width),
        height: Math.min(size.height, MAX_NOTE_SIZE.height)
      };

      const response = await fetch(`/api/public-notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: limitedSize })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Not boyutu güncellenemedi');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Not boyutu güncelleme hatası:', err);
      setError('Not boyutu güncellenirken bir hata oluştu');
    }
  };

  const handleLikeToggle = async (noteId: string): Promise<void> => {
    if (!session?.user) {
      setError('Beğenmek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await fetch(`/api/public-notes/${noteId}/like`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Beğeni işlemi başarısız');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Beğeni hatası:', err);
      setError('Beğeni işlemi sırasında bir hata oluştu');
    }
  };

  const handleCommentAdd = async (noteId: string, content: string): Promise<void> => {
    if (!session?.user) {
      setError('Yorum yapmak için giriş yapmalısınız');
      return;
    }

    if (!session.user.name || !session.user.email) {
      setError('Kullanıcı bilgileri eksik');
      return;
    }

    try {
      const response = await fetch(`/api/public-notes/${noteId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Yorum eklenemedi');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Yorum ekleme hatası:', err);
      setError('Yorum eklenirken bir hata oluştu');
    }
  };

  const handleCommentDelete = async (noteId: string, commentId: string): Promise<void> => {
    if (!session?.user) {
      setError('Yorum silmek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await fetch(`/api/public-notes/${noteId}/comment/${commentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Yorum silinemedi');
      }

      await fetchNotes();
    } catch (err) {
      console.error('Yorum silme hatası:', err);
      setError('Yorum silinirken bir hata oluştu');
    }
  };

  return {
    session,
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    dragOffset,
    setDragOffset,
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
    TIMER_DURATION,
    selectedNote,
    setSelectedNote
  };
};
