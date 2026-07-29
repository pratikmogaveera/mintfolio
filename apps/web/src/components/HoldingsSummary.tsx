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

  if (isPortfolioError) {
    return (
      <div style={{ viewTransitionName: 'holdings-summary' }} className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        <SummaryCardError label="Current Value" />
        <SummaryCardError label="Amount Invested" />
      </div>
    );
  }

  return (
    <div style={{ viewTransitionName: 'holdings-summary' }} className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="w-full gap-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Current Value</p>
            <div className={cn('flex items-center gap-2', isProfit ? 'text-primary' : 'text-destructive')}>
              {isProfit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              {maskValue(pnlPercentage, isPrivate)}%
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-2xl font-semibold md:text-3xl">
            {maskValue(formatINR(currentValue), isPrivate)}
          </p>
        </CardContent>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">As on {dayjs(latestPortfolioLog?.date).format('DD MMM YYYY')}</div>
        </CardFooter>
      </Card>

      <Card className="w-full gap-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Amount Invested</p>
            <div className="text-muted-foreground text-sm">{userHoldings.length} Schemes</div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-2xl font-semibold md:text-3xl">
            {maskValue(formatINR(amountInvested), isPrivate)}
          </p>
        </CardContent>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className={cn('flex items-center gap-1.5 font-medium', isProfit ? 'text-primary' : 'text-destructive')}>
            {isProfit ? '+' : ''}
            {maskValue(formatINR(pnlValue), isPrivate)}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
