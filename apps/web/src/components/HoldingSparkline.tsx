'use client';

import { ChartContainer } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { getNavHistory } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { Line, LineChart, YAxis } from 'recharts';

const chartConfig = {
  nav: { color: 'var(--color-primary)' },
};

export default function HoldingSparkline({ schemeCode, isProfit }: { schemeCode: string; isProfit: boolean }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['nav-history', schemeCode],
    queryFn: () => getNavHistory(schemeCode),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <Skeleton className="h-12 w-24 rounded-md" />;
  if (isError) return <div className="h-12 w-24 shrink-0" />;

  const chartData = (data?.data?.data ?? []).map((nav) => ({ nav }));

  if (!chartData.length) return null;

  const color = isProfit ? 'var(--color-primary)' : 'var(--color-destructive)';

  return (
    <div className="h-12 w-24 shrink-0">
      <ChartContainer config={chartConfig}>
        <LineChart data={chartData}>
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
          <Line
            dataKey="nav"
            type="natural"
            stroke={color}
            strokeWidth={1.5}
            dot={{ r: 1.2, fill: color, strokeWidth: 0 }}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
