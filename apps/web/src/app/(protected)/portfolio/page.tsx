'use client';

import HoldingsList from '@/components/HoldingsList';
import HoldingsSummary from '@/components/HoldingsSummary';
import PortfolioValueChart from '@/components/PortfolioValueChart';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteHolding, getHoldings, getPortfolioLogs, updateHolding } from '@/lib/api-client';
import { usePrivacy } from '@/lib/PrivacyContext';
import { UpdateHoldingPayload } from '@/lib/schema';
import { cn, formatINR, maskValue } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

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
      await queryClient.invalidateQueries({ queryKey: ['user-portfolio-logs'] });
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
      await queryClient.invalidateQueries({ queryKey: ['user-portfolio-logs'] });
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
                {maskValue(`${isProfit ? '+' : ''}${formatINR(pnlValue)}`, isPrivate)}
              </span>
              <span className="text-muted-foreground">·</span>
              <span>{`${isProfit ? '+' : ''}${pnlPercentage}%`}</span>
              <span className="text-muted-foreground font-normal">overall</span>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      <PortfolioValueChart
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
