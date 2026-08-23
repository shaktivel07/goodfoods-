// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import BottomNav from '@/components/layout/BottomNav';

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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
  themeColor: '#0f2b46',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SRM Good Foods',
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
        <link rel="icon" href="/goodfoods.PNG" type="image/png" />
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
