import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';
import MainProvider from '@/lib/MainProvider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { ViewTransitions } from 'next-view-transitions';
import { Inter, JetBrains_Mono, Playfair_Display, Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGroteskHeading = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const playfairDisplay = Playfair_Display({ subsets: ['latin'], style: 'italic', variable: '--font-greeting' });

export const viewport: Viewport = {
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  title: 'Mintfolio',
  description: 'Personal mutual fund portfolio tracker with daily NAV updates and push notifications.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Mintfolio',
    description: 'Personal mutual fund portfolio tracker with daily NAV updates and push notifications.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(
          'h-full',
          'antialiased',
          'font-sans',
          inter.variable,
          spaceGroteskHeading.variable,
          jetbrainsMono.variable,
          playfairDisplay.variable,
        )}
      >
        <body className="flex min-h-full flex-col">
          <MainProvider>
            <Header />
            <main className="container mx-auto w-full px-6 py-8">{children}</main>
            <Footer />
            <Toaster richColors />
          </MainProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
