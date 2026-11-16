'use client';

import { useCallback } from 'react';
import { useLang } from '@/contexts/LangContext';
import { formatMoney } from '@/utils/format';

export default function useMoney() {
  const { settings } = useLang();
  return useCallback((n) => formatMoney(n, settings?.currency), [settings?.currency]);
}
