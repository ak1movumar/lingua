'use client';
import { useRef, useState } from 'react';
import { z } from 'zod';
import { getApiFailure } from '@/services/api/errors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-provider';
import { usersOptions } from '@/features/social/queries';
import { useI18n } from '@/providers/i18n-provider';
import { Button } from '@/components/ui/button';
import { Input, SearchInput, Select } from '@/components/ui/field';
import { ConfirmDialog } from '@/components/ui/modal';
import { queryKeys } from '@/constants/query-keys';
import { membersOptions } from './queries';
import { addMember, removeMember } from './api';
import { ChatError, ChatLoading } from './chat-state';
import styles from './chat.module.scss';
export function MemberManager({
  chat,
  initialUser = '',
}: {
  chat: string;
  initialUser?: string;
}) {
  const { user } = useAuth();
  const members = useQuery(membersOptions(chat));
  const users = useQuery(usersOptions());
  const {
    messages: { messaging: t },
  } = useI18n();
  const [selected, setSelected] = useState(initialUser);
  const [search, setSearch] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const lock = useRef(false);
  const client = useQueryClient();
  const mutation = useMutation({
    retry: false,
    mutationFn: async ({ id, remove }: { id: string; remove: boolean }) => {
      if (remove) await removeMember(chat, id);
      else await addMember(chat, id);
    },
    onSuccess: () => {
      setRemoving(null);
      setSelected('');
    },
    onSettled: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.chatMembers(chat) }),
        client.invalidateQueries({ queryKey: queryKeys.chats }),
      ]);
      lock.current = false;
    },
  });
  const run = (id: string, remove: boolean) => {
    if (lock.current || mutation.isPending) return;
    lock.current = true;
    mutation.mutate({ id, remove });
  };
  const candidates = (users.data ?? []).filter(
    (person) =>
      !members.data?.some((member) => member.user_id === person.id) &&
      person.username
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <div className={styles.memberPanel}>
      {members.isPending ? (
        <ChatLoading />
      ) : members.isError ? (
        <ChatError retry={() => void members.refetch()} />
      ) : (
        <ul className={styles.memberList}>
          {members.data.map((member) => (
            <li key={member.user_id}>
              <span>
                {users.data?.find((person) => person.id === member.user_id)
                  ?.username ?? member.user_id}
              </span>
              <Button
                variant="ghost"
                disabled={mutation.isPending}
                onClick={() => {
                  mutation.reset();
                  setRemoving(member.user_id);
                }}
              >
                {member.user_id === user?.id ? t.leave : t.removeMember}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.hint}>{t.memberHint}</p>
      {users.isPending ? (
        <ChatLoading />
      ) : users.isError ? (
        getApiFailure(users.error).status === 403 ? (
          <form
            className={styles.memberForm}
            onSubmit={(event) => {
              event.preventDefault();
              const id = selected.trim().toLowerCase();
              if (
                z.uuid().safeParse(id).success &&
                members.isSuccess &&
                !members.data.some((member) => member.user_id === id)
              )
                run(id, false);
            }}
          >
            <Input
              label={t.person + ' · ID'}
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              disabled={mutation.isPending}
              autoComplete="off"
              spellCheck={false}
            />
            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={
                !z.uuid().safeParse(selected.trim().toLowerCase()).success ||
                !members.isSuccess ||
                members.data?.some(
                  (member) => member.user_id === selected.trim().toLowerCase(),
                )
              }
            >
              {t.addMember}
            </Button>
          </form>
        ) : (
          <ChatError retry={() => void users.refetch()} />
        )
      ) : (
        <form
          className={styles.memberForm}
          onSubmit={(event) => {
            event.preventDefault();
            if (selected && members.isSuccess) run(selected, false);
          }}
        >
          <SearchInput
            label={t.searchPeople}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label={t.person}
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            disabled={mutation.isPending || !members.isSuccess}
          >
            <option value="">{t.choosePerson}</option>
            {candidates.map((person) => (
              <option value={person.id} key={person.id}>
                {person.username}
              </option>
            ))}
          </Select>
          <Button
            type="submit"
            disabled={
              !selected ||
              !members.isSuccess ||
              !candidates.some((person) => person.id === selected)
            }
            loading={mutation.isPending}
          >
            {t.addMember}
          </Button>
        </form>
      )}
      {mutation.isError && (
        <p role="alert" className={styles.error}>
          {t.actionError}
        </p>
      )}
      {mutation.isSuccess && <p role="status">{t.saved}</p>}
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) run(removing, true);
        }}
        title={t.removeMemberTitle}
        description={t.removeMemberBody}
        confirmLabel={t.confirm}
        loading={mutation.isPending}
        error={mutation.isError ? t.actionError : undefined}
      />
    </div>
  );
}
