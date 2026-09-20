'use client';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { submitExercise } from './api';
import {
  buildExerciseSubmission,
  canSubmitText,
  exerciseCapabilities,
} from './exercise-adapter';
import type { Exercise, Lesson } from './contracts';

export function shouldCompleteLesson(
  index: number,
  total: number,
  correct: boolean,
) {
  return total > 0 && correct && index >= total - 1;
}

export function useLessonAttempt(
  lesson: Lesson,
  exercises: Exercise[],
  onFinish: () => void,
) {
  const queryClient = useQueryClient();
  const [items] = useState(() => [...exercises]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [finished, setFinished] = useState(false);
  const sending = useRef(false);
  const mutation = useMutation({
    mutationFn: ({
      exercise,
      draft,
    }: {
      exercise: Exercise;
      draft: string;
    }) => {
      const submission = buildExerciseSubmission(exercise, draft);
      return submitExercise(exercise.id, submission.answer);
    },
    retry: false,
    onSettled: () => {
      sending.current = false;
    },
  });
  const item = items[index];
  const correct = mutation.data?.correct === true;
  const completed = index + (correct ? 1 : 0);
  const dirty = !finished && (!!answer || index > 0 || mutation.isPending);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const advance = () => {
    if (!correct || finished) return;
    if (shouldCompleteLesson(index, items.length, correct)) {
      setFinished(true);
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.progress }),
        queryClient.invalidateQueries({ queryKey: ['xp'] }),
        queryClient.invalidateQueries({ queryKey: ['streak'] }),
        queryClient.invalidateQueries({ queryKey: ['lesson'] }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.lessons(lesson.course_id),
        }),
      ]);
      onFinish();
      return;
    }
    setIndex(index + 1);
    setAnswer('');
    mutation.reset();
  };
  const submit = () => {
    if (
      !item ||
      !canSubmitText(item, answer) ||
      mutation.isPending ||
      correct ||
      sending.current ||
      finished
    )
      return;
    sending.current = true;
    mutation.mutate({ exercise: item, draft: answer });
  };
  const changeAnswer = (value: string) => {
    if (mutation.isPending || correct || finished) return;
    setAnswer(value);
    if (mutation.data || mutation.isError) mutation.reset();
  };
  return {
    item,
    items,
    index,
    answer,
    finished,
    correct,
    completed,
    dirty,
    mutation,
    advance,
    submit,
    changeAnswer,
    supported: !!item && exerciseCapabilities[item.type].input === 'text',
    canSubmit:
      canSubmitText(item, answer) &&
      !mutation.isPending &&
      !correct &&
      !finished,
  };
}
