'use client';

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export const calculateResponsivePosition = (
  position: { x: number; y: number },
  originalWidth: number,
  currentWidth: number
): { x: number; y: number } => {
  const ratio = currentWidth / originalWidth;
  return {
    x: Math.round(position.x * ratio),
    y: Math.round(position.y * ratio)
  };
};

export const calculateResponsiveSize = (
  size: { width: number; height: number },
  originalWidth: number,
  currentWidth: number
): { width: number; height: number } => {
  const ratio = currentWidth / originalWidth;
  return {
    width: Math.round(size.width * ratio),
    height: Math.round(size.height * ratio)
  };
};
