// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import BottomNav from '@/components/layout/BottomNav';

// ✅ Viewport must be a separate export in Next.js 13+
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f2b46',
};

export const metadata: Metadata = {
  title: 'SRM Good Foods – Campus Food Ordering',
  description:
    'Order fresh, delicious food from SRM Tiruchirappalli campus canteen. Fast delivery to your block, hostel, or department.',
  keywords: 'SRM, Trichy, campus food, food ordering, canteen, SRM Tiruchirappalli',
  openGraph: {
    title: 'SRM Good Foods',
    description: 'Fresh campus food, delivered to you.',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SRM Good Foods',
  },
  // ✅ Favicon via metadata API (Next.js 13+)
  icons: {
    icon: [
      { url: '/goodfoods.PNG', type: 'image/png' },
    ],
    apple: [
      { url: '/goodfoods.PNG', type: 'image/png' },
    ],
    shortcut: '/goodfoods.PNG',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
        {/* Explicit fallback favicon tags for maximum browser compatibility */}
        <link rel="icon" href="/goodfoods.PNG" type="image/png" />
        <link rel="apple-touch-icon" href="/goodfoods.PNG" />
        <link rel="shortcut icon" href="/goodfoods.PNG" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <BottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
