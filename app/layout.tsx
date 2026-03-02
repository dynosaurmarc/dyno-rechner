import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import type { ReactNode } from 'react';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Dyno Altersvorsorgerechner',
  description: 'Vergleich von zwei Verträgen auf Basis lila Excel-Eingaben.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
