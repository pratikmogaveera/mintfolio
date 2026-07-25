'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { UpdateHoldingPayload, updateHoldingSchema } from '@/lib/schema';
import { Holding } from '@mintfolio/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { IndianRupee, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface UpdateHoldingDialogProps {
  holding: Holding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (holdingId: string, payload: UpdateHoldingPayload) => Promise<unknown>;
}

export default function UpdateHoldingDialog({ holding, open, onOpenChange, onUpdate }: UpdateHoldingDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateHoldingPayload>({
    resolver: zodResolver(updateHoldingSchema),
    mode: 'onTouched',
  });

  // Pre-fill form when a holding is selected
  useEffect(() => {
    if (holding) {
      reset({
        units: Number(holding.units),
        amount_invested: Number(holding.amount_invested),
      });
    }
  }, [holding, reset]);

  const submitForm: SubmitHandler<UpdateHoldingPayload> = async (data) => {
    if (!holding) return;
    try {
      await onUpdate(holding.id, data);
      onOpenChange(false);
    } catch {
      // error toast is handled by the mutation's onError — dialog stays open
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <form onSubmit={handleSubmit(submitForm)}>
          <DialogHeader>
            <DialogTitle>Update Holding</DialogTitle>
            <DialogDescription
              className="line-clamp-2 text-xs leading-relaxed"
              title={holding?.scheme_name}
            >
              {holding?.scheme_name}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex items-start gap-3">
            <div className="w-full min-w-0">
              <Field>
                <FieldLabel>Invested (₹)</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    placeholder="500"
                    {...register('amount_invested', {
                      onBlur: (e) => {
                        const parsed = parseFloat(e.target.value);
                        if (!isNaN(parsed)) e.target.value = String(parsed);
                      },
                    })}
                  />
                  <InputGroupAddon align="inline-start">
                    <IndianRupee />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <p className="mt-1 min-h-4 text-xs text-red-600">{errors.amount_invested?.message}</p>
            </div>

            <div className="w-full min-w-0">
              <Field>
                <FieldLabel>Units</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    placeholder="10"
                    {...register('units', {
                      onBlur: (e) => {
                        const parsed = parseFloat(e.target.value);
                        if (!isNaN(parsed)) e.target.value = String(parsed);
                      },
                    })}
                  />
                </InputGroup>
              </Field>
              <p className="mt-1 min-h-4 text-xs text-red-600">{errors.units?.message}</p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
