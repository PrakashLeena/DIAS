'use client';

// Small reusable form pieces for the Admin Panel.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const uid = () => Math.random().toString(36).slice(2, 9);
export const blankL = () => ({ ta: '', en: '' });

export async function apiJson(url, options) {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details = Array.isArray(data.details) ? ` (${data.details.slice(0, 3).map((d) => `${d.path}: ${d.message}`).join('; ')})` : '';
    throw new Error(`${typeof data.error === 'string' ? data.error : 'Request failed'}${details}`);
  }
  return data;
}

/** Uploads one image (to Cloudinary when configured, otherwise /public/uploads in local dev) and returns its URL. */
export async function uploadImage(file) {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name}: please choose an image file`);
  if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name}: file is larger than 10 MB`);
  const target = await apiJson('/api/admin/upload');
  const form = new FormData();
  if (target.provider === 'cloudinary') for (const [k, v] of Object.entries(target.fields)) form.append(k, v);
  form.append('file', file);
  const res = await fetch(target.uploadUrl, { method: 'POST', body: form, credentials: target.provider === 'local' ? 'same-origin' : 'omit' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Upload failed');
  return data.secure_url || data.url;
}

export function BiInput({ label, value, onChange, textarea = false, rows = 3, placeholder = '', disabled = false }) {
  const Tag = textarea ? 'textarea' : 'input';
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  return (
    <fieldset className="min-w-0">
      {label && <legend className="field-label">{label}</legend>}
      <div className="grid gap-2 sm:grid-cols-2">
        <Tag className="field" rows={textarea ? rows : undefined} value={value.ta} onChange={set('ta')} placeholder={`தமிழ்${placeholder ? ' – ' + placeholder : ''}`} lang="ta" disabled={disabled} aria-label={`${label || ''} Tamil`} />
        <Tag className="field" rows={textarea ? rows : undefined} value={value.en} onChange={set('en')} placeholder={`English${placeholder ? ' – ' + placeholder : ''}`} lang="en" disabled={disabled} aria-label={`${label || ''} English`} />
      </div>
    </fieldset>
  );
}

export function Check({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[14px] text-ink-900">
      <input type="checkbox" className="h-4 w-4 accent-[#8E1B3A]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  );
}

/** Photo thumbnail with Upload / Replace and Remove buttons. */
export function ImageField({ value, onChange, emoji = '📷', label, compact = false, showRemove = true }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);

  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="min-w-0">
      {label && <span className="field-label">{label}</span>}
      <div className={`flex flex-col gap-2.5 ${compact ? '' : 'sm:flex-row sm:items-start'}`}>
        {value ? (
          <button
            type="button"
            onClick={() => setPreview(true)}
            title="Click to view the full photo"
            aria-label="View full photo"
            className={`group relative grid shrink-0 place-items-center overflow-hidden rounded-lg border bg-[#F3EDE2] ${compact ? 'aspect-[4/3] w-full' : 'aspect-[4/3] w-full sm:aspect-auto sm:h-32 sm:w-44'}`}
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-full w-full object-contain" decoding="async" />
            <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[11.5px] font-medium text-white opacity-90 group-hover:opacity-100" aria-hidden>
              🔍 View
            </span>
          </button>
        ) : (
          <div className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border bg-champagne-100 ${compact ? 'aspect-[4/3] w-full' : 'aspect-[4/3] w-full sm:aspect-auto sm:h-32 sm:w-44'}`} style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-3xl opacity-70" aria-hidden>{emoji}</span>
          </div>
        )}
        <div className={`flex gap-2 ${compact ? '' : 'sm:flex-col sm:items-stretch'}`}>
          <button type="button" className="btn btn-secondary btn-sm min-w-0 flex-1 whitespace-nowrap sm:flex-none" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}
          </button>
          {value && showRemove && (
            <button type="button" className="btn btn-danger btn-sm min-w-0 flex-1 sm:flex-none" onClick={() => onChange('')} disabled={busy}>
              Remove
            </button>
          )}
        </div>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => pick(e.target.files?.[0])} />
      {error && <p className="mt-1 text-[12.5px] text-[#B3122E]">{error}</p>}
      {preview && <ImagePreview src={value} onClose={() => setPreview(false)} />}
    </div>
  );
}

/** Full-screen photo viewer (click outside / ✕ / Esc to close). */
export function ImagePreview({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  if (!src || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-3 bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Photo preview" onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-3" onClick={(e) => e.stopPropagation()} />
      <a href={src} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/15 px-4 py-1.5 text-[13px] text-white hover:bg-white/25" onClick={(e) => e.stopPropagation()}>
        Open full size ↗
      </a>
      <button type="button" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xl text-white hover:bg-white/25" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>,
    document.body,
  );
}

/**
 * "⋯" dropdown that holds the less-used / destructive actions.
 * items: [{ label, onClick?, href?, danger?, disabled?, hidden? }]
 */
export function MoreMenu({ items, label = 'More actions', tone = 'light' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const root = useRef(null);
  const menu = useRef(null);

  // The menu is rendered in a portal with fixed positioning, so a parent card's
  // overflow:hidden can never clip it. It opens upward when there is no room below.
  const place = () => {
    const r = root.current?.getBoundingClientRect();
    if (!r) return;
    const w = 208;
    const h = menu.current?.offsetHeight || 200;
    const below = window.innerHeight - r.bottom;
    const up = below < h + 12 && r.top > below;
    const left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8));
    setPos(up ? { left, bottom: window.innerHeight - r.top + 6 } : { left, top: r.bottom + 6 });
  };

  useLayoutEffect(() => {
    if (open) place();
    else setPos(null);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (root.current?.contains(e.target) || menu.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = items.filter((i) => !i.hidden);
  const cls = 'block w-full px-3.5 py-2 text-left text-[14px] disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className={`grid h-9 w-9 place-items-center rounded-lg border text-lg leading-none ${tone === 'dark' ? 'border-white/30 text-[#FFF8EC] hover:bg-white/10' : 'bg-white text-ink-700 hover:bg-champagne-100'}`}
        style={tone === 'dark' ? undefined : { borderColor: 'var(--border-strong)' }}
      >
        <span aria-hidden>⋯</span>
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <ul
          ref={menu}
          role="menu"
          className="fixed z-[70] w-52 overflow-hidden rounded-xl border bg-white py-1 text-ink-900 shadow-3"
          style={{ borderColor: 'var(--border-subtle)', ...(pos || { top: 0, left: 0, visibility: 'hidden' }) }}
        >
          {visible.map((it, i) => (
            <li key={it.label} role="none" className={it.danger && i > 0 ? 'mt-1 border-t pt-1' : undefined} style={it.danger ? { borderColor: 'var(--border-subtle)' } : undefined}>
              {it.href ? (
                <a role="menuitem" href={it.href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:bg-champagne-100`} onClick={() => setOpen(false)}>
                  {it.label}
                </a>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  disabled={it.disabled}
                  className={`${cls} ${it.danger ? 'text-[#B3122E] hover:bg-[#FBE7EA]' : 'hover:bg-champagne-100'}`}
                  onClick={() => {
                    setOpen(false);
                    it.onClick?.();
                  }}
                >
                  {it.label}
                </button>
              )}
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </div>
  );
}

/** Collapsible section (progressive disclosure). */
export function Disclosure({ title, hint, defaultOpen = false, children }) {
  return (
    <details open={defaultOpen || undefined} className="group rounded-xl border bg-white" style={{ borderColor: 'var(--border-subtle)' }}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[15px] font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
        <span>
          {title}
          {hint && <span className="ml-2 text-[13px] font-normal text-ink-500">{hint}</span>}
        </span>
        <span className="text-ink-500 transition-transform group-open:rotate-180" aria-hidden>▾</span>
      </summary>
      <div className="border-t px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
        {children}
      </div>
    </details>
  );
}

export const move = (arr, i, d) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};
