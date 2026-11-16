'use client';

// Small shared building blocks for the admin dashboard.
import { useCallback, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';

export async function apiFetch(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
  return data;
}

/** Formats a server error, including field-level Zod issues. */
export function errorText(err, t) {
  if (!err) return '';
  const details = err.data?.details;
  if (Array.isArray(details) && details.length) return `${err.message}: ${details.map((d) => `${d.path} — ${d.message}`).join('; ')}`;
  return err.message || t?.common?.error || 'Error';
}

export function useAsync() {
  const [state, setState] = useState({ loading: false, error: '', ok: '' });
  const run = useCallback(async (fn, okMsg = '') => {
    setState({ loading: true, error: '', ok: '' });
    try {
      const r = await fn();
      setState({ loading: false, error: '', ok: okMsg });
      if (okMsg) setTimeout(() => setState((s) => (s.ok === okMsg ? { ...s, ok: '' } : s)), 2500);
      return r;
    } catch (err) {
      setState({ loading: false, error: errorText(err), ok: '' });
      throw err;
    }
  }, []);
  return [state, run, setState];
}

export function Card({ title, actions, children, className = '' }) {
  return (
    <section className={`rounded-lg border bg-white shadow-1 ${className}`} style={{ borderColor: 'var(--border-subtle)' }}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          {title && <h2 className="font-sans text-[16px] font-semibold text-ink-900">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageTitle({ title, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-sans text-[24px] font-semibold text-ink-900 [:lang(ta)_&]:text-[21px]">{title}</h1>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled, id }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2.5 ${disabled ? 'opacity-50' : ''}`} htmlFor={id}>
      <span className="relative inline-flex">
        <input id={id} type="checkbox" className="peer sr-only" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-ink-300/50 transition-colors peer-checked:bg-success peer-focus-visible:ring-4 peer-focus-visible:ring-gold-500/40" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      {label && <span className="text-[14px] text-ink-700">{label}</span>}
    </label>
  );
}

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <div className={className}>
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

/** Tamil + English inputs side by side. `register` is from react-hook-form (or pass value/onChange). */
export function BilingualField({ label, name, register, multiline = false, rows = 3, required = false, errors, value, onChange, maxLength }) {
  const { t } = useAdmin();
  const Comp = multiline ? 'textarea' : 'input';
  const props = (lang) =>
    register
      ? register(`${name}.${lang}`)
      : { value: value?.[lang] || '', onChange: (e) => onChange({ ...(value || {}), [lang]: e.target.value }) };
  const err = (lang) => errors?.[lang]?.message;
  return (
    <fieldset>
      <legend className="field-label">
        {label} {required && <span className="text-danger">*</span>}
      </legend>
      <div className="grid gap-3 md:grid-cols-2">
        {['ta', 'en'].map((lang) => (
          <div key={lang}>
            <div className="relative">
              <span className="pointer-events-none absolute right-2 top-2 rounded bg-champagne-100 px-1.5 text-[10.5px] font-semibold text-ink-500">{lang === 'ta' ? 'TA' : 'EN'}</span>
              <Comp lang={lang} rows={multiline ? rows : undefined} maxLength={maxLength} className="field !pr-10" placeholder={lang === 'ta' ? t.common.tamil : t.common.english} {...props(lang)} />
            </div>
            {err(lang) && <p className="field-error">{err(lang)}</p>}
          </div>
        ))}
      </div>
    </fieldset>
  );
}

export function Alert({ kind = 'error', children }) {
  if (!children) return null;
  const cls = kind === 'error' ? 'bg-danger/10 text-danger' : kind === 'ok' ? 'bg-success/10 text-success' : 'bg-champagne-100 text-ink-700';
  return (
    <p className={`rounded-md px-3 py-2 text-[14px] ${cls}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
