'use client';
import { useConfirm } from '@/components/ConfirmationDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { logoutUser } from '@/lib/api-client';
import { useAuth } from '@/lib/hooks/use-auth';
import { usePrivacy } from '@/lib/PrivacyContext';
import { cn } from '@/lib/utils';
import { CaretDownIcon, SignInIcon, SignOutIcon, UserCircleIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeClosed } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link } from 'next-view-transitions';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from './ui/button';

const NAV_LINKS = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/holdings', label: 'Holdings' },
];

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { setTheme, theme } = useTheme();
  const { isPrivate, togglePrivacy } = usePrivacy();
  const confirm = useConfirm();

  const { isLoading, isSuccess, userDetails } = useAuth();

  const { mutate, isPending } = useMutation({
    mutationFn: logoutUser,
    onSuccess: async () => {
      toast.success('Logged out successfully.');
      queryClient.clear();
      router.push('/login');
    },
  });

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Log out?',
      description: 'You will be redirected to the login page.',
      confirmLabel: 'Log out',
    });
    if (confirmed) mutate();
  };

  // Cancel in-flight nav-history queries before a view transition fires.
  // If sparkline queries are still pending when startViewTransition() takes
  // its DOM snapshot, they'll resolve mid-transition and abort it with a
  // TimeoutError. Cancelling here freezes the DOM (skeletons stay skeletons)
  // so the snapshot is stable.
  const cancelSparklineQueries = () => {
    queryClient.cancelQueries({ queryKey: ['nav-history'] });
  };

  return (
    <header className="border-border bg-background/30 sticky top-0 z-50 border-b px-4 py-2 backdrop-blur-lg md:px-12">
      <div className="flex w-full items-center justify-between">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            title="Mintfolio - home page"
            className="font-heading text-foreground text-2xl font-bold tracking-tight"
          >
            <span className="text-primary">●</span> mintfolio
          </Link>
          {isSuccess && (
            <nav className="hidden items-center gap-4 md:flex">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={cancelSparklineQueries}
                  className={cn(
                    'text-sm transition-colors',
                    pathname === href ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Desktop user menu + Mobile menu button */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
            <Image src="/theme-toggle.svg" height={18} width={18} alt="Toggle theme" className="dark:invert" />
          </Button>
          {isLoading ? (
            <Skeleton className="h-[1.428571rem] w-30" />
          ) : isSuccess ? (
            <>
              <Button variant="ghost" size="icon" onClick={togglePrivacy} title="Toggle privacy">
                {isPrivate ? <Eye /> : <EyeClosed />}
              </Button>
              {/* Desktop dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="hidden items-center gap-1 text-sm md:flex">
                  {`@${userDetails?.username}`}
                  <CaretDownIcon className="size-3.5 transition-transform duration-200 [[aria-expanded=true]>&]:rotate-180" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <UserCircleIcon />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
                      <SignOutIcon />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile logout */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={handleLogout}
                disabled={isPending}
                title="Logout"
              >
                <SignOutIcon />
              </Button>
            </>
          ) : (
            <Link href="/login" title="Login" className="flex items-center gap-1 px-2 text-base font-medium">
              <SignInIcon />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
