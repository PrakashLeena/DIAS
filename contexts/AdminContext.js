'use client';

import { createContext, useContext } from 'react';

const AdminContext = createContext({ lang: 'ta', t: {}, currency: { code: 'LKR', symbol: 'Rs.' } });

export function AdminProvider({ value, children }) {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export const useAdmin = () => useContext(AdminContext);
