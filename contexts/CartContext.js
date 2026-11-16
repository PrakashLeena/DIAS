'use client';

// Order basket for guests (no account needed). Stored in localStorage until the
// order is submitted. The snapshot is for display only — the server re-prices
// every item and re-checks availability when the order is placed.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'wd_cart_v1';
const CartContext = createContext(null);

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (data && Array.isArray(data.items)) return data;
  } catch {}
  return { items: [], source: 'cart' };
}

export function CartProvider({ children }) {
  const [state, setState] = useState({ items: [], source: 'cart' });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
    const onStorage = (e) => e.key === STORAGE_KEY && setState(load());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  /** item: { type:'product'|'package', id, quantity, snapshot:{ name, price, pricingUnit, image, slug, minQty } } */
  const addItem = useCallback((item, { source } = {}) => {
    setState((s) => {
      const idx = s.items.findIndex((i) => i.type === item.type && i.id === item.id);
      const items = [...s.items];
      if (idx >= 0) items[idx] = { ...items[idx], quantity: items[idx].quantity + item.quantity, snapshot: item.snapshot || items[idx].snapshot };
      else items.push(item);
      return { items, source: source || s.source };
    });
  }, []);

  const setQuantity = useCallback((type, id, quantity) => {
    setState((s) => ({
      ...s,
      items: s.items
        .map((i) => (i.type === type && i.id === id ? { ...i, quantity: Math.max(0, Math.min(10000, Math.floor(quantity) || 0)) } : i))
        .filter((i) => i.quantity > 0),
    }));
  }, []);

  const removeItem = useCallback((type, id) => setState((s) => ({ ...s, items: s.items.filter((i) => !(i.type === type && i.id === id)) })), []);
  const clear = useCallback(() => setState({ items: [], source: 'cart' }), []);
  const setSource = useCallback((source) => setState((s) => ({ ...s, source })), []);
  /** Replaces the basket's products with a package's contents (Customize This Package). */
  const loadPackageContents = useCallback((products) => {
    setState((s) => {
      const items = s.items.filter((i) => i.type === 'product');
      for (const p of products) {
        const idx = items.findIndex((i) => i.id === p.id);
        if (idx >= 0) items[idx] = { ...items[idx], quantity: items[idx].quantity + p.quantity };
        else items.push({ type: 'product', id: p.id, quantity: p.quantity, snapshot: p.snapshot });
      }
      return { items: [...s.items.filter((i) => i.type === 'package'), ...items], source: 'builder' };
    });
  }, []);

  const value = useMemo(() => {
    const count = state.items.reduce((n, i) => n + (i.type === 'package' ? 1 : 1), 0);
    const estimate = state.items.reduce((sum, i) => sum + (i.snapshot?.price || 0) * i.quantity, 0);
    return { ...state, hydrated, count, estimate, addItem, setQuantity, removeItem, clear, setSource, loadPackageContents };
  }, [state, hydrated, addItem, setQuantity, removeItem, clear, setSource, loadPackageContents]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
