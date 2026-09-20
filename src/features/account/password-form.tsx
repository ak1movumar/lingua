'use client';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIsMutating } from '@tanstack/react-query';
import { PasswordInput } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/providers/i18n-provider';
import { useAccountUpdate } from './queries';
import {
  passwordSchema,
  passwordChanges,
  type PasswordValues,
} from './schemas';
import { accountError } from './errors';
import styles from './account.module.scss';
export function PasswordForm() {
  const {
    messages: { account: t },
  } = useI18n();
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema(t)),
    defaultValues: { password: '', confirmation: '' },
  });
  const mutation = useAccountUpdate();
  const deleting = useIsMutating({ mutationKey: ['accountDelete'] }) > 0;
  const lock = useRef(false);
  const [saved, setSaved] = useState(false);
  return (
    <form
      className={styles.form}
      noValidate
      onChange={() => setSaved(false)}
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          if (lock.current || mutation.isPending || deleting) return;
          lock.current = true;
          setSaved(false);
          mutation.mutate(passwordChanges(values), {
            onSuccess: () => {
              form.reset();
              setSaved(true);
              mutation.reset();
            },
            onSettled: () => {
              lock.current = false;
            },
          });
        })(event);
      }}
    >
      <PasswordInput
        label={t.newPassword}
        autoComplete="new-password"
        disabled={mutation.isPending || deleting}
        error={form.formState.errors.password?.message}
        {...form.register('password')}
      />
      <PasswordInput
        label={t.confirmPassword}
        autoComplete="new-password"
        disabled={mutation.isPending || deleting}
        error={form.formState.errors.confirmation?.message}
        {...form.register('confirmation')}
      />
      {mutation.isError && (
        <p role="alert" className={styles.error}>
          {accountError(mutation.error, t)}
        </p>
      )}
      {saved && (
        <p role="status" className={styles.success}>
          {t.passwordSaved}
        </p>
      )}
      <Button
        type="submit"
        loading={mutation.isPending}
        disabled={!form.formState.isDirty || deleting}
      >
        {t.changePassword}
      </Button>
    </form>
  );
}
