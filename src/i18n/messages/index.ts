import { en } from './en';
import { ky } from './ky';
import { ru, type Messages } from './ru';
import type { Locale } from '../config';
export const messages: Record<Locale, Messages> = { en, ky, ru };
