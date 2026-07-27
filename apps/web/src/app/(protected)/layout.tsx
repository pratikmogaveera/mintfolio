import RouteGuard from '@/lib/hooks/route-guard';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>;
}
