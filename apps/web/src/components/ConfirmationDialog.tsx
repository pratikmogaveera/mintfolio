'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

// --- Types ---

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

interface ConfirmationDialogState extends ConfirmOptions {
  open: boolean;
}

interface ConfirmationContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

// --- Context ---

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);

// --- Provider ---

export function ConfirmationDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmationDialogState>({
    open: false,
    title: '',
    description: undefined,
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    isDestructive: false,
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ open: true, ...options });
    });
  }, []);

  function handleConfirm() {
    resolverRef.current?.(true);
    setState((prev) => ({ ...prev, open: false }));
  }

  function handleCancel() {
    resolverRef.current?.(false);
    setState((prev) => ({ ...prev, open: false }));
  }

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={state.open} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent
          showCloseButton={false}
          className={cn('max-w-[calc(100%-2rem)] sm:max-w-sm', state.isDestructive && 'border-destructive border')}
        >
          <DialogHeader>
            <DialogTitle>{state.title}</DialogTitle>
            {state.description && <DialogDescription>{state.description}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button variant={state.isDestructive ? 'destructive' : 'default'} onClick={handleConfirm}>
              {state.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmationContext.Provider>
  );
}

// --- Hook ---

export function useConfirm() {
  const ctx = useContext(ConfirmationContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmationDialogProvider');
  return ctx.confirm;
}
