'use client';
import { useAuth } from '@/features/auth/auth-provider';
import { useI18n } from '@/providers/i18n-provider';
import { labels } from '@/i18n/management';
import { Button } from '@/components/ui/button';
import styles from '@/components/ui/collection.module.scss';
import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api/client';
import { sessionStore } from '@/features/auth/session';
import { Input, Select, Textarea } from '@/components/ui/field';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import {
  resources,
  resourcePath,
  resourceItemPath,
  getResourceRows,
  type Resource,
} from './resources';
import fieldsData from './fields.json';
import { buildPayload, type Field, type Row } from './model';
export function ResourceEditor({
  resource,
  parentTest,
  row,
  onClose,
}: {
  resource: Resource;
  parentTest?: string;
  row: Row | 'new';
  onClose: () => void;
}) {
  const { locale } = useI18n();
  const t = labels[locale];
  const { user } = useAuth();
  const client = useQueryClient();
  const lock = useRef(false);
  const schemaName =
    resource === 'level-tests' && row !== 'new'
      ? 'LevelTestUpdate'
      : resources[resource];
  const fields: Field[] = schemaName
    ? fieldsData[schemaName]
    : [
        {
          key: 'role',
          type: 'string',
          required: true,
          choices: ['user', 'admin'],
        },
        { key: 'is_active', type: 'boolean', required: true },
      ];
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => {
        const value = row === 'new' ? field.initial : row[field.key];
        return [
          field.key,
          value === undefined ||
          (value === null && !['json', 'object'].includes(field.type))
            ? ''
            : field.type === 'json' || typeof value === 'object'
              ? JSON.stringify(value, null, 2)
              : String(value),
        ];
      }),
    ),
  );
  const [invalid, setInvalid] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [dirty, setDirty] = useState(false);
  const parent: Resource | null =
    resource === 'courses' || resource === 'level-tests'
      ? 'languages'
      : resource === 'lessons'
        ? 'courses'
        : resource === 'exercises'
          ? 'lessons'
          : null;
  const parents = useQuery({
    queryKey: ['admin', parent, user?.id],
    queryFn: ({ signal }) => getResourceRows(parent!, signal),
    enabled: !!parent,
  });
  const mutation = useMutation({
    retry: false,
    mutationFn: async (payload: Record<string, unknown>) => {
      const generation = sessionStore.getSnapshot().generation;
      if (resource === 'users' && row !== 'new') {
        if (payload.role !== row.role)
          await api.patch('/users/' + row.id + '/role', { role: payload.role });
        if (generation !== sessionStore.getSnapshot().generation)
          throw new Error('Session changed');
        if (payload.is_active !== row.is_active)
          await api.patch('/users/' + row.id + '/active', {
            is_active: payload.is_active,
          });
      } else if (row === 'new')
        await api.post(resourcePath(resource, parentTest), payload);
      else await api.put(resourceItemPath(resource, row.id), payload);
      return generation;
    },
    onSuccess: async (generation) => {
      if (generation !== sessionStore.getSnapshot().generation) return;
      onClose();
      await client.invalidateQueries();
    },
    onSettled: () => {
      lock.current = false;
    },
  });
  return (
    <>
      <Modal
        open
        title={row === 'new' ? t.create : t.edit}
        onClose={() => {
          if (!mutation.isPending) {
            if (dirty) setDiscard(true);
            else onClose();
          }
        }}
      >
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (lock.current) return;
            setInvalid(false);
            try {
              const payload = buildPayload(fields, values, row !== 'new');
              if (resource === 'level-tests') {
                if (
                  payload.passing_score !== undefined &&
                  (Number(payload.passing_score) < 1 ||
                    Number(payload.passing_score) > 100)
                )
                  throw new Error('Invalid passing score');
                if (
                  row === 'new' &&
                  payload.is_placement === false &&
                  !payload.target_level
                )
                  throw new Error('Target level required');
                if (row === 'new' && payload.is_placement === true)
                  payload.target_level = null;
                if (row !== 'new' && !values.target_level)
                  payload.target_level = null;
              }
              if (
                resource === 'test-questions' &&
                payload.order !== undefined &&
                Number(payload.order) < 1
              )
                throw new Error('Invalid order');
              lock.current = true;
              mutation.mutate(payload);
            } catch {
              setInvalid(true);
            }
          }}
        >
          {(resource === 'exercises' || resource === 'test-questions') && (
            <p className={styles.muted}>{t.jsonHint}</p>
          )}
          {fields.map((field) => {
            const label = t[field.key as keyof typeof t] ?? field.key;
            const common = {
              label,
              value: values[field.key] ?? '',
              disabled:
                mutation.isPending ||
                (resource === 'users' && row !== 'new' && row.id === user?.id),
              required:
                (field.required ||
                  (resource === 'test-questions' &&
                    field.key === 'question')) &&
                !(row !== 'new' && field.key === 'correct_answer'),
              onChange: (
                event: React.ChangeEvent<
                  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                >,
              ) => {
                setDirty(true);
                setValues({ ...values, [field.key]: event.target.value });
              },
            };
            if (field.key.endsWith('_id') && parent)
              return (
                <Select key={field.key} {...common}>
                  <option value="">
                    {parents.isError
                      ? t.error
                      : parents.isPending
                        ? t.loading
                        : t.choose}
                  </option>
                  {parents.data?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {String(item.name ?? item.title ?? item.id)} (#{item.id})
                    </option>
                  ))}
                </Select>
              );
            if (field.choices || field.type === 'boolean')
              return (
                <Select key={field.key} {...common}>
                  <option value="">{t.choose}</option>
                  {(field.choices ?? ['true', 'false']).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              );
            if (
              ['object', 'json'].includes(field.type) ||
              ['description', 'question'].includes(field.key)
            )
              return <Textarea key={field.key} {...common} rows={5} />;
            return (
              <Input
                key={field.key}
                {...common}
                type={
                  field.type === 'integer'
                    ? 'number'
                    : field.format === 'date'
                      ? 'date'
                      : 'text'
                }
                step={field.type === 'integer' ? 1 : undefined}
              />
            );
          })}
          {(invalid || mutation.isError) && (
            <p role="alert" className={styles.error}>
              {invalid ? t.invalid : t.error}
            </p>
          )}
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={
              resource === 'users' && row !== 'new' && row.id === user?.id
            }
          >
            {t.save}
          </Button>
        </form>
      </Modal>
      <ConfirmDialog
        open={discard}
        title={t.confirm}
        description={t.cancel}
        confirmLabel={t.cancel}
        onClose={() => setDiscard(false)}
        onConfirm={onClose}
      />
    </>
  );
}
