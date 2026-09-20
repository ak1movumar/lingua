'use client';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/providers/i18n-provider';
import type { User } from '@/features/auth/contracts';
import { profileSchema, profileChanges, type ProfileValues } from './schemas';
import { useAccountUpdate } from './queries';
import { accountError } from './errors';
import styles from './account.module.scss';
export function EditProfile({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const {
    messages: { account: t, ui },
  } = useI18n();
  const [discard, setDiscard] = useState(false);
  const [original] = useState<ProfileValues>({
    username: user.username,
    email: user.email,
  });
  const lock = useRef(false);
  const mutation = useAccountUpdate();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema(t)),
    defaultValues: original,
  });
  const close = () => {
    if (mutation.isPending) return;
    if (form.formState.isDirty) setDiscard(true);
    else onClose();
  };
  return (
    <>
      <Modal
        open
        onClose={close}
        title={t.editProfile}
        description={t.editHint}
      >
        <form
          className={styles.form}
          noValidate
          onSubmit={(event) => {
            void form.handleSubmit((values) => {
              if (lock.current || mutation.isPending) return;
              const changes = profileChanges(original, values);
              if (!Object.keys(changes).length) {
                onClose();
                return;
              }
              lock.current = true;
              mutation.mutate(changes, {
                onSuccess: () => {
                  onSaved();
                  onClose();
                },
                onSettled: () => {
                  lock.current = false;
                },
              });
            })(event);
          }}
        >
          <Input
            label={t.username}
            autoComplete="username"
            disabled={mutation.isPending}
            error={form.formState.errors.username?.message}
            {...form.register('username')}
          />
          <Input
            label={t.email}
            type="email"
            autoComplete="email"
            disabled={mutation.isPending}
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />
          {mutation.isError && (
            <p role="alert" className={styles.error}>
              {accountError(mutation.error, t)}
            </p>
          )}
          <div className={styles.actions}>
            <Button
              type="submit"
              disabled={!form.formState.isDirty}
              loading={mutation.isPending}
            >
              {t.save}
            </Button>
            <Button
              variant="secondary"
              disabled={mutation.isPending}
              onClick={close}
            >
              {ui.cancel}
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={discard}
        onClose={() => setDiscard(false)}
        onConfirm={onClose}
        title={t.discardTitle}
        description={t.discardBody}
        confirmLabel={t.discard}
      />
    </>
  );
}
