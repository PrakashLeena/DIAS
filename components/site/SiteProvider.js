'use client';

// Shared client state: site content (categories/contact) + the customer's selection list
// ("inquiry cart"), persisted in localStorage so it survives page changes and reloads.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);
const STORAGE_KEY = 'wd-selection-v2';

export function SiteProvider({ content, children }) {
  const [lines, setLines] = useState([]);
  const [ready, setReady] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) setLines(saved.filter((l) => l && l.key && l.qty > 0));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const setLine = useCallback((line) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.key === line.key);
      if (line.qty <= 0) return prev.filter((l) => l.key !== line.key);
      if (i === -1) return [...prev, line];
      const next = prev.slice();
      next[i] = { ...prev[i], ...line };
      return next;
    });
  }, []);
  const removeLine = useCallback((key) => setLines((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({
      content,
      categories: content.categories,
      contact: content.contact,
      site: content.site,
      lines,
      ready,
      setLine,
      removeLine,
      clear,
      qtyOf: (key) => lines.find((l) => l.key === key)?.qty || 0,
      sheetOpen,
      setSheetOpen,
      note,
      setNote,
    }),
    [content, lines, ready, setLine, removeLine, clear, sheetOpen, note]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSite must be used inside <SiteProvider>');
  return v;
}
