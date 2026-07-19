import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mintfolio - Profile',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
