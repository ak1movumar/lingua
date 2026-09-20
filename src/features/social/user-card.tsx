'use client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Avatar, Card } from '@/components/ui/surface';
import { useI18n } from '@/providers/i18n-provider';
import type { Friend } from './contracts';
import { FriendActions } from './friend-actions';
import styles from './social.module.scss';
export function UserCard({ user }: { user: Friend }) {
  const {
    messages: { social: t },
  } = useI18n();
  return (
    <Card className={styles.person}>
      <Link className={styles.identity} href={'/users/' + user.id}>
        <Avatar name={user.username} size="lg" />
        <div>
          <h2>{user.username}</h2>
          <span>
            {t.viewProfile} <ArrowUpRight size={14} />
          </span>
        </div>
      </Link>
      <FriendActions id={user.id} />
    </Card>
  );
}
