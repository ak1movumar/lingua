'use client';
import { messages as copy } from '@/i18n/course-import';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/services/api/client';
import { useAuth } from '@/features/auth/auth-provider';
import { sessionStore } from '@/features/auth/session';
import { useI18n } from '@/providers/i18n-provider';
import { Button } from '@/components/ui/button';
import { Card, PageHeader, ProgressBar } from '@/components/ui/surface';
import { LinkButton } from '@/components/ui/link-button';
import { beginnerCourse } from './beginner-course';
import { importBeginnerCourse } from './import-beginner-course';
import styles from '@/components/ui/collection.module.scss';
const lessonSchema = z.object({
  id: z.number().int(),
  course_id: z.number().int(),
  title: z.string(),
  order: z.number().int(),
});
const exerciseSchema = z.object({
  id: z.number().int(),
  lesson_id: z.number().int(),
  type: z.string(),
  question: z.string(),
  options: z.record(z.string(), z.unknown()),
});
export function BeginnerImportPanel() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const t = copy[locale];
  const client = useQueryClient();
  const lock = useRef(false);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!running) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [running]);
  const start = async () => {
    if (lock.current || user?.role !== 'admin') return;
    lock.current = true;
    setRunning(true);
    setError('');
    setDone(false);
    setCompleted(0);
    const generation = sessionStore.getSnapshot().generation;
    const assertSession = () => {
      if (sessionStore.getSnapshot().generation !== generation)
        throw new Error('SESSION_CHANGED');
    };
    const run = async () => {
      const key = 'lingua-beginner-import-v1:' + user.id + ':1';
      const storage = window.localStorage;
      await importBeginnerCourse(
        {
          course: async () =>
            z
              .object({
                id: z.number().int(),
                title: z.string(),
                language_id: z.number().int(),
                level: z.string(),
              })
              .parse((await api.get('/courses/1')).data),
          lessons: async () =>
            z
              .array(lessonSchema)
              .parse((await api.get('/lessons/course/1')).data),
          exercises: async (id) =>
            z
              .array(exerciseSchema)
              .parse((await api.get('/exercises/lesson/' + id)).data),
          createLesson: async (body) =>
            lessonSchema.parse((await api.post('/lessons', body)).data),
          createExercise: async (body) =>
            exerciseSchema.parse((await api.post('/exercises', body)).data),
        },
        {
          read: () => storage.getItem(key),
          write: (value) => storage.setItem(key, value),
          clear: () => storage.removeItem(key),
        },
        setCompleted,
        assertSession,
      );
      assertSession();
      setDone(true);
    };
    try {
      if (!navigator.locks) throw new Error('LOCK_UNAVAILABLE');
      await navigator.locks.request(
        'lingua-beginner-course-1',
        { ifAvailable: true },
        async (acquired) => {
          if (!acquired) throw new Error('BUSY');
          await run();
        },
      );
    } catch (reason) {
      if (generation === sessionStore.getSnapshot().generation)
        setError(
          reason instanceof Error && reason.message === 'UNCERTAIN_WRITE'
            ? t.uncertain
            : reason instanceof Error &&
                ['COURSE_MISMATCH', 'DUPLICATE'].includes(reason.message)
              ? t.mismatch
              : reason instanceof Error && reason.message === 'BUSY'
                ? t.busy
                : t.error,
        );
    } finally {
      lock.current = false;
      setRunning(false);
      if (generation === sessionStore.getSnapshot().generation)
        await client.invalidateQueries();
    }
  };
  return (
    <Card className={styles.item}>
      <PageHeader
        eyebrow="Lingora"
        title={t.title}
        description={t.description}
      />
      <details>
        <summary>12 · A1</summary>
        <ol>
          {beginnerCourse.lessons.map((item) => (
            <li key={item.title}>{item.title}</li>
          ))}
        </ol>
      </details>
      {user?.role === 'admin' ? (
        <Button loading={running} disabled={done} onClick={() => void start()}>
          {t.start}
        </Button>
      ) : (
        <p>{t.forbidden}</p>
      )}
      {(running || completed > 0) && (
        <>
          <ProgressBar value={(completed / 96) * 100} label={t.title} />
          <p role="status">
            {completed}/96 {running ? t.running : ''}
          </p>
        </>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {done && <p role="status">{t.done}</p>}
      <LinkButton href="/courses/1" variant="secondary">
        {t.open}
      </LinkButton>
    </Card>
  );
}
