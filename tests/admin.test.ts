import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload, type Field } from '../src/features/admin/model';
const fields: Field[] = [
  { key: 'options', type: 'object', required: true },
  { key: 'correct_answer', type: 'json', required: true },
];
test('exercise editor preserves JSON answer types without inventing a contract', () => {
  for (const answer of ['word', ['a', 'b'], { a: 'b' }, 0, false, null])
    assert.deepEqual(
      buildPayload(
        fields,
        { options: '{}', correct_answer: JSON.stringify(answer) },
        false,
      ),
      { options: {}, correct_answer: answer },
    );
});
test('editing omits an unknown correct answer; creation requires it', () => {
  assert.deepEqual(
    buildPayload(fields, { options: '{}', correct_answer: '' }, true),
    { options: {} },
  );
  assert.throws(() =>
    buildPayload(fields, { options: '{}', correct_answer: '' }, false),
  );
  assert.throws(() =>
    buildPayload(fields, { options: '[]', correct_answer: '1' }, false),
  );
  assert.throws(() =>
    buildPayload(fields, { options: 'null', correct_answer: '1' }, false),
  );
});
test('admin numeric and boolean values preserve zero and false and reject invalid input', () => {
  const fields: Field[] = [
    { key: 'order', type: 'integer', required: true },
    { key: 'is_active', type: 'boolean', required: true },
  ];
  assert.deepEqual(
    buildPayload(fields, { order: '0', is_active: 'false' }, false),
    { order: 0, is_active: false },
  );
  for (const order of ['1.5', 'NaN', 'Infinity', ' '])
    assert.throws(() =>
      buildPayload(fields, { order, is_active: 'true' }, false),
    );
});
test('nullable achievement conditions can be cleared explicitly', () => {
  assert.deepEqual(
    buildPayload(
      [{ key: 'conditions', type: 'object', required: false }],
      { conditions: 'null' },
      true,
    ),
    { conditions: null },
  );
});
