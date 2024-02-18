import './globals.css';
import type { Metadata } from 'next';
import { Azeret_Mono } from 'next/font/google';

const fontFamily = Azeret_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Taglyze',
  description: 'Tagging and analyze',
  generator: 'Next.js',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <link rel='icon' href='/favicon.ico' sizes='any' />
      <link
        rel='icon'
        href='/icon?<generated>'
        type='image/<generated>'
        sizes='<generated>'
      />
      <link
        rel='apple-touch-icon'
        href='/apple-icon?<generated>'
        type='image/<generated>'
        sizes='<generated>'
      />
      <body className={fontFamily.className}>{children}</body>
    </html>
  );
}
