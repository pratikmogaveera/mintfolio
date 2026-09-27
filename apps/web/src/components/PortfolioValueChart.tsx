'use client';

import { ChartContainer } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatINR, maskValue } from '@/lib/utils';
import { PortfolioLog } from '@mintfolio/shared';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

type ChartMode = 'value' | 'returns';

const chartConfig = {
  current_value: { color: 'var(--color-primary)' },
};

interface PortfolioValueChartProps {
  portfolioLogs: PortfolioLog[];
  isLoading: boolean;
  isProfit: boolean;
  isPrivate: boolean;
}

export default function PortfolioValueChart({
  portfolioLogs,
  isLoading,
  isProfit,
  isPrivate,
}: PortfolioValueChartProps) {
  const [mode, setMode] = useState<ChartMode>('value');

  if (isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  const chartData = portfolioLogs.map((log) => {
    const invested = Number(log.total_invested);
    const current = Number(log.current_value);
    return {
      date: dayjs(log.date).format('DD MMM'),
      value: mode === 'value' ? current : current - invested,
    };
  });

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
      {/* Toggle */}
      <div className="mb-3 flex justify-end">
        <div className="bg-muted flex gap-1 rounded-lg p-1">
          {(['value', 'returns'] as ChartMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {m === 'value' ? 'Portfolio Value' : 'Returns'}
            </button>
          ))}
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-56 w-full">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolio-value-gradient" x1="0" y1="0" x2="0" y2="1">
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
          <YAxis
            domain={mode === 'value' ? ['dataMin - 1000', 'dataMax + 1000'] : ['dataMin - 500', 'dataMax + 500']}
            hide
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-popover)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              fontSize: '12px',
              color: 'var(--color-foreground)',
            }}
            formatter={(value) => [
              maskValue(formatINR(Number(value)), isPrivate),
              mode === 'value' ? 'Portfolio Value' : 'Returns',
            ]}
            labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '4px' }}
          />
          <Area
            dataKey="value"
            type="natural"
            stroke={color}
            strokeWidth={2}
            fill="url(#portfolio-value-gradient)"
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
