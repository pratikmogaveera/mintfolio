'use client';
import { useAuth } from '@/lib/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const { isSuccess, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isSuccess) {
      router.replace('/login');
    }
  }, [isSuccess, isLoading, router]);

  if (isLoading) {
    return <RouteGuardLoader />;
  }

  return isSuccess ? <>{children}</> : null;
}

function RouteGuardLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="text-primary size-7 animate-spin" />
      <p className="text-muted-foreground text-sm">Checking session...</p>
    </div>
  );
}
