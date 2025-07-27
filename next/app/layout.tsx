import type { Metadata } from 'next';
import './globals.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'BLZE CBD Delivery',
    template: '%s | BLZE',
  },
  description:
    'Fast CBD flower delivery in Buncombe, Henderson, Polk, and Transylvania counties.',
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="container mx-auto px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}