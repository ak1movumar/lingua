'use client';
import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useI18n } from '@/providers/i18n-provider';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/field';
import { languagesOptions } from '@/features/learning/queries';
import { queryKeys } from '@/constants/query-keys';
import { createChat } from './api';
import { MemberManager } from './member-manager';
import type { Chat } from './contracts';
import styles from './chat.module.scss';
const schema = z.object({
  type: z.enum(['private', 'group']),
  language: z.string(),
});
export function CreateChat({
  onClose,
  initialUser,
}: {
  onClose: () => void;
  initialUser?: string;
}) {
  const {
    messages: { messaging: t },
  } = useI18n();
  const router = useRouter();
  const languages = useQuery(languagesOptions());
  const [created, setCreated] = useState<Chat | null>(null);
  const lock = useRef(false);
  const client = useQueryClient();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'private', language: '' },
  });
  const mutation = useMutation({
    retry: false,
    mutationFn: createChat,
    onSuccess: (chat) => {
      setCreated(chat);
      client.setQueryData(queryKeys.chat(chat.id), chat);
    },
    onSettled: () => {
      lock.current = false;
      void client.invalidateQueries({ queryKey: queryKeys.chats });
    },
  });
  return (
    <Modal
      open
      onClose={() => {
        if (!mutation.isPending) onClose();
      }}
      title={created ? t.addPeople : t.newChat}
      description={created ? t.createdHint : t.createHint}
    >
      {created ? (
        <>
          <MemberManager chat={created.id} initialUser={initialUser} />
          <Button
            onClick={() => {
              onClose();
              router.push('/chats/' + created.id);
            }}
          >
            {t.openChat}
          </Button>
        </>
      ) : (
        <form
          className={styles.memberForm}
          onSubmit={(event) => {
            void form.handleSubmit((values) => {
              if (lock.current || mutation.isPending || mutation.isError)
                return;
              const language = values.language
                ? languages.data?.find(
                    (item) => String(item.id) === values.language,
                  )?.id
                : null;
              if (values.language && language === undefined) return;
              lock.current = true;
              mutation.mutate({
                type: values.type,
                language_id: language ?? null,
              });
            })(event);
          }}
        >
          <Select
            label={t.chatType}
            {...form.register('type')}
            disabled={mutation.isPending}
          >
            <option value="private">{t.private}</option>
            <option value="group">{t.group}</option>
          </Select>
          <Select
            label={t.language}
            {...form.register('language')}
            disabled={!languages.isSuccess || mutation.isPending}
          >
            <option value="">{t.noLanguage}</option>
            {languages.data?.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </Select>
          {languages.isError && (
            <p className={styles.hint}>{t.languageUnavailable}</p>
          )}
          {mutation.isError && (
            <p className={styles.error} role="alert">
              {t.createError}
            </p>
          )}
          <Button
            type="submit"
            disabled={mutation.isError}
            loading={mutation.isPending}
          >
            {t.create}
          </Button>
        </form>
      )}
    </Modal>
  );
}
