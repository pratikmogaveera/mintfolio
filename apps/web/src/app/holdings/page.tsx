import AddHoldingForm from '@/components/AddHoldingForm';
import HoldingsList from '@/components/HoldingsList';

export default function HoldingsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Holdings</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <AddHoldingForm />
        <HoldingsList />
      </div>
    </div>
  );
}
