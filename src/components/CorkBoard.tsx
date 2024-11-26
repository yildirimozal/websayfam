'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  useTheme,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { ResizableBox } from 'react-resizable';

interface Note {
  id?: string;
  type: 'note' | 'image';
  content: string;
  position: { x: number; y: number };
  rotation: number;
  size?: { width: number; height: number };
}

const CorkBoard = () => {
  const theme = useTheme();
  const { data: session } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
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
    const note = notesRef.current.find(n => n.id === noteId);
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
        n.id === noteId ? { ...n, ...data } : n
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

    const note = notesRef.current.find(n => n.id === noteId);
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

      setNotes(prev => prev.map(n => 
        n.id === noteId
          ? { ...n, position: { x: newX, y: newY } }
          : n
      ));
    };

    const handleMouseUp = async () => {
      const currentNoteId = activeNoteRef.current;
      if (currentNoteId) {
        const updatedNote = notesRef.current.find(n => n.id === currentNoteId);
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
  }, [isResizing, session]);

  const handleAddNote = async () => {
    if (!editingNote || !session?.user?.isAdmin) return;

    try {
      const method = editingNote.id ? 'PUT' : 'POST';
      const endpoint = editingNote.id ? `/api/private-notes/${editingNote.id}` : '/api/private-notes';
      const body = editingNote.id 
        ? JSON.stringify(editingNote)
        : JSON.stringify({
            ...editingNote,
            position: { x: 20, y: 20 },
            rotation: Math.random() * 6 - 3,
            size: { width: 200, height: 150 }
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

  const handleResize = useCallback((noteId: string) => (e: any, { size }: { size: { width: number; height: number } }) => {
    if (!session?.user?.isAdmin) return;

    e.stopPropagation();
    setIsResizing(true);
    setNotes(prev => prev.map(note =>
      note.id === noteId
        ? { ...note, size }
        : note
    ));
  }, [session]);

  const handleResizeStop = useCallback((noteId: string) => async (e: any, { size }: { size: { width: number; height: number } }) => {
    if (!session?.user?.isAdmin) return;

    e.stopPropagation();
    setIsResizing(false);
    await updateNote(noteId, { size });
  }, [session]);

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 500,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Card
        ref={boardRef}
        sx={{
          height: '100%',
          minHeight: 500,
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
        }}
      >
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
              resizeHandles={['se']}
              draggableOpts={{ enableUserSelectHack: false }}
            >
              <Card
                onMouseDown={(e) => handleMouseDown(e, note.id!)}
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: note.type === 'note' ? '#fff7ba' : 'white',
                  transform: `rotate(${note.rotation}deg) ${activeNote === note.id ? 'scale(1.02)' : ''}`,
                  transition: 'transform 0.2s ease-in-out',
                  cursor: session?.user?.isAdmin ? (isResizing ? 'se-resize' : 'move') : 'default',
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
                }}
              >
                {session?.user?.isAdmin && (
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
                  <CardContent sx={{ height: '100%', overflow: 'auto', pt: 4 }}>
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
                  </Box>
                )}
              </Card>
            </ResizableBox>
          </div>
        ))}
      </Card>

      {session?.user?.isAdmin && (
        <Fab 
          color="primary" 
          aria-label="add note"
          onClick={() => {
            setEditingNote({ type: 'note', content: '', position: { x: 0, y: 0 }, rotation: 0 });
            setIsDialogOpen(true);
          }}
          sx={{ 
            position: 'absolute',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog 
        open={isDialogOpen} 
        onClose={() => {
          setIsDialogOpen(false);
          setEditingNote(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingNote?.id ? 'Notu Düzenle' : 'Yeni Not Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Tip"
            value={editingNote?.type || 'note'}
            onChange={(e) => setEditingNote(prev => prev ? { ...prev, type: e.target.value as 'note' | 'image' } : null)}
            fullWidth
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="note">Not</option>
            <option value="image">Resim</option>
          </TextField>
          <TextField
            autoFocus
            margin="dense"
            label={editingNote?.type === 'image' ? 'Resim URL' : 'İçerik'}
            fullWidth
            multiline={editingNote?.type === 'note'}
            rows={editingNote?.type === 'note' ? 4 : 1}
            value={editingNote?.content || ''}
            onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsDialogOpen(false);
            setEditingNote(null);
          }}>
            İptal
          </Button>
          <Button onClick={handleAddNote} variant="contained">
            {editingNote?.id ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CorkBoard;
