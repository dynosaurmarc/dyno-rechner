import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Dyno Altersvorsorgerechner',
  description: 'Input-Extraktion aus Excel mit Vergleichsansicht für zwei Verträge.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
