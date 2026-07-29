'use client';

import { useConfirm } from '@/components/ConfirmationDialog';
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
import { UpdateHoldingPayload } from '@/lib/schema';
import { formatINR, maskValue } from '@/lib/utils';
import { Holding } from '@mintfolio/shared';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';
import { EllipsisVerticalIcon } from 'lucide-react';
import { useState } from 'react';
import HoldingSparkline from '@/components/HoldingSparkline';
import { usePrivacy } from '@/lib/PrivacyContext';

interface HoldingsListProps {
  userHoldings: Holding[];
  isHoldingLoading: boolean;
  isHoldingError: boolean;
  onUpdate: (holdingId: string, payload: UpdateHoldingPayload) => Promise<unknown>;
  onDelete: (holdingId: string) => Promise<unknown>;
}

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
  const { isPrivate } = usePrivacy();

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

  return (
    <>
      <div style={{ viewTransitionName: 'holdings-list' }}>
        <h2 className="font-heading text-lg font-semibold">Your Holdings</h2>
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
            userHoldings.map((holding) => (
              <Item key={holding.id} className="flex-wrap gap-y-2">
                {/* Row 1: Name + Menu */}
                <div className="flex w-full items-start justify-between gap-2">
                  <p
                    className="font-heading line-clamp-2 text-sm font-medium"
                    title={maskValue(holding.scheme_name, isPrivate)}
                  >
                    {maskValue(holding.scheme_name, isPrivate)}
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
                  const isProfit = Number(holding.current_value) >= Number(holding.amount_invested);
                  return (
                    <div className="flex w-full items-center gap-3">
                      <div className="flex flex-1 flex-col gap-0.5">
                        <ItemDescription
                          className={`text-sm font-medium ${isProfit ? 'text-primary' : 'text-destructive'}`}
                        >
                          {maskValue(formatINR(Number(holding.current_value)), isPrivate)}
                        </ItemDescription>
                        <ItemDescription>
                          {maskValue(formatINR(Number(holding.amount_invested)), isPrivate)} invested
                        </ItemDescription>
                        <ItemDescription>{maskValue(holding.units, isPrivate)} units</ItemDescription>
                      </div>
                      <HoldingSparkline schemeCode={holding.scheme_code} isProfit={isProfit} />
                    </div>
                  );
                })()}
              </Item>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No holdings yet.</p>
          )}
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
