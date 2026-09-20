import { z } from 'zod';
export type Field = {
  key: string;
  type: string;
  required: boolean;
  choices?: string[];
  format?: string;
  initial?: unknown;
};
export const rowSchema = z
  .object({ id: z.union([z.number().int(), z.string()]) })
  .catchall(z.unknown());
export type Row = z.infer<typeof rowSchema>;
export function buildPayload(
  fields: Field[],
  values: Record<string, string>,
  editing: boolean,
) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = values[field.key] ?? '';
    if (editing && field.key === 'correct_answer' && raw === '') continue;
    if (raw === '') {
      if (field.required) throw new Error('Required');
      else continue;
    }
    let value: unknown = raw;
    if (field.format === 'date' && !z.iso.date().safeParse(raw).success)
      throw new Error('Invalid date');
    if (field.type === 'integer' && raw.trim() === '')
      throw new Error('Invalid number');
    if (field.type === 'integer')
      value = z.number().int().safeParse(Number(raw)).success
        ? Number(raw)
        : undefined;
    if (field.type === 'boolean')
      value = raw === 'true' ? true : raw === 'false' ? false : undefined;
    if (field.type === 'object' || field.type === 'json') {
      value = JSON.parse(raw);
      if (
        field.type === 'object' &&
        ((value === null && field.required) ||
          Array.isArray(value) ||
          typeof value !== 'object')
      )
        throw new Error('Object expected');
    }
    if (value === undefined || (field.choices && !field.choices.includes(raw)))
      throw new Error('Invalid value');
    payload[field.key] = value;
  }
  return payload;
}
