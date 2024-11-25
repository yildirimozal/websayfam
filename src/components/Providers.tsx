'use client';

import { SessionProvider } from 'next-auth/react';
import ThemeRegistry from './ThemeRegistry';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeRegistry>
        {children}
      </ThemeRegistry>
    </SessionProvider>
  );
}
