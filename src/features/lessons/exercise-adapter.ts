import type { components } from '@/types/api.generated';
import type { Exercise } from './contracts';

type Capability =
  | { input: 'text'; contract: 'unverified-text-value' }
  | { input: 'unavailable'; contract: 'missing-options-and-answer' };
/** Backend enum coverage is explicit. No guessed option keys or answer encodings. */
export const exerciseCapabilities = {
  translate: { input: 'text', contract: 'unverified-text-value' },
  fill_gap: { input: 'text', contract: 'unverified-text-value' },
  choice: { input: 'unavailable', contract: 'missing-options-and-answer' },
  match: { input: 'unavailable', contract: 'missing-options-and-answer' },
} as const satisfies Record<Exercise['type'], Capability>;

export class UnsupportedExerciseContractError extends Error {
  constructor(type: Exercise['type']) {
    super('Unspecified exercise contract: ' + type);
    this.name = 'UnsupportedExerciseContractError';
  }
}
export function canSubmitText(exercise: Exercise | undefined, answer: string) {
  return (
    !!exercise &&
    exerciseCapabilities[exercise.type].input === 'text' &&
    answer.trim().length > 0
  );
}
export function buildExerciseSubmission(
  exercise: Exercise,
  answer: string,
): components['schemas']['ExerciseSubmit'] {
  if (exerciseCapabilities[exercise.type].input !== 'text')
    throw new UnsupportedExerciseContractError(exercise.type);
  if (!answer.trim()) throw new Error('Empty text answer');
  // Do not trim, lowercase, tokenize or infer values from options: backend owns grading.
  return { answer };
}
