'use client';

// Uploads images/videos straight to Cloudinary using a server-signed request
// (or to /public/uploads in local development) and manages a list of URLs.
import { useRef, useState } from 'react';
import { Upload, Loader2, X, ArrowLeft, Link2, Film } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch } from './ui';

export async function uploadFile(file) {
  const target = await apiFetch('/api/admin/upload');
  const form = new FormData();
  if (target.provider === 'cloudinary') {
    for (const [k, v] of Object.entries(target.fields)) form.append(k, v);
  }
  form.append('file', file);
  const res = await fetch(target.uploadUrl, { method: 'POST', body: form, credentials: target.provider === 'local' ? 'same-origin' : 'omit' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Upload failed');
  return data.secure_url || data.url;
}

export default function ImageUploader({ value = [], onChange, multiple = true, accept = 'image/*', max = 12, label }) {
  const { t } = useAdmin();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const list = multiple ? value : value ? [value].flat().filter(Boolean) : [];
  const set = (arr) => onChange(multiple ? arr : arr[arr.length - 1] || '');

  const onFiles = async (files) => {
    setError('');
    setBusy(true);
    try {
      const uploaded = [];
      for (const f of [...files].slice(0, max - (multiple ? list.length : 0))) {
        if (f.size > (f.type.startsWith('video/') ? 100 : 10) * 1024 * 1024) throw new Error(`${f.name}: file too large`);
        uploaded.push(await uploadFile(f));
      }
      set(multiple ? [...list, ...uploaded] : uploaded);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const addUrl = () => {
    const v = url.trim();
    if (!v || !(v.startsWith('/') || v.startsWith('https://'))) return;
    set(multiple ? [...list, v] : [v]);
    setUrl('');
  };

  const isVideo = (u) => /\.(mp4|webm)(\?|$)/i.test(u) || u.includes('/video/');

  return (
    <div>
      {label && <span className="field-label">{label}</span>}
      <div className="flex flex-wrap gap-3">
        {list.map((u, i) => (
          <div key={u + i} className="group relative h-24 w-28 overflow-hidden rounded-md border bg-champagne-100" style={{ borderColor: 'var(--border-subtle)' }}>
            {isVideo(u) ? (
              <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] text-ink-500">
                <Film className="h-6 w-6" /> video
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u} alt="" className="h-full w-full object-cover" loading="lazy" />
            )}
            {i === 0 && multiple && list.length > 1 && <span className="absolute bottom-1 left-1 rounded bg-ink-900/70 px-1.5 text-[10px] text-white">1</span>}
            <div className="absolute right-1 top-1 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
              {multiple && i > 0 && (
                <button type="button" onClick={() => set([...list.slice(0, i - 1), u, list[i - 1], ...list.slice(i + 1)])} className="rounded bg-white/90 p-1 shadow" aria-label="Move left">
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
              )}
              <button type="button" onClick={() => set(list.filter((_, k) => k !== i))} className="rounded bg-white/90 p-1 text-danger shadow" aria-label={t.common.remove}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {(multiple ? list.length < max : true) && (
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="flex h-24 w-28 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed text-[12px] text-ink-500 hover:bg-champagne-100" style={{ borderColor: 'var(--border-strong)' }}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            {busy ? t.common.uploading : t.common.upload}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => e.target.files?.length && onFiles(e.target.files)} />
      <div className="mt-2 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… or /images/…" className="field !min-h-[38px] !py-1.5 !pl-9 text-[13px]" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())} />
        </div>
        <button type="button" onClick={addUrl} className="btn btn-secondary btn-sm">
          {t.common.addUrl}
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
