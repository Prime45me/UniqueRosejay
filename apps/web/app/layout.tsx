import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { CartDrawer } from '@/components/store/cart/CartDrawer';
import { CartProvider } from '@/components/store/cart/CartProvider';
import { SITE } from '@/lib/site';

/* Typography (design handoff §4, "2 + 1 rule"): display serif, UI sans, data mono. Self-hosted by next/font. */
const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap'
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap'
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} (${SITE.abbreviation}) — Store, Hotels & Apartments`,
    template: `%s — ${SITE.name}`
  },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} (${SITE.abbreviation})`,
    description: SITE.description,
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#FAFAF8'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
