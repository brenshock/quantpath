import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getSiteUrl } from '@/lib/site-url';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: 'QuantPath — Technique-first quant interview practice',
  description: 'Learn reusable quant interview techniques through progressive problems, guided hints, and verified solutions.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: 'QuantPath — Technique-first quant interview practice',
    description: 'Learn reusable quant interview techniques through progressive problems, guided hints, and verified solutions.',
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'QuantPath — Technique-first quant interview practice' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuantPath — Technique-first quant interview practice',
    description: 'Learn reusable quant interview techniques through progressive problems, guided hints, and verified solutions.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body></html>;
}
