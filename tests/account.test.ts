import test from 'node:test';
import assert from 'node:assert/strict';
import {
  profileChanges,
  passwordChanges,
  profileSchema,
  passwordSchema,
} from '../src/features/account/schemas';
import { accountError } from '../src/features/account/errors';
import { safeAuthRedirect } from '../src/features/auth/redirect';
import { ru } from '../src/i18n/messages/ru';
const original = { username: 'Айгүл', email: 'learner@example.com' };
test('profile changes contain only modified account fields and never a password', () => {
  assert.deepEqual(profileChanges(original, original), {});
  assert.deepEqual(
    profileChanges(original, { ...original, username: 'Aigul' }),
    { username: 'Aigul' },
  );
  assert.deepEqual(
    profileChanges(original, { ...original, email: 'new@example.com' }),
    { email: 'new@example.com' },
  );
  assert.deepEqual(original, {
    username: 'Айгүл',
    email: 'learner@example.com',
  });
});
test('profile form validates email and rejects an unusable blank username', () => {
  assert.equal(profileSchema(ru.account).safeParse(original).success, true);
  assert.equal(
    profileSchema(ru.account).safeParse({ ...original, email: 'invalid' })
      .success,
    false,
  );
  assert.equal(
    profileSchema(ru.account).safeParse({ ...original, username: ' \n ' })
      .success,
    false,
  );
});
test('password confirmation stays local and exact password bytes are preserved', () => {
  const input = { password: '  AbЯ!  ', confirmation: '  AbЯ!  ' };
  assert.deepEqual(passwordChanges(passwordSchema(ru.account).parse(input)), {
    password: '  AbЯ!  ',
  });
});
test('password update validates confirmation without inventing backend length rules', () => {
  assert.equal(
    passwordSchema(ru.account).safeParse({ password: 'a', confirmation: 'a' })
      .success,
    true,
  );
  assert.equal(
    passwordSchema(ru.account).safeParse({ password: '', confirmation: '' })
      .success,
    false,
  );
  assert.equal(
    passwordSchema(ru.account).safeParse({
      password: 'Secret',
      confirmation: 'secret',
    }).success,
    false,
  );
});
test('account errors distinguish conflict, network and validation without exposing raw server data', () => {
  const error = (status: number) => ({
    isAxiosError: true,
    response: { status, data: 'sensitive server details' },
  });
  assert.equal(accountError(error(409), ru.account), ru.account.conflictError);
  assert.equal(
    accountError(error(422), ru.account),
    ru.account.validationError,
  );
  assert.equal(accountError(error(403), ru.account), ru.account.accessError);
  assert.equal(
    accountError({ isAxiosError: true }, ru.account),
    ru.account.networkError,
  );
});
test('account destinations survive sign-in without allowing nested administrative routes', () => {
  for (const path of ['/profile', '/settings', '/settings#security'])
    assert.equal(safeAuthRedirect(path), path);
  for (const path of ['/profile/delete', '/settings/../admin', '//settings'])
    assert.equal(safeAuthRedirect(path), '/dashboard');
});
