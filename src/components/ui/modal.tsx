'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { Button, IconButton } from './button';
import { acquireScrollLock } from '@/lib/scroll-lock';
import styles from './modal.module.scss';
import { cn } from '@/lib/cn';
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const {
    messages: { ui },
  } = useI18n();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog.showModal();
    const unlock = acquireScrollLock(document.body);
    return () => {
      dialog.close();
      unlock();
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={cn(styles.modal, className)}
      aria-labelledby={id}
      aria-describedby={description ? id + '-description' : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onClose();
        }
      }}
    >
      <header>
        <h2 id={id}>{title}</h2>
        <IconButton label={ui.close} onClick={onClose}>
          <X size={20} />
        </IconButton>
      </header>
      {description && <p id={id + '-description'}>{description}</p>}
      <div>{children}</div>
      {footer && <footer>{footer}</footer>}
    </dialog>
  );
}
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  error,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  error?: string;
  loading?: boolean;
}) {
  const {
    messages: { ui },
  } = useI18n();
  return (
    <Modal
      open={open}
      onClose={() => {
        if (!loading) onClose();
      }}
      title={title}
      description={description}
      footer={
        <>
          <Button
            variant="secondary"
            autoFocus
            disabled={loading}
            onClick={onClose}
          >
            {ui.cancel}
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {error && <p role="alert">{error}</p>}
    </Modal>
  );
}
