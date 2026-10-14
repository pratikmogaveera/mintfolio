'use client';

import { useConfirm } from '@/components/ConfirmationDialog';
import HoldingSparkline from '@/components/HoldingSparkline';
import UpdateHoldingDialog from '@/components/UpdateHoldingDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Item, ItemDescription } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrivacy } from '@/lib/PrivacyContext';
import { UpdateHoldingPayload } from '@/lib/schema';
import { calculatePercentage, formatINR, maskValue } from '@/lib/utils';
import { Holding } from '@mintfolio/shared';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  EllipsisVerticalIcon,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

interface HoldingsListProps {
  userHoldings: Holding[];
  isHoldingLoading: boolean;
  isHoldingError: boolean;
  onUpdate: (holdingId: string, payload: UpdateHoldingPayload) => Promise<unknown>;
  onDelete: (holdingId: string) => Promise<unknown>;
}

type SortType = 'alphabetic' | 'numeric';
type SortValue = 'ascending' | 'descending';

export default function HoldingsList({
  userHoldings,
  isHoldingLoading,
  isHoldingError,
  onUpdate,
  onDelete,
}: HoldingsListProps) {
  const confirm = useConfirm();
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [sortName, setSortName] = useState<SortValue>('ascending');
  const [sortReturns, setSortReturns] = useState<SortValue>('ascending');
  const [sortActive, setSortActive] = useState<SortType>('alphabetic');
  const { isPrivate } = usePrivacy();

  const sortedUserHoldings = [...userHoldings].sort((a, b) => {
    if (sortActive === 'alphabetic')
      return sortName === 'ascending'
        ? a.scheme_name.localeCompare(b.scheme_name)
        : b.scheme_name.localeCompare(a.scheme_name);

    const returnsA = Number(calculatePercentage(a.current_value, a.amount_invested));
    const returnsB = Number(calculatePercentage(b.current_value, b.amount_invested));
    return sortReturns === 'ascending' ? returnsA - returnsB : returnsB - returnsA;
  });

  const handleUpdate = (holding: Holding) => {
    setSelectedHolding(holding);
    setUpdateDialogOpen(true);
  };

  const handleDelete = async (holding: Holding) => {
    const confirmed = await confirm({
      title: 'Delete holding?',
      description: `${holding.scheme_name} will be removed from your portfolio. This cannot be undone.`,
      confirmLabel: 'Delete',
      isDestructive: true,
    });

    if (!confirmed) return;
    await onDelete(holding.id);
  };

  const handleSort = (sortType: 'alphabetic' | 'numeric') => {
    if (sortType === 'alphabetic') {
      setSortActive('alphabetic');
      setSortName((prev) => (prev === 'ascending' ? 'descending' : 'ascending'));
    } else {
      setSortActive('numeric');
      setSortReturns((prev) => (prev === 'ascending' ? 'descending' : 'ascending'));
    }
  };

  if (!isHoldingLoading && !isHoldingError && userHoldings.length === 0) return null;

  return (
    <>
      <div style={{ viewTransitionName: 'holdings-list' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Your Holdings</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleSort('alphabetic')}
              variant={sortActive === 'alphabetic' ? 'outline' : 'ghost'}
              title={`Sort ${sortName === 'ascending' ? 'descending' : 'ascending'} scheme name`}
            >
              {sortName === 'ascending' ? <ArrowUpAZ /> : <ArrowDownAZ />}
            </Button>
            <Button
              onClick={() => handleSort('numeric')}
              variant={sortActive === 'numeric' ? 'outline' : 'ghost'}
              title={`Sort ${sortReturns === 'ascending' ? 'descending' : 'ascending'} returns amount`}
            >
              {sortReturns === 'ascending' ? <ArrowUp01 /> : <ArrowDown01 />}
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {isHoldingError ? (
            <p className="text-muted-foreground text-sm">Something went wrong while fetching holdings.</p>
          ) : isHoldingLoading ? (
            <>
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-32.5 w-full rounded-xl" />
              ))}
            </>
          ) : userHoldings.length ? (
            sortedUserHoldings.map((holding) => (
              <Item key={holding.id} className="flex-wrap gap-y-2">
                {/* Row 1: Name + Menu */}
                <div className="flex w-full items-start justify-between gap-2">
                  <p className="font-heading line-clamp-2 text-sm font-medium" title={holding.scheme_name}>
                    {holding.scheme_name}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <EllipsisVerticalIcon />
                        </Button>
                      }
                    />
                    <DropdownMenuContent>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleUpdate(holding)}>
                          <PencilIcon /> Update
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(holding)}>
                          <TrashIcon /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Row 2: Stats + Chart */}
                {(() => {
                  const { current_value, amount_invested } = holding;
                  const isProfit = Number(current_value) >= Number(amount_invested);
                  const pnlValue = Number(current_value) - Number(amount_invested);
                  const pnlPercentage = calculatePercentage(pnlValue, amount_invested);

                  return (
                    <div className="flex w-full items-center gap-3">
                      <div className="flex flex-1 flex-col gap-0.5">
                        <ItemDescription
                          className={`text-sm font-medium ${isProfit ? 'text-primary' : 'text-destructive'}`}
                        >
                          <span className="flex items-center gap-4">
                            {maskValue(formatINR(Number(current_value)), isPrivate)}
                            <span className="flex items-center gap-1">
                              {isProfit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                              {pnlPercentage}%
                            </span>
                          </span>
                        </ItemDescription>
                        <ItemDescription>
                          {maskValue(formatINR(Number(amount_invested)), isPrivate)} invested
                          <span className="text-muted-foreground mx-1.5">·</span>
                          {maskValue(holding.units, isPrivate)} units
                        </ItemDescription>
                      </div>
                      <HoldingSparkline schemeCode={holding.scheme_code} isProfit={isProfit} />
                    </div>
                  );
                })()}
              </Item>
            ))
          ) : null}
        </div>
      </div>

      <UpdateHoldingDialog
        holding={selectedHolding}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        onUpdate={onUpdate}
      />
    </>
  );
}
