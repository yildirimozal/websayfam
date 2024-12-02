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
  metadataBase: new URL('https://ozalyildirim.com'),
  title: {
    default: "Dr. Özal Yıldırım | Akademisyen ve Yapay Zeka Araştırmacısı",
    template: "%s | Dr. Özal Yıldırım"
  },
  description: "Yapay zeka, makine öğrenmesi ve derin öğrenme alanlarında akademik çalışmalar, araştırmalar ve güncel teknoloji paylaşımları",
  keywords: ["yapay zeka", "makine öğrenmesi", "derin öğrenme", "akademik araştırma", "teknoloji", "bilim", "eğitim"],
  authors: [{ name: "Dr. Özal Yıldırım" }],
  creator: "Dr. Özal Yıldırım",
  publisher: "Dr. Özal Yıldırım",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Dr. Özal Yıldırım | Akademisyen ve Yapay Zeka Araştırmacısı",
    description: "Yapay zeka, makine öğrenmesi ve derin öğrenme alanlarında akademik çalışmalar ve araştırmalar",
    url: "https://ozalyildirim.com",
    siteName: "Dr. Özal Yıldırım",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/profile.jpg",
        width: 800,
        height: 600,
        alt: "Dr. Özal Yıldırım",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Özal Yıldırım | Akademisyen ve Yapay Zeka Araştırmacısı",
    description: "Yapay zeka, makine öğrenmesi ve derin öğrenme alanlarında akademik çalışmalar ve araştırmalar",
    creator: "@ozalyildirim",
    images: ["/profile.jpg"],
  },
  alternates: {
    canonical: "https://ozalyildirim.com",
  },
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
