import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildExerciseSubmission,
  canSubmitText,
  exerciseCapabilities,
  UnsupportedExerciseContractError,
} from '../src/features/lessons/exercise-adapter';
import {
  exerciseSchema,
  exerciseResultSchema,
  type Exercise,
} from '../src/features/lessons/contracts';

const exercise = (type: Exercise['type']): Exercise => ({
  id: 1,
  lesson_id: 1,
  question: 'Contract fixture',
  options: {},
  type,
});

test('capabilities cover exactly the backend exercise enum', () => {
  assert.deepEqual(
    Object.keys(exerciseCapabilities).sort(),
    [...exerciseSchema.shape.type.options].sort(),
  );
});
for (const type of ['choice', 'match'] as const) {
  test(`${type} cannot be submitted using an invented text encoding`, () => {
    assert.equal(canSubmitText(exercise(type), 'answer'), false);
    assert.throws(
      () => buildExerciseSubmission(exercise(type), 'answer'),
      UnsupportedExerciseContractError,
    );
  });
}
for (const type of ['translate', 'fill_gap'] as const) {
  test(`${type} preserves user input for backend grading`, () => {
    assert.deepEqual(buildExerciseSubmission(exercise(type), '  Салам!  '), {
      answer: '  Салам!  ',
    });
    assert.equal(canSubmitText(exercise(type), ' \n '), false);
    assert.throws(() => buildExerciseSubmission(exercise(type), ' \n '));
  });
}
test('missing exercise cannot be submitted', () => {
  assert.equal(canSubmitText(undefined, 'answer'), false);
});
test('runtime contract rejects unsupported exercise types and non-object options', () => {
  for (const type of ['text', 'listening', 'speaking'])
    assert.equal(
      exerciseSchema.safeParse({ ...exercise('translate'), type }).success,
      false,
    );
  assert.equal(
    exerciseSchema.safeParse({ ...exercise('choice'), options: [] }).success,
    false,
  );
});
test('grading requires real boolean correctness and integer score', () => {
  assert.equal(
    exerciseResultSchema.safeParse({ correct: 'true', score: 1 }).success,
    false,
  );
  assert.equal(
    exerciseResultSchema.safeParse({ correct: true, score: 1.5 }).success,
    false,
  );
  assert.deepEqual(exerciseResultSchema.parse({ correct: false, score: 0 }), {
    correct: false,
    score: 0,
  });
});
