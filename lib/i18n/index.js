import ta from './dictionaries/ta.js';
import en from './dictionaries/en.js';
import { DEFAULT_LOCALE, isLocale } from './config.js';

const dictionaries = { ta, en };

export function getDictionary(lang) {
  return dictionaries[isLocale(lang) ? lang : DEFAULT_LOCALE];
}

export * from './config.js';
