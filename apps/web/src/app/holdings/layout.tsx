import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mintfolio - Holdings',
};

export default function HoldingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
