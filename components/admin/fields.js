'use client';

// Small reusable form pieces for the Admin Panel.
import { useRef, useState } from 'react';

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
export function ImageField({ value, onChange, emoji = '📷', label, compact = false }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
      <div className={`flex gap-2.5 ${compact ? 'flex-col' : 'items-start'}`}>
        <div className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border bg-champagne-100 ${compact ? 'h-24 w-full' : 'h-24 w-32'}`} style={{ borderColor: 'var(--border-subtle)' }}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="text-3xl opacity-70" aria-hidden>{emoji}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? '⏳ …' : value ? '🔄 Replace' : '⬆ Upload'}
          </button>
          {value && (
            <button type="button" className="btn btn-danger btn-sm" onClick={() => onChange('')} disabled={busy}>
              Remove
            </button>
          )}
        </div>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => pick(e.target.files?.[0])} />
      {error && <p className="mt-1 text-[12.5px] text-[#B3122E]">{error}</p>}
    </div>
  );
}

export const move = (arr, i, d) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};
