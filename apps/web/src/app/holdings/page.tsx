'use client';
import AddHoldingForm from '@/components/AddHoldingForm';
import HoldingsList from '@/components/HoldingsList';
import { deleteHolding, getHoldings, updateHolding } from '@/lib/api-client';
import { UpdateHoldingPayload } from '@/lib/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

export default function HoldingsPage() {
  const queryClient = useQueryClient();

  const {
    data,
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

  const userHoldings = data?.data?.success ? data?.data?.data || [] : [];

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">Holdings</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <AddHoldingForm />
        <HoldingsList
          userHoldings={userHoldings}
          isHoldingLoading={isHoldingLoading}
          isHoldingError={isHoldingError}
          onUpdate={(holdingId, payload) => mutateUpdate({ holdingId, payload })}
          onDelete={(holdingId) => mutateDelete(holdingId)}
        />
      </div>
    </div>
  );
}
