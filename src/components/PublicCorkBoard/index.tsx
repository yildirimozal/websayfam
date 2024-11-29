'use client';

import React from 'react';
import PublicCorkBoardProvider from './PublicCorkBoardProvider';
import PublicCorkBoardContent from './PublicCorkBoardContent';

const PublicCorkBoard: React.FC = () => {
  return (
    <PublicCorkBoardProvider>
      <PublicCorkBoardContent />
    </PublicCorkBoardProvider>
  );
};

export default PublicCorkBoard;
