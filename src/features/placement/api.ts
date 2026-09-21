import { api } from '@/services/api/client';
import {
  learningPathSchema,
  testStartSchema,
  testResultSchema,
  buildTestSubmission,
  type TestStart,
  type Level,
} from './contracts';

export async function getLearningPath(language: number, signal?: AbortSignal) {
  const result = learningPathSchema.parse(
    (await api.get('/learning-path/' + language, { signal })).data,
  );
  if (result.language_id !== language)
    throw new Error('Language identity mismatch');
  return result;
}
export async function startTest(language: number, level?: Level) {
  const path = level
    ? '/level-tests/completion/' + language + '/' + level + '/start'
    : '/level-tests/placement/' + language + '/start';
  const result = testStartSchema.parse((await api.post(path)).data);
  if (
    result.is_placement !== !level ||
    (level && result.target_level !== level) ||
    result.questions.some((question) => question.test_id !== result.test_id)
  )
    throw new Error('Test identity mismatch');
  return result;
}
export async function submitTest(
  attempt: TestStart,
  answers: Record<number, unknown>,
) {
  const result = testResultSchema.parse(
    (
      await api.post(
        '/level-tests/attempts/' + attempt.attempt_id + '/submit',
        buildTestSubmission(attempt, answers),
      )
    ).data,
  );
  if (result.attempt_id !== attempt.attempt_id)
    throw new Error('Attempt identity mismatch');
  return result;
}
