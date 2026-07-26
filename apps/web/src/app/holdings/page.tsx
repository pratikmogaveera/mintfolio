'use client';
import AddHoldingForm from '@/components/AddHoldingForm';
import HoldingsList from '@/components/HoldingsList';
import HoldingsSummary from '@/components/HoldingsSummary';
import { deleteHolding, getHoldings, getPortfolioLogs, updateHolding } from '@/lib/api-client';
import { UpdateHoldingPayload } from '@/lib/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

export default function HoldingsPage() {
  const queryClient = useQueryClient();

  const {
    data: holdingDataRaw,
    isLoading: isHoldingLoading,
    isError: isHoldingError,
  } = useQuery({
    queryKey: ['user-holdings'],
    queryFn: getHoldings,
  });

  const {
    data: portfolioDataRaw,
    isLoading: isPortfolioLoading,
    isError: isPortfolioError,
  } = useQuery({
    queryKey: ['user-portfolio-logs'],
    queryFn: getPortfolioLogs,
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

  const userHoldings = holdingDataRaw?.data?.success ? holdingDataRaw?.data?.data || [] : [];
  const portfolioData = portfolioDataRaw?.data?.success ? portfolioDataRaw?.data?.data || [] : [];

  return (
    <div className="w-full min-w-0">
      <div className="mt-6 grid w-full gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-8">
          <AddHoldingForm />
          <HoldingsSummary
            userHoldings={userHoldings}
            isHoldingLoading={isHoldingLoading}
            isHoldingError={isHoldingError}
            portfolioData={portfolioData}
            isPortfolioLoading={isPortfolioLoading}
            isPortfolioError={isPortfolioError}
          />
        </div>
        <div className="min-w-0">
          <HoldingsList
            userHoldings={userHoldings}
            isHoldingLoading={isHoldingLoading}
            isHoldingError={isHoldingError}
            onUpdate={(holdingId, payload) => mutateUpdate({ holdingId, payload })}
            onDelete={(holdingId) => mutateDelete(holdingId)}
          />
        </div>
      </div>
    </div>
  );
}
