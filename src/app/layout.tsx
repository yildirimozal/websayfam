import type { Metadata } from "next";
import { Playfair_Display, Kalam } from 'next/font/google';
import Providers from '../components/Providers';
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
});

const kalam = Kalam({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Akademik Portfolio",
  description: "Akademik çalışmalar ve yapay zeka güncellemeleri",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital@0;1&family=Kalam:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={kalam.className}>
        <Providers>
          <main style={{ minHeight: '100vh', background: 'var(--background-default)' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
