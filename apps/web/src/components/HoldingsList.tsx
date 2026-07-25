import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { formatINR } from '@/lib/utils';
import { Holding } from '@mintfolio/shared';
import { EllipsisVerticalIcon } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export default function HoldingsList({
  userHoldings,
  isHoldingLoading,
  isHoldingError,
}: {
  userHoldings: Holding[];
  isHoldingLoading: boolean;
  isHoldingError: boolean;
}) {
  return (
    <div>
      <h2 className="font-heading text-lg font-semibold">Your Holdings</h2>
      <div className="mt-4 flex flex-col gap-3">
        {isHoldingError ? (
          <p className="text-muted-foreground text-sm">Something went wrong while fetching holdings.</p>
        ) : isHoldingLoading ? (
          <>
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-18.5¯ w-full rounded-xl" />
            ))}
          </>
        ) : userHoldings.length ? (
          userHoldings.map((holding) => (
            <Item key={holding.id} className="flex-nowrap">
              <ItemContent>
                <ItemTitle className="text-base" title={holding.scheme_name}>
                  <span className="truncate">{holding.scheme_name}</span>
                </ItemTitle>
                <ItemDescription className="text-sm">
                  {formatINR(Number(holding.amount_invested))} · {holding.units} units
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="ghost" size="icon">
                  <EllipsisVerticalIcon />
                </Button>
              </ItemActions>
            </Item>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No holdings yet.</p>
        )}
      </div>
    </div>
  );
}
