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
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { UpdateHoldingPayload } from '@/lib/schema';
import { formatINR } from '@/lib/utils';
import { Holding } from '@mintfolio/shared';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react';
import { EllipsisVerticalIcon } from 'lucide-react';
import { useState } from 'react';

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

  const handleUpdate = (holding: Holding) => {
    setSelectedHolding(holding);
    setUpdateDialogOpen(true);
  };

  const handleDelete = async (holdingId: string) => {
    const confirmed = await confirm({
      title: 'Delete holding?',
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      isDestructive: true,
    });

    if (!confirmed) return;
    await onDelete(holdingId);
  };

  return (
    <>
      <div>
        <h2 className="font-heading text-lg font-semibold">Your Holdings</h2>
        <div className="mt-4 flex flex-col gap-3">
          {isHoldingError ? (
            <p className="text-muted-foreground text-sm">Something went wrong while fetching holdings.</p>
          ) : isHoldingLoading ? (
            <>
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-[4.625rem] w-full rounded-xl" />
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
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon">
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
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(holding.id)}>
                          <TrashIcon /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
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
