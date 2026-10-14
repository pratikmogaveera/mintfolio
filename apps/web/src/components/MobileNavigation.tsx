'use client';
import { ChartPieSliceIcon, UserIcon, WalletIcon } from '@phosphor-icons/react';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
}

const NavItem = ({ href, label, icon: Icon, isActive }: NavItemProps) => (
  <Link
    href={href}
    title={label}
    className="border-muted-foreground/50 data-active:border-accent bg-background/70 data-active:text-accent relative flex flex-1 flex-col items-center rounded-full border border-solid px-2 py-2.5 text-xs transition-all duration-200"
    data-active={isActive && 'active'}
  >
    <div
      data-active={isActive && 'active'}
      className="from-accent/5 via-accent/10 to-background/70 absolute inset-0 -z-10 hidden h-full w-full rounded-full bg-radial data-active:block"
    />
    <Icon size={20} />
    {label}
  </Link>
);

const NAV_ITEMS = [
  { href: '/portfolio', label: 'Portfolio', icon: ChartPieSliceIcon },
  { href: '/holdings', label: 'Holdings', icon: WalletIcon },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

const MobileNavigation = () => {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-10 left-0 z-50 block w-full px-3 backdrop-blur-sm md:hidden"
      style={{ viewTransitionName: 'mobile-nav' }}
    >
      <div className="border-muted-foreground/50 flex w-full justify-between gap-2 rounded-full border border-solid p-1.25">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <NavItem key={href} href={href} label={label} icon={icon} isActive={pathname === href} />
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
