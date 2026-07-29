'use client';

import HoldingsList from '@/components/HoldingsList';
import HoldingsSummary from '@/components/HoldingsSummary';
import { ChartContainer } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteHolding, getHoldings, getPortfolioLogs, updateHolding } from '@/lib/api-client';
import { usePrivacy } from '@/lib/PrivacyContext';
import { UpdateHoldingPayload } from '@/lib/schema';
import { cn, formatINR, maskValue } from '@/lib/utils';
import { PortfolioLog } from '@mintfolio/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import dayjs from 'dayjs';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

const chartConfig = {
  current_value: { color: 'var(--color-primary)' },
};

function PortfolioChart({
  portfolioLogs,
  isLoading,
  isProfit,
  isPrivate,
}: {
  portfolioLogs: PortfolioLog[];
  isLoading: boolean;
  isProfit: boolean;
  isPrivate: boolean;
}) {
  if (isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  const chartData = portfolioLogs.map((log) => ({
    date: dayjs(log.date).format('DD MMM'),
    value: Number(log.current_value),
  }));

  if (!chartData.length) {
    return (
      <div className="bg-card flex h-48 w-full items-center justify-center rounded-xl shadow-md dark:shadow-none">
        <p className="text-muted-foreground text-sm">No portfolio history yet.</p>
      </div>
    );
  }

  const color = isProfit ? 'var(--color-primary)' : 'var(--color-destructive)';

  return (
    <div className="bg-card rounded-xl p-4 shadow-md dark:shadow-none">
      <ChartContainer config={chartConfig} className="h-56 w-full">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolio-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.5} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            interval="preserveStartEnd"
          />
          <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} hide />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-popover)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              fontSize: '12px',
              color: 'var(--color-foreground)',
            }}
            formatter={(value) => [maskValue(formatINR(Number(value)), isPrivate), 'Portfolio Value']}
            labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '4px' }}
          />
          <Area
            dataKey="value"
            type="natural"
            stroke={color}
            strokeWidth={2}
            fill="url(#portfolio-gradient)"
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

export default function PortfolioPage() {
  const queryClient = useQueryClient();
  const { isPrivate } = usePrivacy();

  const {
    data: portfolioDataRaw,
    isLoading: isPortfolioLoading,
    isError: isPortfolioError,
  } = useQuery({
    queryKey: ['user-portfolio-logs'],
    queryFn: getPortfolioLogs,
  });

  const {
    data: holdingDataRaw,
    isLoading: isHoldingLoading,
    isError: isHoldingError,
  } = useQuery({
    queryKey: ['user-holdings'],
    queryFn: getHoldings,
  });

  const { mutateAsync: mutateUpdate } = useMutation({
    mutationKey: ['update-holding'],
    mutationFn: ({ holdingId, payload }: { holdingId: string; payload: UpdateHoldingPayload }) =>
      updateHolding(holdingId, payload),
    onSuccess: async () => {
      toast.success('Holding updated successfully.');
      await queryClient.invalidateQueries({ queryKey: ['user-holdings'] });
    },
    onError: (error) => {
      if (isAxiosError(error)) toast.error(error.response?.data.message);
      else toast.error('Something went wrong while trying to update holding.');
    },
  });

  const { mutateAsync: mutateDelete } = useMutation({
    mutationKey: ['delete-holding'],
    mutationFn: (holdingId: string) => deleteHolding(holdingId),
    onSuccess: async () => {
      toast.success('Holding deleted successfully.');
      await queryClient.invalidateQueries({ queryKey: ['user-holdings'] });
    },
    onError: (error) => {
      if (isAxiosError(error)) toast.error(error.response?.data.message);
      else toast.error('Something went wrong while trying to delete holding.');
    },
  });

  const portfolioLogs = portfolioDataRaw?.data?.success ? (portfolioDataRaw.data.data ?? []) : [];
  const userHoldings = holdingDataRaw?.data?.success ? (holdingDataRaw.data.data ?? []) : [];

  const latestLog = portfolioLogs.at(-1);
  const currentValue = Number(latestLog?.current_value ?? 0);
  const amountInvested = Number(latestLog?.total_invested ?? 0);
  const pnlValue = currentValue - amountInvested;
  const pnlPercentage = amountInvested ? ((pnlValue / amountInvested) * 100).toFixed(2) : '0.00';
  const isProfit = pnlValue >= 0;

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Hero */}
      <div className="space-y-1">
        {isPortfolioLoading ? (
          <>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-52" />
            <Skeleton className="h-5 w-36" />
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">Portfolio Value</p>
            <p className="font-heading text-4xl font-bold tracking-tight">
              {maskValue(formatINR(currentValue), isPrivate)}
            </p>
            <div
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium',
                isProfit ? 'text-primary' : 'text-destructive',
              )}
            >
              <span>
                {}
                {maskValue(`${isProfit ? '+' : ''}${formatINR(pnlValue)}`, isPrivate)}
              </span>
              <span className="text-muted-foreground">·</span>
              <span>{maskValue(`${isProfit ? '+' : ''}${pnlPercentage}%`, isPrivate)}</span>
              <span className="text-muted-foreground font-normal">overall</span>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      <PortfolioChart
        portfolioLogs={portfolioLogs}
        isLoading={isPortfolioLoading}
        isProfit={isProfit}
        isPrivate={isPrivate}
      />

      {/* Summary cards */}
      <HoldingsSummary
        userHoldings={userHoldings}
        isHoldingLoading={isHoldingLoading}
        isHoldingError={isHoldingError}
        portfolioData={portfolioLogs}
        isPortfolioLoading={isPortfolioLoading}
        isPortfolioError={isPortfolioError}
      />

      {/* Holdings list */}
      <HoldingsList
        userHoldings={userHoldings}
        isHoldingLoading={isHoldingLoading}
        isHoldingError={isHoldingError}
        onUpdate={(holdingId, payload) => mutateUpdate({ holdingId, payload })}
        onDelete={(holdingId) => mutateDelete(holdingId)}
      />
    </div>
  );
}
