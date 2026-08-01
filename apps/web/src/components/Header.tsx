'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { logoutUser } from '@/lib/api-client';
import { useAuth } from '@/lib/hooks/use-auth';
import { cn } from '@/lib/utils';
import { CaretDownIcon, ListIcon, SignInIcon, SignOutIcon, UserCircleIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { Link } from 'next-view-transitions';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { usePrivacy } from '@/lib/PrivacyContext';
import { Eye, EyeClosed } from 'lucide-react';

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

  return (
    <header className="border-border border-b px-4 py-2 md:px-12">
      <div className="flex w-full items-center justify-between">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" title="Mintfolio - home page" className="font-heading text-primary text-3xl font-semibold">
            Mintfolio
          </Link>
          {isSuccess && (
            <nav className="hidden items-center gap-4 md:flex">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
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
                    <DropdownMenuItem onClick={() => mutate()} disabled={isPending}>
                      <SignOutIcon />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger
                  render={
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <ListIcon />
                    </Button>
                  }
                />
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1">
                    {NAV_LINKS.map(({ href, label }) => (
                      <SheetClose
                        key={href}
                        nativeButton={false}
                        render={
                          <Link
                            href={href}
                            className={cn(
                              'rounded-lg px-3 py-2.5 text-sm transition-colors',
                              pathname === href
                                ? 'bg-muted text-foreground font-medium'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                          />
                        }
                      >
                        {label}
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="mt-auto flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => router.push('/profile')}
                      className="justify-start gap-3 px-3"
                    >
                      <UserCircleIcon size={16} />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => mutate()}
                      disabled={isPending}
                      className="justify-start gap-3 px-3"
                    >
                      <SignOutIcon size={16} />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
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
