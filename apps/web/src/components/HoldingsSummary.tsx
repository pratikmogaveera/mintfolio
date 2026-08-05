import { usePrivacy } from '@/lib/PrivacyContext';
import { cn, formatINR, maskValue } from '@/lib/utils';
import { Holding, PortfolioLog } from '@mintfolio/shared';
import dayjs from 'dayjs';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface HoldingsSummaryProps {
  userHoldings: Holding[];
  isHoldingLoading: boolean;
  isHoldingError: boolean;
  portfolioData: PortfolioLog[];
  isPortfolioLoading: boolean;
  isPortfolioError: boolean;
}

function SummaryCardSkeleton() {
  return (
    <Card className="w-full gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-36 md:h-9" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-5 w-28" />
      </CardFooter>
    </Card>
  );
}

function SummaryCardError({ label }: { label: string }) {
  return (
    <Card className="w-full gap-4">
      <CardHeader>
        <p className="text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">Could not load data. Please try again.</p>
      </CardContent>
      <CardFooter />
    </Card>
  );
}

export default function HoldingsSummary({
  userHoldings,
  isHoldingLoading,
  isHoldingError,
  isPortfolioLoading,
  isPortfolioError,
  portfolioData,
}: HoldingsSummaryProps) {
  const { isPrivate } = usePrivacy();
  const latestPortfolioLog = portfolioData.at(-1);
  const currentValue = Number(latestPortfolioLog?.current_value);
  const amountInvested = Number(latestPortfolioLog?.total_invested);
  const pnlValue = currentValue - amountInvested;
  const pnlPercentage = amountInvested ? ((pnlValue / amountInvested) * 100).toFixed(2) : '0.00';
  const isProfit = pnlValue >= 0;

  if (isPortfolioLoading || isHoldingLoading) {
    return (
      <div style={{ viewTransitionName: 'holdings-summary' }} className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>
    );
  }

  return (
    <div style={{ viewTransitionName: 'holdings-summary' }} className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
      {/* Card 1: Amount Invested — depends on holdings query */}
      {isHoldingError ? (
        <SummaryCardError label="Amount Invested" />
      ) : (
        <Card className="w-full gap-4">
          <CardHeader>
            <p className="text-muted-foreground">Amount Invested</p>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-semibold md:text-3xl">
              {maskValue(formatINR(amountInvested), isPrivate)}
            </p>
          </CardContent>
          <CardFooter className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{dayjs(latestPortfolioLog?.date).format('DD MMM YYYY')}</span>
            <span>·</span>
            <span>{userHoldings.length} schemes</span>
          </CardFooter>
        </Card>
      )}

      {/* Card 2: Total P&L — depends on portfolio logs query */}
      {isPortfolioError ? (
        <SummaryCardError label="Total P&L" />
      ) : (
        <Card className="w-full gap-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Total P&amp;L</p>
              <div className={cn('flex items-center gap-1', isProfit ? 'text-primary' : 'text-destructive')}>
                {isProfit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className={cn('font-heading text-2xl font-semibold md:text-3xl', isProfit ? 'text-primary' : 'text-destructive')}>
              {maskValue(`${isProfit ? '+' : ''}${formatINR(pnlValue)}`, isPrivate)}
            </p>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className={cn('font-medium', isProfit ? 'text-primary' : 'text-destructive')}>
              {isProfit ? '+' : ''}{pnlPercentage}% overall
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
