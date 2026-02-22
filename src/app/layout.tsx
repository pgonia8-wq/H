// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';  // Si tienes un archivo globals.css en src/app, mantenlo; si no, créalo vacío o elimínalo esta línea

const inter = Inter({ subsets: ['latin'] });

import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';

export const metadata: Metadata = {
  title: 'Human Feed',
  description: 'Feed para usuarios verificados con World ID Orb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <MiniKitProvider>  {/* Esto inicializa MiniKit correctamente – clave para walletAddress */}
        <body className={inter.className}>
          {children}
        </body>
      </MiniKitProvider>
    </html>
  );
}
