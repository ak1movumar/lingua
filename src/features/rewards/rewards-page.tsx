'use client';
import { useRewards, type RewardsSection } from './use-rewards';
import { LearningShell } from '@/features/learning/learning-shell';
import { useI18n } from '@/providers/i18n-provider';
import { Trophy, Medal, Flame, LockKeyhole } from 'lucide-react';
import { Card, Badge, Avatar, PageHeader } from '@/components/ui/surface';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { LearningSkeleton } from '@/features/learning/data-state';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/field';
import { ConfirmDialog } from '@/components/ui/modal';
import { labels } from '@/i18n/management';
import styles from './rewards.module.scss';
export function RewardsPage({ section }: { section: RewardsSection }) {
  const {
    locale,
    messages: { learning },
  } = useI18n();
  const t = labels[locale];
  const {
    user,
    limit,
    setLimit,
    selected,
    setSelected,
    awardId,
    setAwardId,
    refreshConfirm,
    setRefreshConfirm,
    catalog,
    earned,
    today,
    rank,
    users,
    mutation,
  } = useRewards(section);
  return (
    <LearningShell active="progress">
      <div className={styles.page}>
        <PageHeader
          eyebrow={t.overview}
          title={t[section]}
          description={learning.progressHint}
          action={
            <span className={styles.heroIcon}>
              {section === 'leaderboard' ? (
                <Trophy />
              ) : section === 'challenges' ? (
                <Flame />
              ) : (
                <Medal />
              )}
            </span>
          }
        />
        {section === 'challenges' && (
          <Card className={styles.spotlight}>
            <span className={styles.medallion}>
              <Flame size={32} />
            </span>
            <h2>{t.today}</h2>
            {today.isPending ? (
              <LearningSkeleton />
            ) : today.isError ? (
              <>
                <p role="alert">{t.error}</p>
                <Button onClick={() => void today.refetch()}>{t.retry}</Button>
              </>
            ) : today.data ? (
              <>
                <h3>{today.data.title}</h3>
                <p>{today.data.description}</p>
                <Badge>{today.data.xp_reward} XP</Badge>
              </>
            ) : (
              <p>{t.noToday}</p>
            )}
          </Card>
        )}
        {section === 'leaderboard' && (
          <>
            <Card className={styles.rankSummary}>
              <Trophy size={32} />
              <p>
                {t.rank}:{' '}
                {rank.isPending
                  ? t.loading
                  : rank.isError
                    ? t.error
                    : (rank.data?.rank ?? '—')}{' '}
                · {rank.data?.xp ?? '—'} XP
              </p>
            </Card>
            <Select
              label={t.leaderboard}
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
            {user?.role === 'admin' && (
              <Button
                onClick={() => {
                  mutation.reset();
                  setRefreshConfirm(true);
                }}
              >
                {t.refresh}
              </Button>
            )}
          </>
        )}
        {section === 'achievements' && earned.isError && (
          <p role="alert">{t.error}</p>
        )}
        {user?.role === 'admin' && section === 'achievements' && (
          <Select
            label={t.user}
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            <option value="">{users.isError ? t.error : t.choose}</option>
            {users.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.username}
              </option>
            ))}
          </Select>
        )}
        {catalog.isPending ? (
          <p role="status">{t.loading}</p>
        ) : catalog.isError ? (
          <ErrorState
            title={t.error}
            description={t[section]}
            retryLabel={t.retry}
            onRetry={() => void catalog.refetch()}
          />
        ) : !catalog.data.length ? (
          <EmptyState title={t.empty} description={t[section]} />
        ) : (
          <div
            className={section === 'leaderboard' ? styles.ranking : styles.grid}
          >
            {catalog.data.map((item) =>
              'title' in item ? (
                <Card
                  key={item.id}
                  className={styles.item}
                  data-earned={
                    section === 'achievements' && earned.isSuccess
                      ? earned.data.some(
                          (record) =>
                            record.user_id === user?.id &&
                            record.achievement_id === item.id,
                        )
                      : undefined
                  }
                >
                  <span className={styles.medallion}>
                    {section === 'challenges' ? (
                      <Flame size={32} />
                    ) : earned.data?.some(
                        (record) =>
                          record.user_id === user?.id &&
                          record.achievement_id === item.id,
                      ) ? (
                      <Medal size={32} />
                    ) : (
                      <LockKeyhole size={28} />
                    )}
                  </span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <Badge>{item.xp_reward} XP</Badge>
                  {item.challenge_date && (
                    <time dateTime={item.challenge_date}>
                      {item.challenge_date}
                    </time>
                  )}
                  {section === 'achievements' && earned.isSuccess && (
                    <Badge>
                      {earned.data.some(
                        (record) =>
                          record.user_id === user?.id &&
                          record.achievement_id === item.id,
                      )
                        ? t.earned
                        : t.locked}
                    </Badge>
                  )}
                  {section === 'achievements' && user?.role === 'admin' && (
                    <Button
                      disabled={!selected}
                      onClick={() => {
                        mutation.reset();
                        setAwardId(item.id);
                      }}
                    >
                      {t.award}
                    </Button>
                  )}
                </Card>
              ) : (
                <Card
                  key={item.user_id}
                  className={styles.rankRow}
                  data-self={item.user_id === user?.id}
                >
                  <span
                    className={styles.position}
                    data-podium={item.rank != null && item.rank <= 3}
                  >
                    #{item.rank ?? '—'}
                  </span>
                  <Avatar name={item.user?.username ?? item.user_id} />
                  <h2>{item.user?.username ?? item.user_id}</h2>
                  <Badge tone="primary">{item.xp} XP</Badge>
                </Card>
              ),
            )}
          </div>
        )}
        <ConfirmDialog
          open={awardId !== null || refreshConfirm}
          title={t.confirm}
          description={
            refreshConfirm
              ? t.refresh
              : t.award +
                ': ' +
                (users.data?.find((item) => item.id === selected)?.username ??
                  selected) +
                ' · #' +
                awardId
          }
          confirmLabel={refreshConfirm ? t.refresh : t.award}
          onClose={() => {
            setAwardId(null);
            setRefreshConfirm(false);
          }}
          onConfirm={() => {
            if (!mutation.isPending) mutation.mutate();
          }}
          loading={mutation.isPending}
          error={mutation.isError ? t.error : undefined}
        />
      </div>
    </LearningShell>
  );
}
