import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import * as sass from 'sass';

function messages(locale) {
  const source = readFileSync(
    new URL('../src/i18n/messages/' + locale + '.ts', import.meta.url),
    'utf8',
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const context = { exports: {} };
  vm.runInNewContext(outputText, context);
  return context.exports[locale];
}
function keys(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object'
      ? keys(value, prefix + key + '.')
      : [prefix + key],
  );
}
const reference = messages('ru');
for (const locale of ['ru', 'ky', 'en']) {
  const dictionary = messages(locale);
  assert.deepEqual(
    keys(dictionary).sort(),
    keys(reference).sort(),
    locale + ': translation keys must match',
  );
  for (const section of Object.values(dictionary))
    for (const value of Object.values(section)) {
      assert.equal(typeof value, 'string');
      assert.ok(value.trim().length > 0, locale + ': empty translation');
      assert.ok(!value.includes('\uFFFD'), locale + ': damaged Unicode');
    }
  console.log(locale + ': all translation keys and Unicode verified');
}
const css = sass.compile(
  fileURLToPath(new URL('../src/styles/_variables.scss', import.meta.url)),
).css;
const blocks = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)];
const tokens = {};
function luminance(hex) {
  const raw = hex.replace('#', '');
  const expanded =
    raw.length === 3
      ? raw
          .split('')
          .map((x) => x + x)
          .join('')
      : raw;
  const rgb = [0, 2, 4]
    .map((i) => parseInt(expanded.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
const pairs = [
  ['text', 'bg'],
  ['muted', 'bg'],
  ['text', 'surface'],
  ['muted', 'surface'],
  ['on-primary', 'primary'],
  ...['primary', 'success', 'warning', 'danger', 'info'].map((tone) => [
    tone,
    tone + '-soft',
  ]),
];
for (const [, selector, body] of blocks) {
  for (const [, name, value] of body.matchAll(
    /--color-([\w-]+):\s*(#[\da-fA-F]+)\s*;/g,
  ))
    tokens[name] = value;
  if (!selector.includes('data-theme')) continue;
  const theme = selector.includes('dark') ? 'dark' : 'light';
  for (const [foreground, background] of pairs) {
    const ratio = contrast(tokens[foreground], tokens[background]);
    assert.ok(
      ratio >= 4.5,
      theme +
        ': ' +
        foreground +
        '/' +
        background +
        ' contrast is ' +
        ratio.toFixed(2),
    );
  }
  console.log(theme + ': ' + pairs.length + ' semantic text pairs meet 4.5:1');
}
console.log(
  'Design system static checks passed. This does not replace browser interaction or viewport checks.',
);
