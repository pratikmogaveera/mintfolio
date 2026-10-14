'use client';
import { ChartPieSliceIcon, UserIcon, WalletIcon } from '@phosphor-icons/react';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';

const MobileNavigation = () => {
  const pathname = usePathname();

  const activeTab = pathname === '/holdings' ? 'holdings' : pathname === '/portfolio' ? 'portfolio' : 'profile';
  return (
    <div
      className="fixed bottom-10 left-0 z-50 block w-full px-3 md:hidden"
      style={{ viewTransitionName: 'mobile-nav' }}
    >
      <div className="border-muted-foreground/50 flex w-full justify-between gap-2 rounded-full border border-solid p-1.25 backdrop-blur-sm">
        <Link
          href={'/portfolio'}
          title="Portfolio"
          className="border-muted-foreground/50 data-active:border-accent bg-background/70 data-active:text-accent relative flex flex-1 flex-col items-center rounded-full border border-solid px-8 py-3 backdrop-blur-3xl transition-all duration-200"
          data-active={activeTab === 'portfolio' && 'active'}
        >
          <div
            data-active={activeTab === 'portfolio' && 'active'}
            className="from-accent/5 via-accent/10 to-background/70 absolute inset-0 -z-10 hidden h-full w-full rounded-full bg-radial data-active:block"
          />
          <ChartPieSliceIcon size={28} />
          Portfolio
        </Link>
        <Link
          href={'/holdings'}
          title="Holdings"
          className="border-muted-foreground/50 data-active:border-accent bg-background/70 data-active:text-accent relative flex flex-1 flex-col items-center rounded-full border border-solid px-8 py-3 backdrop-blur-3xl transition-all duration-200"
          data-active={activeTab === 'holdings' && 'active'}
        >
          <div
            data-active={activeTab === 'holdings' && 'active'}
            className="from-accent/5 via-accent/10 to-background/70 absolute inset-0 -z-10 hidden h-full w-full rounded-full bg-radial data-active:block"
          />
          <WalletIcon size={28} />
          Holdings
        </Link>
        <Link
          href={'/profile'}
          title="Profile"
          className="border-muted-foreground/50 data-active:border-accent bg-background/70 data-active:text-accent relative flex flex-1 flex-col items-center rounded-full border border-solid px-8 py-3 backdrop-blur-3xl transition-all duration-200"
          data-active={activeTab === 'profile' && 'active'}
        >
          <div
            data-active={activeTab === 'profile' && 'active'}
            className="from-accent/5 via-accent/10 to-background/70 absolute inset-0 -z-10 hidden h-full w-full rounded-full bg-radial data-active:block"
          />
          <UserIcon size={28} />
          Profile
        </Link>
      </div>
    </div>
  );
};

export default MobileNavigation;
