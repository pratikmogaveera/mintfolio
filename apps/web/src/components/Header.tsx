'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserDetails, logoutUser } from '@/lib/api-client';
import { SignInIcon, SignOutIcon, UserCircleIcon } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const Header = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ['user-details'],
    queryFn: getUserDetails,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      toast.success('Logged out successfully.');

      setTimeout(() => {
        router.push('/login');
        queryClient.invalidateQueries({ queryKey: ['user-details'] });
      }, 1500);
    },
  });

  return (
    <header className="border-border border-b px-4 py-2 md:px-12">
      <div className="flex w-full items-center justify-between">
        <Link href={'/'} title="Mintfolio - home page" className="font-heading text-primary text-3xl font-semibold">
          Mintfolio
        </Link>

        {isLoading ? (
          <Skeleton className="h-[1.428571rem] w-30" />
        ) : isSuccess ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm">{`@${data?.data?.data?.username}`}</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <UserCircleIcon />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => mutate()} disabled={isPending}>
                  <SignOutIcon />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login" title="Login" className="flex items-center gap-1 px-2 text-base font-medium">
            <SignInIcon />
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
