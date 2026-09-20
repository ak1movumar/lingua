'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { MessageCircle } from 'lucide-react';
import { LearningShell } from '@/features/learning/learning-shell';
import { useI18n } from '@/providers/i18n-provider';
import { cn } from '@/lib/cn';
import { ChatList } from './chat-list';
import { Conversation } from './conversation';
import { CreateChat } from './create-chat';
import styles from './chat.module.scss';
import { useMediaQuery } from '@/hooks/use-media-query';
import { acquireScrollLock } from '@/lib/scroll-lock';
export function ChatsPage({ id }: { id?: string }) {
  const compact = useMediaQuery('(max-width: 48rem)');
  useEffect(() => {
    if (id && compact) return acquireScrollLock(document.body);
  }, [id, compact]);
  const params = useSearchParams();
  const candidate = params.get('to');
  const target = z.uuid().safeParse(candidate).success
    ? (candidate ?? undefined)
    : undefined;
  const [create, setCreate] = useState(!!target);
  const {
    messages: { messaging: t },
  } = useI18n();
  return (
    <LearningShell active="chats">
      <div className={cn(styles.messenger, id && styles.activeConversation)}>
        {(!id || !compact) && (
          <ChatList active={id} onCreate={() => setCreate(true)} />
        )}
        {id ? (
          <Conversation key={id} id={id} />
        ) : (
          <section className={styles.welcome}>
            <MessageCircle size={56} aria-hidden="true" />
            <h1>{t.welcome}</h1>
            <p>{t.welcomeBody}</p>
          </section>
        )}
      </div>
      {create && (
        <CreateChat onClose={() => setCreate(false)} initialUser={target} />
      )}
    </LearningShell>
  );
}
