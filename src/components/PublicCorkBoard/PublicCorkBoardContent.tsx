'use client';

import React from 'react';
import { useTheme } from '@mui/material';
import NoteList from './NoteList';
import { usePublicCorkBoard } from './usePublicCorkBoard';

const PublicCorkBoardContent: React.FC = () => {
  const theme = useTheme();
  const { notes } = usePublicCorkBoard();

  // En alttaki notun pozisyonunu bul
  const maxBottom = notes.reduce((max, note) => {
    const bottom = note.position.y + (note.size?.height || 200);
    return Math.max(max, bottom);
  }, 0);

  // Minimum yükseklik 100vh, maksimum yükseklik en alttaki not + 100px
  const boardHeight = Math.max(maxBottom + 100, window.innerHeight);

  return (
    <div style={{ height: '100%', minHeight: '100vh' }}>
      <div
        style={{
          height: boardHeight,
          backgroundColor: '#D2B48C',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%),
            repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 4px)
          `,
          boxShadow: theme.shadows[3],
          borderRadius: 8,
          padding: 16,
          position: 'relative',
          border: '12px solid #BC8F8F',
          touchAction: 'none'
        }}
      >
        <NoteList />
      </div>
    </div>
  );
};

export default PublicCorkBoardContent;
