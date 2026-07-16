import type { Metadata, Viewport } from 'next';
import './globals.css';
import Link from 'next/link';

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
    <html lang="en" className={`h-full bg-[#09090b] text-zinc-100 antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-gray-600 px-8 py-2">
          <Link href={'/'} title="Mintfolio - home page" className="text-3xl font-semibold text-[#4ade80]">
            Mintfolio
          </Link>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
