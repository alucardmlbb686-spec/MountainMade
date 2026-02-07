import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MountainMade - Pure Organic Foods from the Himalayas',
  description: 'Discover 100% organic, mountain-sourced foods directly from Himalayan farmers. Honey, grains, spices, herbs, and artisan products with complete traceability.',
  icons: {
    icon: [
      { url: '/favicon.jpeg', type: 'image/jpeg' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
</body>
    </html>
  );
}
