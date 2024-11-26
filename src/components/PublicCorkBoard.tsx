'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
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
  Avatar,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface Note {
  id?: string;
  type: 'note' | 'image';
  content: string;
  position: { x: number; y: number };
  rotation: number;
  size?: { width: number; height: number };
  author?: {
    name: string;
    email: string;
    image?: string;
  };
}

interface DragOffset {
  x: number;
  y: number;
}

interface AvatarWithTooltipProps {
  title: string;
  src?: string;
  alt: string;
}

const AvatarWithTooltip = forwardRef<HTMLDivElement, AvatarWithTooltipProps>((props, ref) => (
  <Tooltip title={props.title}>
    <Avatar
      ref={ref}
      src={props.src}
      alt={props.alt}
      sx={{ width: 24, height: 24 }}
    />
  </Tooltip>
));

AvatarWithTooltip.displayName = 'AvatarWithTooltip';

const PublicCorkBoard: React.FC = () => {
  const theme = useTheme();
  const { data: session } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef<DragOffset>({ x: 0, y: 0 });
  const activeNoteRef = useRef<string | null>(null);
  const notesRef = useRef<Note[]>([]);
  const previousNotesRef = useRef<Note[]>([]);
  const touchMoveRef = useRef<boolean>(false);

  const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    const initializeNotes = async () => {
      try {
        const response = await fetch('/api/public-notes');
        if (!response.ok) {
          throw new Error('Notlar yüklenirken hata oluştu');
        }
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        setError('Notlar yüklenirken hata oluştu');
        console.error('Notlar yüklenirken hata:', error);
      }
    };

    initializeNotes();
  }, []);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    activeNoteRef.current = activeNote;
  }, [activeNote]);

  const updateNote = useCallback(async (noteId: string, updates: Partial<Note>) => {
    const note = notesRef.current.find(n => n.id === noteId);
    if (!note) return;

    previousNotesRef.current = notesRef.current;
    try {
      const response = await fetch(`/api/public-notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: note.type,
          content: note.content,
          position: note.position,
          rotation: note.rotation,
          size: note.size,
          ...updates
        }),
      });

      if (!response.ok) {
        throw new Error('Not güncellenirken hata oluştu');
      }

      const data = await response.json();
      setNotes(prev => prev.map(n => 
        n.id === noteId ? data : n
      ));
    } catch (error) {
      setError('Not güncellenirken hata oluştu');
      setNotes(previousNotesRef.current);
      console.error('Not güncellenirken hata:', error);
    }
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, noteId: string) => {
    if (!noteId || isResizing || !session?.user) return;

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

    if (note.author?.email !== session.user.email && !session.user.isAdmin) return;

    e.preventDefault();
    e.stopPropagation();

    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      touchMoveRef.current = true;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setActiveNote(noteId);
    dragOffsetRef.current = {
      x: clientX - note.position.x,
      y: clientY - note.position.y
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!boardRef.current) return;
      
      const bounds = boardRef.current.getBoundingClientRect();
      const newX = Math.min(Math.max(0, e.clientX - dragOffsetRef.current.x), bounds.width - (note.size?.width || 200));
      const newY = Math.min(Math.max(0, e.clientY - dragOffsetRef.current.y), bounds.height - (note.size?.height || 150));

      setNotes(prev => prev.map(n => 
        n.id === noteId
          ? { ...n, position: { x: newX, y: newY } }
          : n
      ));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!boardRef.current) return;
      
      e.preventDefault();
      const touch = e.touches[0];
      const bounds = boardRef.current.getBoundingClientRect();
      const newX = Math.min(Math.max(0, touch.clientX - dragOffsetRef.current.x), bounds.width - (note.size?.width || 200));
      const newY = Math.min(Math.max(0, touch.clientY - dragOffsetRef.current.y), bounds.height - (note.size?.height || 150));

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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleTouchEnd = async () => {
      touchMoveRef.current = false;
      const currentNoteId = activeNoteRef.current;
      if (currentNoteId) {
        const updatedNote = notesRef.current.find(n => n.id === currentNoteId);
        if (updatedNote) {
          await updateNote(currentNoteId, { position: updatedNote.position });
        }
      }
      setActiveNote(null);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    if ('ontouchstart' in window) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }, [isResizing, session, updateNote]);

  const handleResize = useCallback((noteId: string) => (e: React.SyntheticEvent, data: ResizeCallbackData) => {
    if (!session?.user) return;

    const note = notesRef.current.find(n => n.id === noteId);
    if (!note || (note.author?.email !== session.user.email && !session.user.isAdmin)) return;

    e.stopPropagation();
    setIsResizing(true);
    setNotes(prev => prev.map(n =>
      n.id === noteId
        ? { ...n, size: { width: data.size.width, height: data.size.height } }
        : n
    ));
  }, [session]);

  const handleResizeStop = useCallback((noteId: string) => async (e: React.SyntheticEvent, data: ResizeCallbackData) => {
    if (!session?.user) return;

    const note = notesRef.current.find(n => n.id === noteId);
    if (!note || (note.author?.email !== session.user.email && !session.user.isAdmin)) return;

    e.stopPropagation();
    setIsResizing(false);
    await updateNote(noteId, { size: { width: data.size.width, height: data.size.height } });
  }, [session, updateNote]);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    if (!session?.user) return;

    const note = notesRef.current.find(n => n.id === noteId);
    if (!note || (note.author?.email !== session.user.email && !session.user.isAdmin)) return;

    try {
      const response = await fetch(`/api/public-notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Not silinirken hata oluştu');
      }

      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (error) {
      setError('Not silinirken hata oluştu');
      console.error('Not silinirken hata:', error);
    }
  }, [session]);

  const handleAddNote = useCallback(async () => {
    if (!editingNote || !session?.user) return;

    const tempId = generateTempId();
    const newNote = {
      type: editingNote.type,
      content: editingNote.content,
      position: { x: 20, y: 20 },
      rotation: Math.random() * 6 - 3,
      size: { width: 200, height: 150 },
      author: {
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
      },
    };

    try {
      if (editingNote.id) {
        // Güncelleme işlemi
        const response = await fetch(`/api/public-notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: editingNote.type,
            content: editingNote.content,
            position: editingNote.position,
            rotation: editingNote.rotation,
            size: editingNote.size,
          }),
        });

        if (!response.ok) {
          throw new Error('Not güncellenirken hata oluştu');
        }

        const updatedNote = await response.json();
        setNotes(prev => prev.map(n => n.id === editingNote.id ? updatedNote : n));
      } else {
        // Yeni not ekleme işlemi
        setNotes(prev => [...prev, { ...newNote, id: tempId }]);

        const response = await fetch('/api/public-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNote),
        });

        if (!response.ok) {
          throw new Error('Not eklenirken hata oluştu');
        }

        const savedNote = await response.json();
        setNotes(prev => prev.map(n => n.id === tempId ? savedNote : n));
      }

      setIsDialogOpen(false);
      setEditingNote(null);
    } catch (error) {
      setError('Not eklenirken/güncellenirken hata oluştu');
      if (!editingNote.id) {
        setNotes(prev => prev.filter(n => n.id !== tempId));
      }
      console.error('Not eklenirken/güncellenirken hata:', error);
    }
  }, [editingNote, session]);

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
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
        {notes.map((note) => {
          const noteId = note.id || generateTempId();
          return (
            <div
              key={noteId}
              style={{
                position: 'absolute',
                left: note.position.x,
                top: note.position.y,
                zIndex: activeNote === noteId ? 1000 : 1,
                touchAction: 'none',
              }}
              onMouseDown={(e) => handleDragStart(e, noteId)}
              onTouchStart={(e) => handleDragStart(e, noteId)}
            >
              <ResizableBox
                width={note.size?.width || 200}
                height={note.size?.height || 150}
                onResize={handleResize(noteId)}
                onResizeStop={handleResizeStop(noteId)}
                minConstraints={[150, 100]}
                maxConstraints={[400, 400]}
                resizeHandles={['se']}
                draggableOpts={{ enableUserSelectHack: false }}
              >
                <Card
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: note.type === 'note' ? '#fff7ba' : 'white',
                    transform: `rotate(${note.rotation}deg) ${activeNote === noteId ? 'scale(1.02)' : ''}`,
                    transition: 'transform 0.2s ease-in-out',
                    cursor: (session?.user?.email === note.author?.email || session?.user?.isAdmin) ? (isResizing ? 'se-resize' : 'move') : 'default',
                    boxShadow: `
                      ${theme.shadows[activeNote === noteId ? 8 : 2]},
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
                  {note.author && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 5, 
                      left: 5, 
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}>
                      <AvatarWithTooltip
                        title={note.author.name}
                        src={note.author.image}
                        alt={note.author.name}
                      />
                    </Box>
                  )}

                  {(session?.user?.email === note.author?.email || session?.user?.isAdmin) && (
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
                          if (note.id) {
                            handleDeleteNote(note.id);
                          }
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
          );
        })}
      </Card>

      {session && (
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

export default PublicCorkBoard;
