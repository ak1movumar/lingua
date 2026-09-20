'use client';
import { Textarea } from '@/components/ui/field';
import { useI18n } from '@/providers/i18n-provider';
export function TextExercise({
  answer,
  onChange,
  disabled,
}: {
  answer: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const {
    messages: { learning: t },
  } = useI18n();
  return (
    <Textarea
      label={t.answer}
      placeholder={t.answerPlaceholder}
      value={answer}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      autoComplete="off"
      spellCheck={false}
      rows={3}
    />
  );
}
