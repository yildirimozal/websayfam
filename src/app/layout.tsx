import type { Metadata, Viewport } from "next";
import { Playfair_Display, Kalam } from 'next/font/google';
import Script from 'next/script';
import Providers from '../components/Providers';
import Footer from '../components/Footer';
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
  title: "Ozal Yildirim",
  description: "Akademik çalışmalar ve yapay zeka güncellemeleri",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4D054WPW7D"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-4D054WPW7D');
          `}
        </Script>
      </head>
      <body className={kalam.className}>
        <Providers>
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            background: 'var(--background-default)'
          }}>
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
