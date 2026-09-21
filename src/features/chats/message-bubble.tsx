'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, CheckCheck, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-provider';
import { useI18n } from '@/providers/i18n-provider';
import { Button, IconButton } from '@/components/ui/button';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/field';
import { cn } from '@/lib/cn';
import { useMessageAction } from './queries';
import type { Message } from './contracts';
import styles from './chat.module.scss';
export function MessageBubble({
  message,
  name,
}: {
  message: Message;
  name: string;
}) {
  const { user } = useAuth();
  const {
    messages: { messaging: t },
    locale,
  } = useI18n();
  const own = message.sender_id === user?.id;
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState('');
  const ref = useRef<HTMLElement>(null);
  const locked = useRef(false);
  const read = useMessageAction(message.chat_id);
  const mutation = useMessageAction(message.chat_id);
  const date = new Date(message.created_at);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let intersects = false;
    const update = () =>
      setVisible(
        intersects &&
          document.visibilityState === 'visible' &&
          document.hasFocus(),
      );
    const observer = new IntersectionObserver(
      (entries) => {
        intersects = entries.some((entry) => entry.isIntersecting);
        update();
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('focus', update);
    window.addEventListener('blur', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('focus', update);
      window.removeEventListener('blur', update);
    };
  }, []);
  const { mutate: mark, isIdle: unreadIdle } = read;
  useEffect(() => {
    if (visible && !own && !message.is_read && unreadIdle)
      mark({ type: 'read', id: message.id });
  }, [visible, own, message.is_read, message.id, unreadIdle, mark]);
  const save = () => {
    if (locked.current || mutation.isPending || !draft.trim()) return;
    locked.current = true;
    mutation.mutate(
      { type: 'edit', id: message.id, content: draft },
      {
        onSuccess: () => setEditing(false),
        onSettled: () => {
          locked.current = false;
        },
      },
    );
  };
  return (
    <article ref={ref} className={cn(styles.message, own && styles.own)}>
      {!own && <span className={styles.sender}>{name}</span>}
      <div className={styles.bubble}>
        <p>{message.content}</p>
        <div className={styles.messageMeta}>
          {Number.isFinite(date.getTime()) && (
            <time dateTime={message.created_at}>
              {new Intl.DateTimeFormat(locale, {
                hour: '2-digit',
                minute: '2-digit',
              }).format(date)}
            </time>
          )}
          {own && (
            <span
              aria-label={message.is_read ? t.read : t.sent}
              title={message.is_read ? t.read : t.sent}
            >
              {message.is_read ? <CheckCheck size={15} /> : <Check size={15} />}
            </span>
          )}
        </div>
      </div>
      <div className={styles.messageTools}>
        {own && (
          <>
            <IconButton
              label={t.edit}
              size="sm"
              onClick={() => {
                mutation.reset();
                setDraft(message.content);
                setEditing(true);
              }}
            >
              <Pencil size={15} />
            </IconButton>
            <IconButton
              label={t.delete}
              size="sm"
              onClick={() => {
                mutation.reset();
                setDeleting(true);
              }}
            >
              <Trash2 size={15} />
            </IconButton>
          </>
        )}
      </div>
      {read.isError && (
        <Button
          variant="ghost"
          size="sm"
          disabled={!visible || read.isPending}
          onClick={() => mark({ type: 'read', id: message.id })}
        >
          {t.retryRead}
        </Button>
      )}
      <Modal
        open={editing}
        onClose={() => {
          if (!mutation.isPending) setEditing(false);
        }}
        title={t.edit}
      >
        <form
          className={styles.memberForm}
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <Textarea
            label={t.message}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={mutation.isPending}
            autoFocus
          />
          {mutation.isError && (
            <p className={styles.error} role="alert">
              {t.actionError}
            </p>
          )}
          <Button
            type="submit"
            disabled={!draft.trim()}
            loading={mutation.isPending}
          >
            {t.save}
          </Button>
        </form>
      </Modal>
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => {
          if (locked.current || mutation.isPending) return;
          locked.current = true;
          mutation.mutate(
            { type: 'delete', id: message.id },
            {
              onSuccess: () => setDeleting(false),
              onSettled: () => {
                locked.current = false;
              },
            },
          );
        }}
        title={t.deleteTitle}
        description={t.deleteBody}
        confirmLabel={t.delete}
        loading={mutation.isPending}
        error={mutation.isError ? t.actionError : undefined}
      />
    </article>
  );
}
