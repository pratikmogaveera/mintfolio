'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowRightIcon,
  BellRingingIcon,
  ChartLineUpIcon,
  ShieldCheckIcon,
} from '@phosphor-icons/react';
import { Link } from 'next-view-transitions';
import { useEffect } from 'react';

// ─── Feature card data ────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: ChartLineUpIcon,
    title: 'Daily NAV updates',
    description:
      'Portfolio value is recomputed every morning using the latest NAV data from MFAPI — automatically, no action needed.',
  },
  {
    icon: BellRingingIcon,
    title: 'Morning P&L push',
    description:
      'Get a push notification each morning with your current portfolio value and unrealised gains — even when the app is closed.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Private by default',
    description:
      'One tap hides all monetary values and scheme names. Your data never leaves your account.',
  },
] as const;

// ─── Mock chart data ──────────────────────────────────────────────────────────

const CHART_BARS = [32, 40, 36, 50, 44, 56, 52, 62, 58, 70, 65, 78, 72, 88];

const MOCK_HOLDINGS = [
  { name: 'Parag Parikh Flexi Cap', value: '₹24,832', change: '+₹1,240', positive: true },
  { name: 'Kotak Nifty Next 50 Index', value: '₹18,445', change: '+₹2,010', positive: true },
  { name: 'Motilal Oswal Midcap Fund', value: '₹51,200', change: '−₹2,880', positive: false },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('SW registration failed:', err);
    });
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-12 pb-20 md:gap-16">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 pt-10 text-center md:pt-16">
        {/* Badge */}
        <div className="border-border/70 bg-accent-muted text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium">
          <span className="bg-primary size-1.5 rounded-full" />
          Personal portfolio tracker
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-4">
          <h1 className="font-heading text-foreground text-4xl font-bold tracking-tight md:text-6xl">
            Your mutual funds,
            <br />
            <span className="text-primary">tracked daily.</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed md:max-w-md md:text-base">
            Add your holdings once. Get portfolio value, unrealised P&amp;L, and a morning push
            notification — every single day.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>
            Get started
            <ArrowRightIcon weight="bold" className="size-4" />
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'text-primary')}
          >
            Login
          </Link>
        </div>
      </section>

      {/* ── Portfolio preview card ───────────────────────────────────────── */}
      <section className="w-full max-w-xs md:max-w-sm">
        <div className="bg-card border-border/40 rounded-2xl border p-5 shadow-sm dark:border-white/[0.07] dark:shadow-none">
          {/* Header row */}
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-xs">Portfolio Value</p>
              <p className="font-heading text-foreground mt-0.5 text-3xl font-bold tracking-tight">
                ₹94,477
              </p>
            </div>
            <span className="bg-accent-muted text-primary mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
              +₹395 today
            </span>
          </div>

          {/* Bar chart */}
          <div className="mb-5 flex h-24 items-end gap-1">
            {CHART_BARS.map((h, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-t-sm',
                  i === CHART_BARS.length - 1 ? 'bg-primary' : 'bg-primary/25',
                )}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Holdings list */}
          <div className="flex flex-col gap-1.5">
            {MOCK_HOLDINGS.map((holding) => (
              <div
                key={holding.name}
                className="bg-muted/60 flex items-center justify-between rounded-xl px-3 py-2.5"
              >
                <p className="text-foreground text-xs font-medium">{holding.name}</p>
                <div className="ml-3 flex shrink-0 flex-col items-end">
                  <p className="font-mono text-xs font-medium">{holding.value}</p>
                  <p
                    className={cn(
                      'font-mono text-xs',
                      holding.positive ? 'text-primary' : 'text-destructive',
                    )}
                  >
                    {holding.change}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground mt-4 text-center text-xs opacity-60">
            Sample data — yours will look just like this
          </p>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="w-full max-w-3xl">
        <h2 className="font-heading text-foreground mb-8 text-center text-2xl font-bold tracking-tight md:text-3xl">
          Everything you need,{' '}
          <span className="text-muted-foreground font-normal">nothing you don't</span>
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-card border-border/40 rounded-2xl border p-5 dark:border-white/[0.07]"
            >
              <div className="bg-accent-muted mb-3 flex h-9 w-9 items-center justify-center rounded-xl">
                <Icon className="text-primary size-4.5" weight="duotone" />
              </div>
              <p className="font-heading text-foreground mb-1.5 text-sm font-semibold">{title}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <section className="w-full max-w-xl">
        <div className="bg-primary/8 border-primary/25 rounded-2xl border px-6 py-10 text-center dark:border-primary/20 dark:bg-primary/[0.07]">
          <h2 className="font-heading text-foreground mb-2 text-2xl font-bold tracking-tight">
            Start tracking today
          </h2>
          <p className="text-muted-foreground mx-auto mb-6 max-w-xs text-sm leading-relaxed">
            Free, open source, and built for one purpose — knowing exactly where your money stands.
          </p>
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }), 'gap-2 px-7')}>
            Create your account
            <ArrowRightIcon weight="bold" className="size-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
