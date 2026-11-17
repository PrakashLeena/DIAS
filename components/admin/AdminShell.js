'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, ClipboardList, Inbox, Users, Package, Tags, Boxes, Warehouse, Settings, Search, LogOut, ExternalLink, Menu, X, Languages, Box } from 'lucide-react';
import { AdminProvider } from '@/contexts/AdminContext';
import { adminDictionaries, ADMIN_LANG_COOKIE } from '@/lib/i18n/admin';

const NAV = [
  ['/admin', 'dashboard', LayoutDashboard],
  ['/admin/orders', 'orders', ClipboardList],
  ['/admin/enquiries', 'enquiries', Inbox],
  ['/admin/customers', 'customers', Users],
  ['/admin/products', 'products', Boxes],
  ['/admin/categories', 'categories', Tags],
  ['/admin/packages', 'packages', Package],
  ['/admin/inventory', 'inventory', Warehouse],
  ['/admin/stage-design', 'stageDesign', Box],
  ['/admin/settings', 'settings', Settings],
  ['/admin/seo', 'seo', Search],
];

export default function AdminShell({ lang, admin, currency, companyName, pendingCount = 0, newEnquiries = 0, children }) {
  const t = adminDictionaries[lang];
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));
  const switchLang = () => {
    document.cookie = `${ADMIN_LANG_COOKIE}=${lang === 'ta' ? 'en' : 'ta'}; path=/admin; max-age=31536000; samesite=lax`;
    router.refresh();
  };
  const logout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  const nav = (
    <nav className="flex flex-col gap-0.5 p-3" aria-label="Admin">
      {NAV.map(([href, key, Icon]) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[14.5px] transition-colors ${isActive(href) ? 'bg-gold-500/15 text-gold-300' : 'text-[color:var(--text-on-dark-muted)] hover:bg-white/5 hover:text-white'}`}
          aria-current={isActive(href) ? 'page' : undefined}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden />
          <span className="flex-1">{t.nav[key]}</span>
          {key === 'orders' && pendingCount > 0 && <span className="rounded-full bg-warning px-2 text-[11px] font-semibold text-ink-900">{pendingCount}</span>}
          {key === 'enquiries' && newEnquiries > 0 && <span className="rounded-full bg-warning px-2 text-[11px] font-semibold text-ink-900">{newEnquiries}</span>}
        </Link>
      ))}
    </nav>
  );

  return (
    <AdminProvider value={{ lang, t, currency }}>
      <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
        <aside className="hidden flex-col bg-ink-900 lg:sticky lg:top-0 lg:flex lg:h-screen">
          <div className="border-b px-5 py-5" style={{ borderColor: 'rgba(255,232,190,.12)' }}>
            <p className="font-display text-[22px] font-semibold leading-tight text-flame-200">{companyName}</p>
            <p className="text-[12px] text-[color:var(--text-on-dark-muted)]">{t.brand}</p>
          </div>
          <div className="flex-1 overflow-y-auto">{nav}</div>
          <div className="border-t p-3 text-[13px] text-[color:var(--text-on-dark-muted)]" style={{ borderColor: 'rgba(255,232,190,.12)' }}>
            <p className="truncate px-3 pb-2">{admin.email}</p>
            <Link href="/" target="_blank" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-white/5">
              <ExternalLink className="h-4 w-4" /> {t.nav.viewSite}
            </Link>
            <button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-white/5">
              <LogOut className="h-4 w-4" /> {t.nav.logout}
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white/90 px-4 backdrop-blur sm:px-6" style={{ borderColor: 'var(--border-subtle)' }}>
            <button type="button" className="rounded-md p-2 hover:bg-champagne-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-medium text-ink-900 lg:hidden">{companyName}</span>
            <span className="flex-1" />
            <button type="button" onClick={switchLang} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] hover:bg-champagne-100" style={{ borderColor: 'var(--border-strong)' }}>
              <Languages className="h-4 w-4" /> {lang === 'ta' ? 'English' : 'தமிழ்'}
            </button>
            <button type="button" onClick={logout} className="rounded-full p-2 hover:bg-champagne-100 lg:hidden" aria-label={t.nav.logout}>
              <LogOut className="h-4 w-4" />
            </button>
          </header>
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-900/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-ink-900">
            <div className="flex items-center justify-between px-5 py-4">
              <p className="font-display text-xl text-flame-200">{companyName}</p>
              <button type="button" onClick={() => setOpen(false)} className="text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            <Link href="/" target="_blank" className="mx-3 flex items-center gap-2 rounded-md px-3 py-2 text-[14px] text-[color:var(--text-on-dark-muted)]">
              <ExternalLink className="h-4 w-4" /> {t.nav.viewSite}
            </Link>
          </div>
        </div>
      )}
    </AdminProvider>
  );
}
