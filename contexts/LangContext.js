'use client';

import { createContext, useContext } from 'react';
import { localePath } from '@/lib/i18n/config';

const LangContext = createContext({ lang: 'ta', dict: {}, settings: {} });

export function LangProvider({ lang, dict, settings, children }) {
  return <LangContext.Provider value={{ lang, dict, settings }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  return { ...ctx, href: (path) => localePath(ctx.lang, path) };
}
