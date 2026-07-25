'use client';
import AddHoldingForm from '@/components/AddHoldingForm';
import HoldingsList from '@/components/HoldingsList';
import { getHoldings } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

export default function HoldingsPage() {
  const {
    data,
    isLoading: isHoldingLoading,
    isError: isHoldingError,
  } = useQuery({
    queryKey: ['user-holdings'],
    queryFn: getHoldings,
  });

  const userHoldings = data?.data?.success ? data?.data?.data || [] : [];

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">Holdings</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <AddHoldingForm />
        <HoldingsList userHoldings={userHoldings} isHoldingLoading={isHoldingLoading} isHoldingError={isHoldingError} />
      </div>
    </div>
  );
}
