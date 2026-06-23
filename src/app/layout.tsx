import type { Metadata } from 'next';
import { Archivo, Saira_Condensed } from 'next/font/google';
import './globals.css';
import 'flag-icons/css/flag-icons.min.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const sairaCondensed = Saira_Condensed({
  variable: '--font-saira',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Gameday',
  description: 'CHL, SHL och SDHL matchinformation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${archivo.variable} ${sairaCondensed.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
