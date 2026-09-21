'use client';
import { useRef, useState, useDeferredValue } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-provider';
import { usersOptions, userOptions } from '@/features/social/queries';
import { useI18n } from '@/providers/i18n-provider';
import { Button } from '@/components/ui/button';
import { SearchInput, Select } from '@/components/ui/field';
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
  const {
    messages: { messaging: t },
  } = useI18n();
  const members = useQuery(membersOptions(chat));
  const [search, setSearch] = useState('');
  const users = useQuery(usersOptions(useDeferredValue(search.trim())));
  const initial = useQuery({
    ...userOptions(initialUser),
    enabled: !!initialUser,
  });
  const [selected, setSelected] = useState(initialUser);
  const [removing, setRemoving] = useState<string | null>(null);
  const lock = useRef(false);
  const client = useQueryClient();
  const candidates = [
    ...new Map(
      [...(users.data ?? []), ...(initial.data ? [initial.data] : [])].map(
        (person) => [person.id, person],
      ),
    ).values(),
  ].filter(
    (person) => !members.data?.some((member) => member.user_id === person.id),
  );
  const mutation = useMutation({
    retry: false,
    mutationFn: async ({
      value,
      remove,
    }: {
      value: string;
      remove: boolean;
    }) => {
      if (remove) await removeMember(chat, value);
      else await addMember(chat, value);
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
  const run = (value: string, remove: boolean) => {
    if (lock.current || mutation.isPending) return;
    lock.current = true;
    mutation.mutate({ value, remove });
  };
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
              <span>{member.user.username}</span>
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
      <form
        className={styles.memberForm}
        onSubmit={(event) => {
          event.preventDefault();
          const person = candidates.find((person) => person.id === selected);
          if (person && members.isSuccess) run(person.username, false);
        }}
      >
        <SearchInput
          label={t.searchPeople}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {users.isError && <ChatError retry={() => void users.refetch()} />}
        <Select
          label={t.person}
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          disabled={mutation.isPending || !members.isSuccess}
        >
          <option value="">{t.choosePerson}</option>
          {candidates.map((person) => (
            <option key={person.id} value={person.id}>
              {person.username}
            </option>
          ))}
        </Select>
        <Button
          type="submit"
          loading={mutation.isPending}
          disabled={
            !members.isSuccess ||
            !candidates.some((person) => person.id === selected)
          }
        >
          {t.addMember}
        </Button>
      </form>
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
