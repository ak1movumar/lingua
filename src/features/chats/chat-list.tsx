'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/surface';
import { SearchInput } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';
import { useI18n } from '@/providers/i18n-provider';
import { useAuth } from '@/features/auth/auth-provider';
import { usersOptions } from '@/features/social/queries';
import { cn } from '@/lib/cn';
import { chatsOptions, membersOptions, messagesOptions } from './queries';
import { chatDisplayName, unreadMessages, type Chat } from './contracts';
import { ChatError, ChatLoading } from './chat-state';
import styles from './chat.module.scss';
function ChatListItem({
  chat,
  active,
  names,
}: {
  chat: Chat;
  active?: string;
  names: Map<string, string>;
}) {
  const members = useQuery(membersOptions(chat.id));
  const messages = useQuery(messagesOptions(chat.id));
  const { user } = useAuth();
  const {
    messages: { messaging: t },
    locale,
  } = useI18n();
  const name = chatDisplayName(
    chat,
    members.data ?? [],
    names,
    user?.id ?? '',
    t[chat.type],
  );
  const last = messages.data?.at(-1);
  const unread = unreadMessages(messages.data ?? [], user?.id ?? '').length;
  const date = new Date(last?.created_at ?? chat.created_at);
  return (
    <Link
      href={'/chats/' + chat.id}
      className={cn(styles.chatItem, active === chat.id && styles.selected)}
      aria-current={active === chat.id ? 'page' : undefined}
    >
      <Avatar name={name} />
      <div>
        <strong>{name}</strong>
        <p>
          {messages.isError
            ? t.previewUnavailable
            : messages.isPending
              ? t.loading
              : (last?.content ?? t.noMessages)}
        </p>
        <span>
          {Number.isFinite(date.getTime())
            ? new Intl.DateTimeFormat(locale, {
                month: 'short',
                day: 'numeric',
              }).format(date)
            : ''}
        </span>
      </div>
      {unread > 0 && (
        <span className={styles.unread} aria-label={t.unread + ': ' + unread}>
          {unread}
        </span>
      )}
    </Link>
  );
}
export function ChatList({
  active,
  onCreate,
}: {
  active?: string;
  onCreate: () => void;
}) {
  const query = useQuery(chatsOptions());
  const users = useQuery(usersOptions());
  const {
    messages: { messaging: t },
  } = useI18n();
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(12);
  const { user } = useAuth();
  const loaded = (query.data ?? []).slice(0, limit);
  const memberQueries = useQueries({
    queries: loaded.map((chat) => membersOptions(chat.id)),
  });
  const names = new Map(
    users.data?.map((person) => [person.id, person.username]),
  );
  const filtered = loaded.filter((chat, index) =>
    (
      chatDisplayName(
        chat,
        memberQueries[index]?.data ?? [],
        names,
        user?.id ?? '',
        t[chat.type],
      ) +
      ' ' +
      chat.id
    )
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <aside className={styles.chatList} aria-label={t.chats}>
      <header>
        <h2>{t.chats}</h2>
        <Button size="sm" onClick={onCreate}>
          {t.newChat}
        </Button>
      </header>
      <div className={styles.search}>
        <SearchInput
          label={t.searchChats}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search && <p className={styles.hint}>{t.searchHint}</p>}
      </div>
      <div className={styles.chatItems}>
        {query.isPending ? (
          <ChatLoading />
        ) : query.isError ? (
          <ChatError retry={() => void query.refetch()} />
        ) : !query.data.length ? (
          <EmptyState title={t.noChats} description={t.noChatsBody} />
        ) : filtered.length === 0 ? (
          <EmptyState title={t.noResults} description={t.searchHint} />
        ) : (
          filtered.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              active={active}
              names={names}
            />
          ))
        )}
        {query.data && query.data.length > limit && (
          <Button variant="ghost" onClick={() => setLimit(limit + 12)}>
            {t.moreChats}
          </Button>
        )}
      </div>
    </aside>
  );
}
