'use client';

import { useContext } from 'react';
import { PublicCorkBoardContext } from './PublicCorkBoardProvider';

export const usePublicCorkBoard = () => {
  const context = useContext(PublicCorkBoardContext);
  
  if (!context) {
    throw new Error('usePublicCorkBoard must be used within a PublicCorkBoardProvider');
  }
  
  return context;
};

export default usePublicCorkBoard;
