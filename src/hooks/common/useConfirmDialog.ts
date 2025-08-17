'use client';

import { useCallback, useState } from 'react';

interface UseConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface UseConfirmDialogReturn {
  isOpen: boolean;
  showDialog: (options?: Partial<UseConfirmDialogOptions>) => Promise<boolean>;
  closeDialog: () => void;
  dialogProps: UseConfirmDialogOptions & {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  };
}

/**
 * Hook for managing confirmation dialogs
 * Returns a promise that resolves to true if confirmed, false if cancelled
 */
export const useConfirmDialog = (
  defaultOptions: UseConfirmDialogOptions,
): UseConfirmDialogReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentOptions, setCurrentOptions] = useState(defaultOptions);
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const showDialog = useCallback(
    (options?: Partial<UseConfirmDialogOptions>): Promise<boolean> => {
      const mergedOptions = { ...defaultOptions, ...options };
      setCurrentOptions(mergedOptions);
      setIsOpen(true);

      return new Promise<boolean>((resolve) => {
        setResolvePromise(() => resolve);
      });
    },
    [defaultOptions],
  );

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
    setIsOpen(false);
  }, [resolvePromise]);

  const dialogProps = {
    ...currentOptions,
    isOpen,
    onClose: closeDialog,
    onConfirm: handleConfirm,
  };

  return {
    isOpen,
    showDialog,
    closeDialog,
    dialogProps,
  };
};
