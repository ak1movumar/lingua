'use client';
import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/providers/i18n-provider';
import { useAuth } from '@/features/auth/auth-provider';
import { queryKeys } from '@/constants/query-keys';
import { reactionsOptions } from './queries';
import { addReaction, removeReaction } from './api';
import { reactionGroups } from './contracts';
import styles from './chat.module.scss';
export function ReactionPicker({
  chat,
  message,
  visible,
}: {
  chat: string;
  message: string;
  visible: boolean;
}) {
  const { user } = useAuth();
  const {
    messages: { messaging: t },
  } = useI18n();
  const query = useQuery({
    ...reactionsOptions(chat, message),
    enabled: visible,
  });
  const client = useQueryClient();
  const lock = useRef(false);
  const mutation = useMutation({
    retry: false,
    mutationFn: async ({
      value,
      remove,
    }: {
      value: string;
      remove: boolean;
    }) => {
      if (remove) await removeReaction(chat, message, value);
      else await addReaction(chat, message, value);
    },
    onSettled: async () => {
      await client.invalidateQueries({
        queryKey: queryKeys.reactions(chat, message),
      });
      lock.current = false;
    },
  });
  const groups = reactionGroups(query.data ?? [], user?.id ?? '');
  const toggle = (value: string, remove: boolean) => {
    if (lock.current || mutation.isPending || !query.isSuccess) return;
    lock.current = true;
    mutation.mutate({ value, remove });
  };
  return (
    <div className={styles.reactions}>
      {groups.map((group) => (
        <Button
          key={group.value}
          size="sm"
          variant={group.own ? 'secondary' : 'ghost'}
          aria-pressed={group.own}
          aria-label={
            (group.own ? t.removeReaction : t.addReaction) + ': ' + group.value
          }
          disabled={mutation.isPending}
          onClick={() => toggle(group.value, group.own)}
        >
          {group.value} {group.count}
        </Button>
      ))}
      <details>
        <summary aria-label={t.reactions}>{t.react}</summary>
        <div className={styles.reactionChoices}>
          {['👍', '❤️', '🎉', '😊', '💡'].map((value) => (
            <Button
              size="sm"
              variant="ghost"
              key={value}
              aria-label={t.addReaction + ': ' + value}
              disabled={mutation.isPending || !query.isSuccess}
              onClick={() =>
                toggle(
                  value,
                  groups.some((group) => group.value === value && group.own),
                )
              }
            >
              {value}
            </Button>
          ))}
        </div>
      </details>
      {query.isError && (
        <Button size="sm" variant="ghost" onClick={() => void query.refetch()}>
          {t.retryReactions}
        </Button>
      )}
      {mutation.isError && (
        <p role="alert" className={styles.error}>
          {t.actionError}
        </p>
      )}
    </div>
  );
}
