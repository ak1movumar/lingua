import { readFileSync, writeFileSync } from 'node:fs';
const spec = JSON.parse(readFileSync('docs/openapi.json', 'utf8'));
const names = [
  'LanguageCreate',
  'CourseCreate',
  'LessonCreate',
  'ExerciseCreate',
  'AchievementCreate',
  'ChallengeCreate',
];
const resolve = (schema) =>
  schema.$ref
    ? resolve(spec.components.schemas[schema.$ref.split('/').at(-1)])
    : schema;
const result = Object.fromEntries(
  names.map((name) => [
    name,
    Object.entries(spec.components.schemas[name].properties).map(
      ([key, raw]) => {
        const schema = resolve(
          raw.anyOf?.find((x) => x.type !== 'null') ?? raw,
        );
        return {
          key,
          type: schema.type ?? 'json',
          required:
            spec.components.schemas[name].required?.includes(key) ?? false,
          ...(schema.enum ? { choices: schema.enum } : {}),
          ...(schema.format ? { format: schema.format } : {}),
          ...(schema.default !== undefined ? { initial: schema.default } : {}),
        };
      },
    ),
  ]),
);
writeFileSync(
  'src/features/admin/fields.json',
  JSON.stringify(result, null, 2) + '\n',
);
