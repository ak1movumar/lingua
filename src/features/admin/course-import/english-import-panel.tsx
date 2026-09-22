'use client';
import { useRef, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import { BookOpen, ClipboardCheck, Languages } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-provider';
import { sessionStore } from '@/features/auth/session';
import { api } from '@/services/api/client';
import { env } from '@/lib/env';
import { Card, PageHeader, Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { importEnglish } from './english-import';
import { beginnerCourse } from './beginner-course';
import { elementaryCourse } from './elementary-course';
import styles from '../admin.module.scss';
const row = z.object({ id: z.union([z.number(), z.string()]) }).passthrough();
export function EnglishImportPanel() {
  const { user } = useAuth();
  const client = useQueryClient();
  const running = useRef(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof importEnglish>
  > | null>(null);
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);
  async function start() {
    if (running.current || user?.role !== 'admin') return;
    running.current = true;
    setBusy(true);
    setError('');
    const generation = sessionStore.getSnapshot().generation;
    const check = () => {
      if (sessionStore.getSnapshot().generation !== generation)
        throw Error('Сессия изменилась');
    };
    try {
      if (!navigator.locks)
        throw Error('Браузер не поддерживает блокировку импорта');
      await navigator.locks.request(
        'lingora-english-import',
        { ifAvailable: true },
        async (lock) => {
          if (!lock) throw Error('Импорт уже запущен в другой вкладке');
          const key =
            'lingora-english-import:v2:' +
            env.NEXT_PUBLIC_API_URL +
            ':' +
            user.id;
          const data = await importEnglish(
            {
              list: async (path) =>
                z.array(row).parse((await api.get(path)).data),
              create: async (path, body) =>
                row.parse((await api.post(path, body)).data),
              update: async (path, body) => (await api.put(path, body)).data,
            },
            {
              read: () => localStorage.getItem(key),
              write: (value) => localStorage.setItem(key, value),
              clear: () => localStorage.removeItem(key),
            },
            setStatus,
            check,
          );
          check();
          setResult(data);
          await client.invalidateQueries();
        },
      );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const detail =
          typeof e.response?.data === 'object' && e.response.data !== null
            ? 'detail' in e.response.data
              ? String(e.response.data.detail)
              : JSON.stringify(e.response.data)
            : String(e.response?.data ?? e.message);
        setError(`API ${e.response?.status ?? 'error'}: ${detail}`);
      } else {
        setError(
          e instanceof Error ? e.message : 'Не удалось завершить импорт',
        );
      }
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Lingora Studio"
        title="Английский A1–A2"
        description="Два последовательных курса с объяснениями на русском, практикой и проверкой уровня."
      />
      <div className={styles.grid}>
        <Card className={styles.item}>
          <Languages />
          <h2>1 язык · 2 курса</h2>
          <p>Английский от первых слов до повседневного общения.</p>
        </Card>
        <Card className={styles.item}>
          <BookOpen />
          <h2>24 урока · 192 упражнения</h2>
          <p>Перевод и заполнение пропусков с однозначными ответами.</p>
        </Card>
        <Card className={styles.item}>
          <ClipboardCheck />
          <h2>3 теста · 72 вопроса</h2>
          <p>Входной A1–A2 и итоговые A1 и A2. Проходной балл — 70%.</p>
        </Card>
      </div>
      <div className={styles.grid}>
        {[beginnerCourse, elementaryCourse].map((seed) => (
          <Card className={styles.item} key={seed.level}>
            <Badge tone="primary">{seed.level}</Badge>
            <h2>{seed.level === 'A1' ? 'First Steps' : 'Everyday English'}</h2>
            <ol>
              {seed.lessons.map((unit) => (
                <li key={unit.title}>{unit.title.replace(/^\d+ · /, '')}</li>
              ))}
            </ol>
          </Card>
        ))}
      </div>
      <Card className={styles.item}>
        <p>
          Добавление сохранит материалы на сервере. Повторный запуск продолжит
          незавершённую загрузку без дубликатов. Существующие материалы не
          удаляются.
        </p>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {busy && <p role="status">Добавление: {status}</p>}
        {result ? (
          <>
            <p role="status">
              Готово: 2 курса, 24 урока, 192 упражнения и 3 теста.
            </p>
            <div className={styles.actions}>
              {result.courseIds.map((id, i) => (
                <LinkButton key={id} href={'/courses/' + id}>
                  Открыть {i === 0 ? 'A1' : 'A2'}
                </LinkButton>
              ))}
            </div>
          </>
        ) : (
          <Button
            loading={busy}
            disabled={user?.role !== 'admin'}
            onClick={() => void start()}
          >
            Добавить английский A1–A2
          </Button>
        )}
      </Card>
    </div>
  );
}
