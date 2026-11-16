import './globals.css';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'UniqueRosejay',
  description: 'Integrated marketplace for fashion, hotels and apartments.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
